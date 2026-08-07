import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { apiClient } from "../lib/apiClient";
import { normalizeProject, NormalizedProject } from "../lib/schemaNormalizer";

export type ProjectQuote = {
  id: string;
  packageName: string;
  priceAmount: number;
  currency: string;
  depositPercentage: number;
  deliverables?: string[];
  status?: string;
};

export type ProjectData = NormalizedProject;

export interface ProjectContextType {
  project: ProjectData | null;
  isLoading: boolean;
  error: string | null;
  portalAccess: boolean;
  refreshProject: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  console.log(`[TIMING] ${performance.now().toFixed(2)}ms - 6. ProjectProvider started (authLoading: ${authLoading}, isLoading: ${isLoading}, user: ${user ? user.id : 'null'})`);

  const fetchProject = useCallback(async () => {
    if (!user) {
      setProject(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const startTime = performance.now();
    console.log(`[TIMING] ${startTime.toFixed(2)}ms - 7. Project fetch started for userId=${user.id}`);

    setIsLoading(true);
    setError(null);

    try {
      const emailParam = encodeURIComponent(user.email || "");
      const res = await apiClient<{ success: boolean; projects?: ProjectData[]; data?: ProjectData[] }>(
        `/api/projects?userId=${user.id}&email=${emailParam}`
      );

      const endTime = performance.now();
      console.log(`[TIMING] ${endTime.toFixed(2)}ms - 8. Project fetch finished (took ${(endTime - startTime).toFixed(2)}ms)`);

      const rawProjectsList = res.projects || res.data || [];
      const projectsList = Array.isArray(rawProjectsList) ? rawProjectsList.map(normalizeProject) : [];
      
      if (projectsList.length > 0) {
        // Pick the primary active normalized project
        setProject(projectsList[0]);
      } else {
        setProject(null);
      }
    } catch (err: any) {
      const endTime = performance.now();
      console.log(`[TIMING] ${endTime.toFixed(2)}ms - 8. Project fetch finished WITH ERROR (took ${(endTime - startTime).toFixed(2)}ms):`, err);
      console.warn("[ProjectProvider] Failed to fetch project:", err);
      setError(err.message || "Failed to load project details.");
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setProject(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    fetchProject();
  }, [user, authLoading, fetchProject]);

  const portalAccess = useMemo(() => {
    if (!project) return false;
    return project.portalAccess === true;
  }, [project]);

  const value = useMemo<ProjectContextType>(
    () => ({
      project,
      isLoading: authLoading || isLoading,
      error,
      portalAccess,
      refreshProject: fetchProject,
    }),
    [project, authLoading, isLoading, error, portalAccess, fetchProject]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
