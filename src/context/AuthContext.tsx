import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { setUnauthenticatedHandler } from "../lib/apiClient";
import { safeLocalStorage } from "../utils/safeStorage";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ user: User | null; session: Session | null }>;
  signUpWithEmail: (email: string, pass: string) => Promise<{ user: User | null; session: Session | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  console.log(`[TIMING] ${performance.now().toFixed(2)}ms - 2. AuthProvider started (isLoading: ${isLoading})`);

  // Sync state helper
  const updateAuthState = useCallback((newSession: Session | null) => {
    setSession(newSession);
    const currentUser = newSession?.user ?? null;
    setUser(currentUser);

    // Sync legacy storage keys for UI backward compatibility if needed, but never as auth authority
    if (currentUser && newSession) {
      safeLocalStorage.setItem("fuser_user", JSON.stringify({
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.user_metadata?.role || "customer",
      }));
      safeLocalStorage.setItem("fuser_token", newSession.access_token);
    } else {
      safeLocalStorage.removeItem("fuser_user");
      safeLocalStorage.removeItem("fuser_token");
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const startTime = performance.now();
    console.log(`[TIMING] ${startTime.toFixed(2)}ms - 3. getSession() started (via refreshSession)`);
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      const endTime = performance.now();
      console.log(`[TIMING] ${endTime.toFixed(2)}ms - 4. getSession() finished (took ${(endTime - startTime).toFixed(2)}ms)`);
      if (error) throw error;
      updateAuthState(currentSession);
    } catch (err) {
      console.warn("[AuthProvider] Session refresh warning:", err);
      updateAuthState(null);
    } finally {
      setIsLoading(false);
    }
  }, [updateAuthState]);

  // Initial session restoration and listener setup
  useEffect(() => {
    let mounted = true;

    // Register API client 401 unauthenticated callback
    setUnauthenticatedHandler(() => {
      if (mounted) {
        updateAuthState(null);
      }
    });

    async function initAuth() {
      const startTime = performance.now();
      console.log(`[TIMING] ${startTime.toFixed(2)}ms - 3. getSession() started`);
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        const endTime = performance.now();
        console.log(`[TIMING] ${endTime.toFixed(2)}ms - 4. getSession() finished (took ${(endTime - startTime).toFixed(2)}ms, session: ${initialSession ? 'found' : 'none'})`);
        if (mounted) {
          updateAuthState(initialSession);
        }
      } catch (err) {
        const endTime = performance.now();
        console.log(`[TIMING] ${endTime.toFixed(2)}ms - 4. getSession() finished WITH ERROR (took ${(endTime - startTime).toFixed(2)}ms):`, err);
        console.error("[AuthProvider] Failed to initialize live Supabase auth session:", err);
        if (mounted) {
          updateAuthState(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Subscribe to live auth state changes (sign in, sign out, token refresh, multi-tab sync)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log(`[TIMING] ${performance.now().toFixed(2)}ms - 5. onAuthStateChange fired (event: ${event}, session: ${newSession ? 'present' : 'null'})`);
      if (mounted) {
        updateAuthState(newSession);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  const signInWithEmail = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    const cleanEmail = (email || "").trim().toLowerCase();
    console.log("email:", cleanEmail);
    console.log("password.length:", pass.length);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: pass });
      if (error) {
        console.log("Full Supabase error:", error);
        throw error;
      }
      updateAuthState(data.session);
      return { user: data.user, session: data.session };
    } catch (err: any) {
      console.log("signInWithEmail caught error:", err);
      updateAuthState(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateAuthState]);

  const signUpWithEmail = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password: pass });
      if (error) throw error;
      updateAuthState(data.session);
      return { user: data.user, session: data.session };
    } catch (err: any) {
      updateAuthState(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateAuthState]);

  const signInWithGoogle = useCallback(async () => {
    const redirectUrl = `${window.location.origin}/login`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut().catch(() => {});
    } finally {
      updateAuthState(null);
      setIsLoading(false);
    }
  }, [updateAuthState]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      isLoading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      refreshSession,
    }),
    [user, session, isLoading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
