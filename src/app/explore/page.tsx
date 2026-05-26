"use client";

import styled, { keyframes } from "styled-components";
import { Compass, Sparkles, Rocket } from "lucide-react";

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(var(--accent-rgb), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 120px); // Account for header/player
  text-align: center;
  overflow: hidden;
  background: var(--bg);
`;

const TapeContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200vw;
  height: 100vh;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const Tape = styled.div<{ $rotate: number }>`
  position: absolute;
  width: 200vw;
  height: 80px;
  background-color: #dca514;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 40px,
    #111 40px,
    #111 80px
  );
  transform: rotate(${({ $rotate }) => $rotate}deg);
  display: flex;
  align-items: center;
  overflow: hidden;
  z-index: 10;
`;

const TapeText = styled.div`
  color: #111;
  font-weight: 900;
  font-size: 2.2rem;
  letter-spacing: 4px;
  white-space: nowrap;
  font-family: 'Arial Black', sans-serif;
  text-transform: uppercase;
  padding: 0 10px;
  margin: 0 20px;
  text-shadow: 
    -2px -2px 0 #dca514,
     2px -2px 0 #dca514,
    -2px  2px 0 #dca514,
     2px  2px 0 #dca514;
`;

const TapeTextContainer = styled.div`
  display: flex;
  white-space: nowrap;
`;

export default function ExplorePage() {
  // Repeat the text enough times to cover the wide tape
  const textItems = Array(20).fill("UNDER CONSTRUCTION");

  return (
    <Container>
      <TapeContainer>
        <Tape $rotate={-15}>
          <TapeTextContainer>
            {textItems.map((text, i) => (
              <TapeText key={`tape1-${i}`}>{text}</TapeText>
            ))}
          </TapeTextContainer>
        </Tape>
        <Tape $rotate={15} style={{ zIndex: 11 }}>
          <TapeTextContainer>
            {textItems.map((text, i) => (
              <TapeText key={`tape2-${i}`}>{text}</TapeText>
            ))}
          </TapeTextContainer>
        </Tape>
      </TapeContainer>
    </Container>
  );
}
