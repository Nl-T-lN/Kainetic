// ============================================================
// 📚 LEARN: layout.tsx 
// ============================================================
// Every Next.js App Router app MUST have a root layout.tsx.
// It defines the <html> and <body> tags.
//
// 1. We load the "Press Start 2P" pixel font from next/font/google.
// 2. We wrap our children in our StyledRegistry (to fix Server-Side styles).
// 3. We use ThemeProvider from styled-components to pass our colors down.
// 4. Metadata is exported as a constant — no <Head> component needed!
// ============================================================

import type { Metadata } from "next";
import { Press_Start_2P, Inter } from "next/font/google";
import StyledComponentsRegistry from "@/styles/StyledRegistry";
import { GlobalStyles } from "@/styles/GlobalStyles";
import { theme } from "@/styles/theme";
import { Providers } from "./Providers";

// 🔵 WE CODE: Font Loading
const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel", 
});

const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// 🔵 WE CODE: Metadata API
export const metadata: Metadata = {
  title: "Ventify",
  description: "A modern glassmorphic music streaming platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pixelFont.variable} ${interFont.variable}`}>
      <body>
        <StyledComponentsRegistry>
          <GlobalStyles theme={theme} />
          <Providers>{children}</Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

