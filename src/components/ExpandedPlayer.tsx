"use client";

import styled, { keyframes } from "styled-components";
import { ChevronDown } from "lucide-react";
import type { Track } from "@/types/music";
import { AmbientBackground } from "./AmbientBackground";
import { PlayerControls } from "./PlayerControls";
import { LyricsView } from "./LyricsView";
import { usePlayer } from "@/contexts/PlayerContext";

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
  top: 1.5rem;
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

  @media (max-width: 1000px) {
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    background: transparent;
    backdrop-filter: none;
    width: auto;
    height: auto;
    padding: 0.5rem;
    
    svg {
      stroke-width: 3px;
      transform: scaleX(1.4) scaleY(0.7);
      color: rgba(255, 255, 255, 0.7);
    }

    &:hover {
      background: transparent;
      transform: translateX(-50%) translateY(-2px);
    }
  }
`;

const ExpandedContent = styled.div`
  width: 100%;
  max-width: 1800px;
  display: grid;
  grid-template-areas: "left lyrics";
  grid-template-columns: 0.8fr 1fr;
  gap: 8rem;
  padding: 2rem 4rem; /* Reverted to 2rem to maximize vertical space for artwork & controls */
  height: 100%;
  min-height: 0;
  animation: ${fadeIn} 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  z-index: 10;

  @media (max-width: 1200px) {
    gap: 4rem;
    padding: 2rem;
  }

  @media (max-width: 1000px) {
    grid-template-areas: 
      "header"
      "lyrics"
      "controls";
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    gap: 1.5rem;
    padding: 1rem;
    padding-top: 1.5rem;
    padding-bottom: 2rem;
    overflow: hidden;
  }
`;

const LeftColumn = styled.div`
  grid-area: left;
  display: flex;
  flex-direction: column;
  align-items: center; /* Centers the unified block in the left pane */
  justify-content: center;
  width: 100%;
  height: 100%;

  @media (max-width: 1000px) {
    display: contents;
  }
`;

const MobileHeader = styled.div`
  display: contents;

  @media (max-width: 1000px) {
    display: flex;
    flex-direction: row;
    grid-area: header;
    align-items: center;
    gap: 1rem;
    width: 100%;
    margin-top: 1.5rem; /* Reduced to bring artwork closer to the top bar */
    padding: 0 0.5rem;
  }
`;

const ArtworkContainer = styled.div`
  width: 100%;
  max-width: clamp(280px, 100vh - 350px, 600px); /* Restrict min and max sizes */
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

  @media (max-width: 1000px) {
    width: 56px;
    height: 56px;
    max-width: 56px;
    margin-bottom: 0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
`;

const TrackDetails = styled.div`
  text-align: left;
  width: 100%;
  max-width: clamp(280px, 100vh - 350px, 600px); /* Match artwork width */
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;

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
    margin-top: 0;
    margin-bottom: 0;
    max-width: 100%; /* Release width lock on mobile */
    text-align: left;
    .title { 
      font-size: 1.1rem; 
      -webkit-line-clamp: 1; 
      margin-bottom: 0.1rem;
    }
    .artist { font-size: 0.9rem; }
  }
`;

const ControlsContainer = styled.div`
  width: 100%;
  max-width: clamp(280px, 100vh - 350px, 600px); /* Match artwork width */

  @media (max-width: 1000px) {
    grid-area: controls;
    max-width: 100%; /* Release width lock on mobile */
    padding: 0 0.5rem;
  }
`;

const LyricsWrapper = styled.div`
  grid-area: lyrics;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

interface ExpandedPlayerProps {
  currentTrack: Track | null;
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
  const { lyrics, plainLyrics, isLyricsLoading } = usePlayer();

  return (
    <ExpandedWrapper>
      <AmbientBackground imageUrl={currentTrack?.thumbnailUrl} />
      
      <CloseButton onClick={onClose}>
        <ChevronDown size={28} />
      </CloseButton>
      
      {currentTrack && (
        <ExpandedContent>
          <LeftColumn>
            <MobileHeader>
              <ArtworkContainer>
                <img src={currentTrack.thumbnailUrl} alt={currentTrack.title} />
              </ArtworkContainer>
              
              <TrackDetails>
                <div className="title">{currentTrack.title}</div>
                <div className="artist">{currentTrack.channelTitle || currentTrack.artist || "Unknown Artist"}</div>
              </TrackDetails>
            </MobileHeader>

            <ControlsContainer>
              <PlayerControls
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
            </ControlsContainer>
          </LeftColumn>

          <LyricsWrapper>
            <LyricsView 
              lyrics={lyrics}
              plainLyrics={plainLyrics}
              isLoading={isLyricsLoading}
              onSeek={onSeek}
              isExpanded={true}
            />
          </LyricsWrapper>
        </ExpandedContent>
      )}
    </ExpandedWrapper>
  );
}
