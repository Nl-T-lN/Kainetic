"use client";

// ============================================================
// 📚 LEARN: StyledRegistry.tsx (I Build)
// ============================================================
// Next.js App Router uses Server Components by default.
// But styled-components relies on a <style> tag in the HTML head.
// 
// When Next.js renders your page on the server, it doesn't know what CSS
// styled-components generated. This file uses a hook (useServerInsertedHTML)
// to collect all the CSS and inject it into the <head> before sending the HTML
// over the wire.
//
// Q: Why can't Styled Components just work without this?
// A: Because React Server Components execute before the client mounts. 
// Without this registry, the client would receive unstyled HTML, then "flash"
// the CSS a split-second later once JS runs. This prevents the flash of unstyled content (FOUC).
// ============================================================

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only create stylesheet once with lazy initial state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined") return <>{children}</>;

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}
