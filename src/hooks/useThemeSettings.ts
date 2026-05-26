"use client";

import { useState, useEffect } from "react";
import type { ThemeSettings } from "@/types/theme";

const STORAGE_KEY = "ventify-theme-settings";

export const defaultThemeSettings: ThemeSettings = {
  accentColor: "#FF6B9D",
  bgColor: "#0A0A0A",
  fontFamily: "Inter",
  fontSize: 100,
  radius: 12,
  opacity: 80,
  glassmorphism: true,
  animations: true,
  compactMode: false,
  sidebarWidth: 240,
  playerStyle: "standard",
  progressBarStyle: "thin",
  dynamicAccent: false,
  albumBackground: false,
};

// Helper to convert hex to rgb string (e.g., "255, 107, 157")
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "255, 107, 157";
}

export function useThemeSettings() {
  const [settings, setSettings] = useState<ThemeSettings>(defaultThemeSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultThemeSettings, ...parsed });
      } catch (e) {
        console.error("Failed to parse theme settings", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Update CSS variables when settings change
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;

    const applyColors = () => {
      const hasDynamic = typeof window !== 'undefined' && (window as any).__vintifyHasDynamicColor;
      if (!hasDynamic) {
        root.style.setProperty("--accent", settings.accentColor);
        root.style.setProperty("--accent-rgb", hexToRgb(settings.accentColor));
        root.style.setProperty("--bg", settings.bgColor);
        root.style.setProperty("--bg-rgb", hexToRgb(settings.bgColor));
      }
    };

    applyColors();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', applyColors);
    }

    root.style.setProperty("--radius", `${settings.radius}px`);
    root.style.setProperty("--glass-opacity", `${settings.opacity / 100}`);
    root.style.setProperty("--sidebar-width", `${settings.sidebarWidth}px`);
    
    // Add additional logic here for fonts, animations, etc., as needed based on Settings UI.
    if (settings.fontFamily === 'System') {
      root.style.setProperty("--font-main", "system-ui, -apple-system, sans-serif");
    } else {
      root.style.setProperty("--font-main", `'${settings.fontFamily}', sans-serif`);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', applyColors);
      }
    };
  }, [settings, isLoaded]);

  const updateSetting = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings(defaultThemeSettings);
  };

  return { settings, updateSetting, resetToDefaults, isLoaded };
}
