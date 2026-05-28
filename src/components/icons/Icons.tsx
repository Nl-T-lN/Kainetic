"use client";

import styled from "styled-components";


// These are hand-crafted 32x32 pixel SVGs.
// We use `currentColor` for fill so they automatically take the color


const SvgContainer = styled.svg`
  width: 24px;
  height: 24px;
  display: inline-block;
  shape-rendering: crispEdges; /* Forces browsers to NOT anti-alias the pixels */
`;

export const PlayIcon = () => (
  // pixelated triangle for play
  <SvgContainer viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 6V26L24 16L10 6Z" fill="currentColor" />
  </SvgContainer>
);

export const PauseIcon = () => (
  // pixelated bars for pause
  <SvgContainer viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="6" width="4" height="20" fill="currentColor" />
    <rect x="18" y="6" width="4" height="20" fill="currentColor" />
  </SvgContainer>
);

export const SkipIcon = () => (
  // triangle + bar for skip
  <SvgContainer viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 8V24L20 16L8 8Z" fill="currentColor" />
    <rect x="20" y="8" width="4" height="16" fill="currentColor" />
  </SvgContainer>
);

export const SearchIcon = () => (
  // Search magnifying glass
  <SvgContainer viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 6C9.58172 6 6 9.58172 6 14C6 18.4183 9.58172 22 14 22C18.4183 22 22 18.4183 22 14C22 9.58172 18.4183 6 14 6ZM2 14C2 7.37258 7.37258 2 14 2C20.6274 2 26 7.37258 26 14C26 16.7369 25.0838 19.2599 23.5516 21.2583L29.7071 27.4138L28.2929 28.828L22.0945 22.6296C20.0075 24.7176 17.1517 26 14 26C7.37258 26 2 20.6274 2 14Z" fill="currentColor" />
  </SvgContainer>
);
