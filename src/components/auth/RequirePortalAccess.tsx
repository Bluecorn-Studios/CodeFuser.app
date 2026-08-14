import React from "react";
import { useProject } from "../../context/ProjectContext";
import { AccessDenied } from "./AccessDenied";

interface RequirePortalAccessProps {
  children: React.ReactNode;
}

export const RequirePortalAccess: React.FC<RequirePortalAccessProps> = ({ children }) => {
  const { project, isLoading } = useProject();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="h-9 w-9 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin mx-auto" />
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Loading Your Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
