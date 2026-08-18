import { safeLocalStorage } from "./safeStorage";

export interface PreviewSessionData {
  sessionId: string;
  previewToken: string;
  adminUserId?: string;
  adminEmail?: string;
  createdAt: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    businessName: string;
    role: "client";
  };
  projectId: string;
}

export function getPreviewToken(): string | null {
  try {
    return sessionStorage.getItem("codefuser_preview_token");
  } catch {
    return null;
  }
}

export function isPreviewActive(): boolean {
  return !!getPreviewToken();
}

export function getPreviewSessionData(): PreviewSessionData | null {
  try {
    const raw = sessionStorage.getItem("codefuser_preview_session");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setPreviewSession(session: PreviewSessionData) {
  try {
    sessionStorage.setItem("codefuser_preview_token", session.previewToken);
    sessionStorage.setItem("codefuser_preview_session", JSON.stringify(session));
    sessionStorage.setItem("codefuser_preview_project_id", session.projectId);
    
    // Also mirror to safeLocalStorage for auth context compatibility in preview
    safeLocalStorage.setItem("fuser_token", session.previewToken);
    safeLocalStorage.setItem("fuser_user", JSON.stringify(session.user));
    safeLocalStorage.setItem("fuser_client_project_id", session.projectId);
    safeLocalStorage.setItem("codefuser_current_project", session.projectId);
  } catch (err) {
    console.error("Failed to store preview session:", err);
  }
}

export function clearPreviewSession() {
  try {
    const token = getPreviewToken();
    if (token) {
      fetch("/api/admin/preview/exit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-preview-token": token
        },
        body: JSON.stringify({ previewToken: token })
      }).catch(() => {});
    }
    sessionStorage.removeItem("codefuser_preview_token");
    sessionStorage.removeItem("codefuser_preview_session");
    sessionStorage.removeItem("codefuser_preview_project_id");
    safeLocalStorage.removeItem("fuser_token");
    safeLocalStorage.removeItem("fuser_user");
    safeLocalStorage.removeItem("fuser_client_project_id");
    safeLocalStorage.removeItem("codefuser_current_project");
  } catch (err) {
    console.error("Failed to clear preview session:", err);
  }
}

/**
 * Initiates an Admin-authorized customer preview session.
 */
export async function startAdminPreviewSession(adminPassword?: string): Promise<{ success: boolean; session?: PreviewSessionData; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (adminPassword) {
      headers["x-admin-password"] = adminPassword;
    } else {
      const storedPw = sessionStorage.getItem("fuser_admin_password");
      if (storedPw) {
        headers["x-admin-password"] = storedPw;
      }
    }

    const res = await fetch("/api/admin/preview/start", {
      method: "POST",
      headers,
      body: JSON.stringify({ password: adminPassword })
    });

    const data = await res.json();
    if (res.ok && data.success && data.session) {
      setPreviewSession(data.session);
      return { success: true, session: data.session };
    }

    return { success: false, error: data.error || "Failed to start preview session." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to communicate with preview server." };
  }
}
