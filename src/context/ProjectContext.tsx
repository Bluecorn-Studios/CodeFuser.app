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
  projects: ProjectData[];
  isLoading: boolean;
  error: string | null;
  portalAccess: boolean;
  refreshProject: () => Promise<void>;
  selectProject: (projectId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  console.log(`[TRACING] ProjectProvider rendered | timestamp: ${new Date().toISOString()} | authLoading: ${authLoading} | projectLoading: ${isLoading} | user: ${user ? user.id : 'null'}`);

  const updateIsLoading = useCallback((val: boolean, caller: string) => {
    console.log(`[TRACING] ProjectContext setIsLoading(${val}) called by ${caller} | timestamp: ${new Date().toISOString()}`);
    setIsLoading(val);
  }, []);

  const selectProject = useCallback((id: string) => {
    setSelectedProjectId(id);
    const found = projects.find(p => p.id === id);
    if (found) {
      setProject(found);
    }
  }, [projects]);

  const fetchProject = useCallback(async (isBackground: boolean = false) => {
    console.log("fetchProject started", { timestamp: new Date().toISOString(), isBackground });
    console.log("user", user);

    if (!user) {
      setProject(null);
      setProjects([]);
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

    if (!isBackground) {
      updateIsLoading(true, "fetchProject start");
    }
    setError(null);

    const timeoutId = setTimeout(() => {
      if (!isBackground) {
        console.warn("[ProjectProvider] fetchProject timed out after 4000ms, forcing isLoading = false");
        updateIsLoading(false, "fetchProject timeout");
      }
    }, 4000);

    try {
      // Direct fetch to log response status and raw body
      const startTime = performance.now();
      const res = await apiClient<{ success: boolean; projects?: ProjectData[]; data?: ProjectData[] }>(url);
      clearTimeout(timeoutId);
      const endTime = performance.now();

      console.log("response status", 200);
      console.log("response body", res);

      const rawProjectsList = res.projects || res.data || [];
      const projectsList = Array.isArray(rawProjectsList) ? rawProjectsList.map(normalizeProject) : [];
      
      setProjects(projectsList);
      if (projectsList.length > 0) {
        const current = selectedProjectId ? (projectsList.find(p => p.id === selectedProjectId) || projectsList[0]) : projectsList[0];
        setProject(current);
      } else {
        setProject(null);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.log("response status", err.status || "ERROR");
      console.log("response body", err.message || err);
      console.warn("[ProjectProvider] Failed to fetch project:", err);
      setError(err.message || "Failed to load project details.");
      if (!isBackground) {
        setProject(null);
        setProjects([]);
      }
    } finally {
      clearTimeout(timeoutId);
      if (!isBackground) {
        updateIsLoading(false, "fetchProject finally");
      }
      console.log("fetchProject finished");
    }
  }, [user, selectedProjectId, updateIsLoading]);

  useEffect(() => {
    console.log(`[TRACING] ProjectContext useEffect triggered | authLoading: ${authLoading} | user: ${user ? user.email : 'null'}`);
    if (authLoading) {
      updateIsLoading(true, "useEffect (authLoading is true)");
      return;
    }

    if (!user) {
      setProject(null);
      setProjects([]);
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

  const refreshProject = useCallback(async () => {
    return fetchProject(true);
  }, [fetchProject]);

  const value = useMemo<ProjectContextType>(
    () => ({
      project,
      projects,
      isLoading: authLoading || isLoading,
      error,
      portalAccess,
      refreshProject,
      selectProject,
    }),
    [project, projects, authLoading, isLoading, error, portalAccess, refreshProject, selectProject]
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
