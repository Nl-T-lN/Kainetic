"use client";

import { ThemeProvider } from "styled-components";
import { theme } from "@/styles/theme";
import React from "react";
import { useThemeSettings } from "@/hooks/useThemeSettings";

export function Providers({ children }: { children: React.ReactNode }) {
  useThemeSettings(); // Initialize theme settings and inject CSS variables
  
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
