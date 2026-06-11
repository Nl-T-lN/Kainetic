"use client";

import { ThemeProvider } from "styled-components";
import { theme } from "@/styles/theme";
import React from "react";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { useLibrarySync } from "@/hooks/useLibrarySync";

export function Providers({ children }: { children: React.ReactNode }) {
  useThemeSettings(); // Initialize theme settings and inject CSS variables
  useLibrarySync(); // Sync library data with Supabase

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
