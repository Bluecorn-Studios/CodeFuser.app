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

  console.log(`[TRACING] ProjectProvider rendered | timestamp: ${new Date().toISOString()} | authLoading: ${authLoading} | projectLoading: ${isLoading} | user: ${user ? user.id : 'null'}`);

  const updateIsLoading = useCallback((val: boolean, caller: string) => {
    console.log(`[TRACING] ProjectContext setIsLoading(${val}) called by ${caller} | timestamp: ${new Date().toISOString()}`);
    setIsLoading(val);
  }, []);

  const fetchProject = useCallback(async () => {
    console.log("fetchProject started", { timestamp: new Date().toISOString() });
    console.log("user", user);

    if (!user) {
      setProject(null);
      setError(null);
      updateIsLoading(false, "fetchProject (!user)");
      console.log("fetchProject finished (!user)");
      return;
    }

    const params = new URLSearchParams();
    if (user.id && user.id !== "undefined" && user.id !== "null") {
      params.append("userId", user.id);
    }
    if (user.email && user.email !== "undefined" && user.email !== "null") {
      params.append("email", user.email);
    }

    const queryString = params.toString();
    const url = `/api/projects${queryString ? `?${queryString}` : ''}`;
    console.log("calling /api/projects", url);

    updateIsLoading(true, "fetchProject start");
    setError(null);

    try {
      // Direct fetch to log response status and raw body
      const startTime = performance.now();
      const res = await apiClient<{ success: boolean; projects?: ProjectData[]; data?: ProjectData[] }>(url);
      const endTime = performance.now();

      console.log("response status", 200);
      console.log("response body", res);

      const rawProjectsList = res.projects || res.data || [];
      const projectsList = Array.isArray(rawProjectsList) ? rawProjectsList.map(normalizeProject) : [];
      
      if (projectsList.length > 0) {
        setProject(projectsList[0]);
      } else {
        setProject(null);
      }
    } catch (err: any) {
      console.log("response status", err.status || "ERROR");
      console.log("response body", err.message || err);
      console.warn("[ProjectProvider] Failed to fetch project:", err);
      setError(err.message || "Failed to load project details.");
      setProject(null);
    } finally {
      updateIsLoading(false, "fetchProject finally");
      console.log("fetchProject finished");
    }
  }, [user, updateIsLoading]);

  useEffect(() => {
    console.log(`[TRACING] ProjectContext useEffect triggered | authLoading: ${authLoading} | user: ${user ? user.email : 'null'}`);
    if (authLoading) {
      updateIsLoading(true, "useEffect (authLoading is true)");
      return;
    }

    if (!user) {
      setProject(null);
      setError(null);
      updateIsLoading(false, "useEffect (!user)");
      return;
    }

    fetchProject();
  }, [user, authLoading, fetchProject, updateIsLoading]);

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
