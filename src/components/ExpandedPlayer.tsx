"use client";

import styled, { keyframes } from "styled-components";
import { ChevronDown } from "lucide-react";
import type { Track } from "@/types/music";
import { AmbientBackground } from "./AmbientBackground";
import { PlayerControls } from "./PlayerControls";
import { LyricsView } from "./LyricsView";
import { useLyrics } from "@/hooks/useLyrics";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ExpandedWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  position: relative;
  overflow: hidden;

  @media (max-width: 800px) {
    padding: 1rem;
    padding-top: 4rem;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  z-index: 20;
  transition: all 0.2s;
  backdrop-filter: blur(20px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  @media (max-width: 800px) {
    top: 1rem;
    left: 1rem;
  }
`;

const ExpandedContent = styled.div`
  width: 100%;
  max-width: 1400px;
  display: flex;
  flex: 1;
  gap: 5rem;
  align-items: stretch;
  animation: ${fadeIn} 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  min-height: 0;
  z-index: 10;
  padding: 2rem 0;

  @media (max-width: 1000px) {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 1.5rem;
    overflow-y: auto;
    padding-top: 1rem;
    padding-bottom: 4rem;
  }
`;

const ExpandedLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  max-width: min(600px, 100vh - 350px);
  width: 100%;

  @media (max-width: 1000px) {
    flex: none;
    align-items: center;
    max-width: 320px;
    width: 100%;
  }
`;

const ArtworkContainer = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }
`;

const TrackDetails = styled.div`
  margin-top: 0.5rem;
  text-align: left;
  width: 100%;

  .title {
    font-size: 1.75rem;
    font-weight: 800;
    color: #fff;
    margin-bottom: 0.25rem;
    line-height: 1.1;
    letter-spacing: -0.5px;
    
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;  
    overflow: hidden;
  }

  .artist {
    font-size: 1.1rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
  }

  @media (max-width: 1000px) {
    text-align: center;
    margin-top: 1rem;
    .title { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .artist { font-size: 1rem; }
  }
`;

interface ExpandedPlayerProps {
  currentTrack: Track | null;
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
  onClose: () => void;
}

export function ExpandedPlayer({
  currentTrack,
  isPlaying,
  positionMs,
  durationMs,
  onPlayPause,
  onSeek,
  onNext,
  onPrev,
  isGuest,
  isShuffle,
  toggleShuffle,
  isRepeat,
  toggleRepeat,
  roomCode,
  listenerCount,
  isHost,
  onClose
}: ExpandedPlayerProps) {
  const { lyrics, plainLyrics, isLoading: lyricsLoading } = useLyrics(currentTrack);

  return (
    <ExpandedWrapper>
      <AmbientBackground imageUrl={currentTrack?.thumbnailUrl} />
      
      <CloseButton onClick={onClose}>
        <ChevronDown size={28} />
      </CloseButton>
      
      {currentTrack && (
        <ExpandedContent>
          <ExpandedLeft>
            <ArtworkContainer>
              <img src={currentTrack.thumbnailUrl} alt={currentTrack.title} />
            </ArtworkContainer>
            
            <TrackDetails>
              <div className="title">{currentTrack.title}</div>
              <div className="artist">{currentTrack.channelTitle || currentTrack.artist || "Unknown Artist"}</div>
            </TrackDetails>

            <PlayerControls
              isPlaying={isPlaying}
              positionMs={positionMs}
              durationMs={durationMs}
              onPlayPause={onPlayPause}
              onSeek={onSeek}
              onNext={onNext}
              onPrev={onPrev}
              isGuest={isGuest}
              isShuffle={isShuffle}
              toggleShuffle={toggleShuffle}
              isRepeat={isRepeat}
              toggleRepeat={toggleRepeat}
              roomCode={roomCode}
              listenerCount={listenerCount}
              isHost={isHost}
            />
          </ExpandedLeft>

          <LyricsView 
            lyrics={lyrics}
            plainLyrics={plainLyrics}
            isLoading={lyricsLoading}
            positionMs={positionMs}
            onSeek={onSeek}
            isExpanded={true}
          />
        </ExpandedContent>
      )}
    </ExpandedWrapper>
  );
}
