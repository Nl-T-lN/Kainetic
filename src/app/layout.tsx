
import type { Metadata } from "next";
import { Press_Start_2P, Inter } from "next/font/google";
import StyledComponentsRegistry from "@/styles/StyledRegistry";
import { GlobalStyles } from "@/styles/GlobalStyles";
import { theme } from "@/styles/theme";
import { Providers } from "./Providers";
import { GlobalShell } from "@/components/GlobalShell";

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
  title: "Kainetic | Music Streaming",
  description: "A premium, music streaming platform powered by the YouTube Music catalog. Listen with friends in real-time, view time-synced lyrics, and discover new music.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Kainetic | Music Streaming",
    description: "A music streaming platform. Listen with friends in real-time, view time-synced lyrics, and discover new music.",
    siteName: "Kainetic",
    images: [
      {
        url: "/assets/home.jpeg",
        width: 1920,
        height: 1080,
        alt: "Kainetic Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kainetic | Music Streaming",
    description: "A premium, music streaming platform powered by the YouTube Music catalog.",
    images: ["/assets/home.jpeg"],
  },
};

import { Analytics } from '@vercel/analytics/react';

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
          <Providers>
            <GlobalShell>
              {children}
            </GlobalShell>
          </Providers>
        </StyledComponentsRegistry>
        <Analytics />
      </body>
    </html>
  );
}

