"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  profileImage?: string;
  signupMethod?: string;
}

interface AuthContextType {
  user: AppUser | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isSignedIn: false,
  isLoaded: false,
  signOut: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await response.json();
      setUser(response.ok && data.authenticated && data.user ? data.user : null);
    } catch {
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setUser(null);
    window.location.assign("/");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!user, isLoaded, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAppAuth() {
  return useContext(AuthContext);
}
