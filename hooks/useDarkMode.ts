"use client";

import { useState, useEffect, useCallback } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("medexpress-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored ? stored === "dark" : prefersDark;
    setIsDark(shouldBeDark);
    setIsLoaded(true);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("medexpress-theme", next ? "dark" : "light");
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  }, []);

  return { isDark, toggle, isLoaded };
}
