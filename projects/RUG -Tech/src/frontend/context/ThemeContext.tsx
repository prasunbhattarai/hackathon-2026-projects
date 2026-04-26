"use client";

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import { type ReactNode, useEffect, useState } from "react";

export type Theme = "dark" | "light";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="fundus-ai-theme"
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const { theme, setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  return {
    theme: (mounted ? (theme as Theme) : "dark") || "dark",
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    setTheme: (t: Theme) => setTheme(t),
    mounted,
  };
}
