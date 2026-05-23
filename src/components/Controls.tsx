"use client";

import styled from "styled-components";
import { PlayIcon, PauseIcon, SkipIcon } from "./icons/Icons";

const ControlsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: ${({ theme }) => theme.colors.surface};
  padding: 1rem 2rem;
  border: 2px solid ${({ theme }) => theme.colors.background};
  border-top: 4px solid ${({ theme }) => theme.colors.gold}; /* Hardware styling */
`;

const Button = styled.button<{ $primary?: boolean }>`
  background: transparent;
  border: none;
  color: ${({ theme, $primary }) => ($primary ? theme.colors.gold : theme.colors.cream)};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s, color 0.1s;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    transform: translateY(1px); // Mechanical button press simulation
  }
  
  &:active {
    transform: translateY(3px);
  }

  svg {
    width: ${({ $primary }) => ($primary ? "36px" : "24px")};
    height: ${({ $primary }) => ($primary ? "36px" : "24px")};
  }
`;

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkip?: () => void; // Optional if we auto-play similar tracks later
}

export function Controls({ isPlaying, onPlayPause, onSkip }: ControlsProps) {
  return (
    <ControlsWrapper>
      <Button $primary onClick={onPlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </Button>
      <Button onClick={onSkip} aria-label="Skip Track" title="Skip to next similar track">
        <SkipIcon />
      </Button>
    </ControlsWrapper>
  );
}
