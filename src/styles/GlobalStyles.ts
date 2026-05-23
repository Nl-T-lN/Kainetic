"use client";

// ============================================================
// 📚 LEARN: GlobalStyles.ts
// ============================================================
// Global CSS reset and base styles. Connects with our ThemeSettings
// to dynamically apply user preferences to the root element.
// ============================================================

import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  /* CSS Reset */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    /* Fallback variables in case JS hasn't loaded */
    --accent: #FF6B9D;
    --accent-rgb: 255, 107, 157;
    --bg: #0A0A0A;
    --bg-rgb: 10, 10, 10;
    --radius: 12px;
    --glass-opacity: 0.8;
    --font-main: var(--font-sans), system-ui, sans-serif;
    --sidebar-width: 240px;
  }

  html {
    font-size: 16px;
  }

  body {
    background-color: var(--bg);
    color: ${({ theme }) => theme.colors.cream};
    font-family: var(--font-main);
    overflow-x: hidden;
    position: relative;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;
    transition: background-color 0.3s ease;
  }

  ::selection {
    background: var(--accent);
    color: #000;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }

  img {
    display: block;
    max-width: 100%;
  }

  /* Glassmorphism Utility */
  .glass {
    background: rgba(var(--bg-rgb), var(--glass-opacity));
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Modern scrollbars */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(var(--accent-rgb), 0.3);
    border-radius: var(--radius);
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--accent-rgb), 0.6);
  }
`;
