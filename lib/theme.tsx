"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const THEME_STORAGE_KEY = "faddit-theme";

type ThemeContextValue = {
  dark: boolean;
  setDark: (next: boolean) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  dark: false,
  setDark: () => {},
  toggle: () => {},
});

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    /* private mode */
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDarkState] = useState(false);

  useEffect(() => {
    setDarkState(document.documentElement.classList.contains("dark"));
  }, []);

  const setDark = useCallback((next: boolean) => {
    setDarkState(next);
    applyTheme(next);
  }, []);

  const toggle = useCallback(() => {
    setDarkState((prev) => {
      const next = !prev;
      applyTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ dark, setDark, toggle }), [dark, setDark, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
