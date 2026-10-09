"use client";

import { useEffect } from "react";

const THEMES = new Set(["dark", "light", "pink", "ocean"]);

export default function ThemeProvider() {
  useEffect(() => {
    let active = true;
    fetch("/api/settings", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((settings) => {
        if (!active) return;
        const theme = typeof settings?.active_theme === "string" && THEMES.has(settings.active_theme)
          ? settings.active_theme
          : "dark";
        document.documentElement.dataset.theme = theme;
      })
      .catch(() => {
        if (active) document.documentElement.dataset.theme = "dark";
      });
    return () => { active = false; };
  }, []);

  return null;
}
