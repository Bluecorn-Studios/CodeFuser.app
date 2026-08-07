import React from "react";
import { useProject } from "../../context/ProjectContext";
import { AccessDenied } from "./AccessDenied";
import { Loader2 } from "lucide-react";

interface RequirePortalAccessProps {
  children: React.ReactNode;
}

export const RequirePortalAccess: React.FC<RequirePortalAccessProps> = ({ children }) => {
  const { project, portalAccess, isLoading } = useProject();

  console.log(`[TIMING] ${performance.now().toFixed(2)}ms - 10. RequirePortalAccess rendered (isLoading: ${isLoading}, portalAccess: ${portalAccess}, project: ${project ? project.id : 'null'})`);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4 font-sans">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          Verifying project authorization...
        </span>
      </div>
    );
  }

  if (!project) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
