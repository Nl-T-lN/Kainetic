"use client";

import styled from "styled-components";
import { HomeGrid } from "@/components/HomeGrid";

const MainContainer = styled.main`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export default function Home() {
  return (
    <MainContainer>
      <HomeGrid />
    </MainContainer>
  );
}
