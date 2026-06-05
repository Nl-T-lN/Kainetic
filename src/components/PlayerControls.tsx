"use client";

import styled from "styled-components";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Users } from "lucide-react";
import { ProgressBar } from "./ProgressBar";

const ControlsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  z-index: 10;
`;

const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  
  @media (max-width: 1000px) {
    justify-content: center;
    gap: 2rem;
  }
`;

const ControlButton = styled.button<{ $active?: boolean }>`
  background: transparent;
  border: none;
  color: ${({ $active, theme }) => $active ? theme.colors.accent : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    color: #fff;
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const PlayButton = styled.button`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
    background: rgba(255, 255, 255, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 1000px) {
    background: transparent;
    border: none;
    backdrop-filter: none;
    
    &:hover:not(:disabled) {
      background: transparent;
      transform: scale(1.1);
    }
  }
`;

const RoomBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(var(--accent-rgb), 0.1);
  border: 1px solid rgba(var(--accent-rgb), 0.2);
  backdrop-filter: blur(10px);
  border-radius: 9999px;
  padding: 0.35rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  align-self: center;
`;

const LiveDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 2s ease-in-out infinite;
`;

interface PlayerControlsProps {
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  onPlayPause: () => void;
  onSeek: (ms: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  isGuest?: boolean;
  isShuffle?: boolean;
  toggleShuffle?: () => void;
  isRepeat?: boolean;
  toggleRepeat?: () => void;
  roomCode?: string | null;
  listenerCount?: number;
  isHost?: boolean;
}

export function PlayerControls({
  isPlaying,
  positionMs,
  durationMs,
  onPlayPause,
  onSeek,
  onNext,
  onPrev,
  isGuest = false,
  isShuffle = false,
  toggleShuffle,
  isRepeat = false,
  toggleRepeat,
  roomCode,
  listenerCount,
  isHost
}: PlayerControlsProps) {
  return (
    <ControlsWrapper>
      <ProgressBar positionMs={positionMs} durationMs={durationMs} onSeek={(ms) => { if (!isGuest) onSeek(ms); }} />
      
      <ButtonsRow>
        <ControlButton 
          disabled={isGuest}
          $active={isShuffle}
          onClick={(e) => { e.stopPropagation(); if (toggleShuffle) toggleShuffle(); }}
        >
          <Shuffle size={20} />
        </ControlButton>
        
        <ControlButton disabled={isGuest} onClick={onPrev}>
          <SkipBack size={36} fill="currentColor" />
        </ControlButton>
        
        <PlayButton disabled={isGuest} onClick={onPlayPause}>
          {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" />}
        </PlayButton>
        
        <ControlButton disabled={isGuest} onClick={onNext}>
          <SkipForward size={36} fill="currentColor" />
        </ControlButton>
        
        <ControlButton 
          disabled={isGuest}
          $active={isRepeat}
          onClick={(e) => { e.stopPropagation(); if (toggleRepeat) toggleRepeat(); }}
        >
          <Repeat size={20} />
        </ControlButton>
      </ButtonsRow>

      {roomCode && (
        <RoomBadge>
          <LiveDot /> {isHost ? "Hosting" : "Listening"} · {roomCode} · <Users size={16} style={{ marginLeft: "4px" }} /> {listenerCount || 0}
        </RoomBadge>
      )}
    </ControlsWrapper>
  );
}
