"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isSignedIn: false,
  isLoaded: false,
  signOut: async () => {},
  refresh: () => {},
});

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

function loadUserFromSources(): AppUser | null {
  if (typeof window === "undefined") return null;

  try {
    const kakao = getCookie("kakao_user");
    if (kakao) {
      const u = JSON.parse(decodeURIComponent(kakao));
      if (u?.id && u?.email) {
        return {
          id: u.id,
          email: u.email,
          name: u.name || "",
          phoneNumber: u.phoneNumber,
          profileImage: u.profileImage,
          signupMethod: "kakao",
        };
      }
    }
  } catch {}

  try {
    const naver = getCookie("naver_user");
    if (naver) {
      const u = JSON.parse(decodeURIComponent(naver));
      if (u?.id && u?.email) {
        return {
          id: u.id,
          email: u.email,
          name: u.name || "",
          phoneNumber: u.phoneNumber,
          profileImage: u.profileImage,
          signupMethod: "naver",
        };
      }
    }
  } catch {}

  if (
    document.cookie.includes("isLoggedIn=true") ||
    localStorage.getItem("isLoggedIn") === "true"
  ) {
    const name = localStorage.getItem("userName") || "";
    const email = localStorage.getItem("userEmail") || "";
    const phone = localStorage.getItem("userPhone") || "";
    const id = localStorage.getItem("userId") || "";
    if (email || id) {
      return { id, email, name, phoneNumber: phone, signupMethod: "email" };
    }
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setUser(loadUserFromSources());
  }, []);

  useEffect(() => {
    refresh();
    setIsLoaded(true);
  }, [refresh]);

  const signOut = useCallback(async () => {
    removeCookie("kakao_user");
    removeCookie("naver_user");
    removeCookie("isLoggedIn");
    removeCookie("userType");
    removeCookie("accessToken");
    removeCookie("access_token");
    removeCookie("snsAccessToken");
    removeCookie("factory_user");
    try {
      localStorage.removeItem("userType");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userPhone");
      localStorage.removeItem("userId");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("factoryAuth");
    } catch {}
    setUser(null);
    window.location.href = "/";
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
