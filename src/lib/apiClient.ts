import { supabase } from "./supabase";

export interface ApiClientOptions extends RequestInit {
  skipAuth?: boolean;
}

type UnauthenticatedHandler = () => void;
let globalUnauthenticatedHandler: UnauthenticatedHandler | null = null;

export function setUnauthenticatedHandler(handler: UnauthenticatedHandler) {
  globalUnauthenticatedHandler = handler;
}

/**
 * Centralized API client for all application requests.
 * Automatically injects the active Supabase JWT Bearer token into headers,
 * handles token refreshes, and intercepts 401 Unauthorized responses to trigger
 * safe global unauthenticated handlers (clearing session and redirecting to login).
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...restOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (!skipAuth) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
      // Also provide legacy headers for server backward compatibility
      headers["x-user-id"] = session.user.id;
      headers["x-user-email"] = session.user.email || "";
    }
  }

  let response = await fetch(endpoint, {
    ...restOptions,
    headers,
  });

  // Handle 401 Unauthorized globally
  if (response.status === 401 && !skipAuth) {
    console.warn(`[API Client] 401 Unauthorized encountered on ${endpoint}. Attempting session refresh...`);
    
    // Attempt token refresh with Supabase
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (!refreshError && refreshData.session?.access_token) {
      console.log(`[API Client] Session refreshed successfully. Retrying request...`);
      headers["Authorization"] = `Bearer ${refreshData.session.access_token}`;
      headers["x-user-id"] = refreshData.session.user.id;
      headers["x-user-email"] = refreshData.session.user.email || "";

      response = await fetch(endpoint, {
        ...restOptions,
        headers,
      });
    } else {
      console.error(`[API Client] Session refresh failed. Triggering unauthenticated cleanup.`);
      await supabase.auth.signOut().catch(() => {});
      if (globalUnauthenticatedHandler) {
        globalUnauthenticatedHandler();
      }
      throw new Error("Session expired. Please sign in again.");
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.error || data?.message || `API request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}
