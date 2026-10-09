"use client";

import { useEffect } from "react";

const THEMES = new Set(["dark", "light", "pink", "ocean"]);

function normalizeTheme(value: string | null | undefined) {
  const normalized = value?.startsWith("theme-") ? value.slice(6) : value;
  return normalized && THEMES.has(normalized) ? normalized : "dark";
}

export default function ThemeProvider() {
  useEffect(() => {
    let active = true;
    const applyTheme = (value: string | null | undefined) => {
      const theme = normalizeTheme(value);
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme === "light" ? "light" : "dark";
    };
    const onThemeChange = (event: Event) => applyTheme((event as CustomEvent<string>).detail);
    window.addEventListener("gemlocks:theme-change", onThemeChange);
    fetch("/api/settings", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((settings) => {
        if (!active) return;
        applyTheme(settings?.active_theme);
      })
      .catch(() => {
        if (active) applyTheme("dark");
      });
    return () => { active = false; window.removeEventListener("gemlocks:theme-change", onThemeChange); };
  }, []);

  return null;
}
