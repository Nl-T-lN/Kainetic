"use client";

import styled from "styled-components";

// ============================================================
// 📚 LEARN: page.tsx (You Code)
// ============================================================
// Welcome to your first page in Next.js! 
// This is the root route (`/`).
//
// We are using `styled.div` to create a styled component.
// Notice how we use `${({ theme }) => theme.colors.gold}` to avoid 
// hardcoding `#f7bd48`.
// ============================================================

import { Player } from "@/components/Player";

// ============================================================
// 📚 LEARN: page.tsx (You Code)
// ============================================================
// The root page of GROOVEBOX now renders the massive
// Master Player component which manages all state.
// ============================================================

const MainContainer = styled.main`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

export default function Home() {
  return (
    <MainContainer>
      <Player />
    </MainContainer>
  );
}
