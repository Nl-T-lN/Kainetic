// ============================================================
// 📚 LEARN: theme.ts (Styled Components)
// ============================================================
// 1. We define a `theme` object with CSS variables.
// 2. We use `declare module "styled-components"` to force TypeScript
//    to understand our theme structure.
// ============================================================

export const theme = {
  colors: {
    background: "var(--bg, #0A0A0A)",
    surface: "rgba(var(--bg-rgb, 10, 10, 10), var(--glass-opacity, 0.8))",
    surfaceHover: "rgba(255, 255, 255, 0.1)",
    surfaceActive: "rgba(255, 255, 255, 0.15)",
    glassBorder: "rgba(255, 255, 255, 0.1)",
    cream: "#ffffff",
    muted: "#b3b3b3",
    mutedDim: "#727272",
    accent: "var(--accent, #FF6B9D)",
    accentHover: "var(--accent, #FF6B9D)", // We can add --accent-hover later if needed
    gold: "var(--accent, #FF6B9D)", // Mapping legacy gold to accent
    green: "var(--accent, #FF6B9D)",
    deepWell: "var(--bg, #0A0A0A)",
    vintageWarning: "#ffb4a9",
    cardBg: "rgba(255, 255, 255, 0.04)",
    cardBgHover: "rgba(255, 255, 255, 0.08)",
    sidebarBg: "var(--bg, #000000)",
    playerBg: "rgba(var(--bg-rgb, 10, 10, 10), 0.95)",
    overlayBg: "rgba(0, 0, 0, 0.85)",
  },
  fonts: {
    sans: "var(--font-main, var(--font-sans), system-ui, sans-serif)",
    pixel: "var(--font-pixel), monospace",
    mono: "var(--font-geist-mono), Courier New, monospace",
  },
  radii: {
    sm: "calc(var(--radius, 12px) * 0.33)",
    md: "var(--radius, 12px)",
    lg: "calc(var(--radius, 12px) * 1.5)",
    xl: "calc(var(--radius, 12px) * 2)",
    full: "9999px",
  },
  transitions: {
    fast: "0.15s ease",
    normal: "0.25s ease",
    smooth: "0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  },
} as const;

// Extend styled-components DefaultTheme
import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: typeof theme.colors;
    fonts: typeof theme.fonts;
    radii: typeof theme.radii;
    transitions: typeof theme.transitions;
  }
}
