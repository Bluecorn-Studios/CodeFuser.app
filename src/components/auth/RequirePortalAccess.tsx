import React from "react";
import { useProject } from "../../context/ProjectContext";
import { AccessDenied } from "./AccessDenied";
import { Loader2 } from "lucide-react";

interface RequirePortalAccessProps {
  children: React.ReactNode;
}

export const RequirePortalAccess: React.FC<RequirePortalAccessProps> = ({ children }) => {
  return <>{children}</>;
};
