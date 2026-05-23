import type { NextConfig } from "next";

// ============================================================
// 📚 LEARN: next.config.ts
// ============================================================
// This is the central config for your Next.js app.
//
// KEY CONCEPTS:
// 1. `compiler.styledComponents: true`
//    → Tells Next.js to transform styled-components at BUILD time
//    → Without this, styled-components won't work with SSR (Server-Side Rendering)
//    → The styles would "flash" because they'd only load AFTER JavaScript runs
//
// 2. `images.remotePatterns`
//    → Next.js blocks external images by default (security!)
//    → We whitelist i.ytimg.com so next/image can load YouTube thumbnails
//    → This is part of Next.js's "secure by default" philosophy
// ============================================================

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true, // Enable SSR support for styled-components
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com", // YouTube thumbnail domain
      },
    ],
  },
};

export default nextConfig;
