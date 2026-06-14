"use client";

import styled from "styled-components";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, ListMusic } from "lucide-react";
import type { Track } from "@/types/music";
import { ProgressBar } from "./ProgressBar";
import { usePlayerStore } from "@/store/playerStore";

const MiniPlayerContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
`;

const TrackInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
  width: 25%;
  cursor: pointer;

  .mini-thumb {
    width: 56px;
    height: 56px;
    border-radius: 6px;
    object-fit: cover;
    flex-shrink: 0;
  }

  @media (max-width: 800px) {
    flex: 1;
    width: auto;
  }
`;

const TrackText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 0.15rem;

  .title {
    font-weight: 600;
    font-size: 0.95rem;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .artist {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  max-width: 600px;
  gap: 0.5rem;
`;

const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;

  button {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:hover:not(:disabled) {
      color: #fff;
      transform: scale(1.1);
    }
  }

  .play-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:hover:not(:disabled) {
      transform: scale(1.05);
      background: #fff;
    }
  }
  
  @media (max-width: 800px) {
    gap: 1rem;
    .hide-on-mobile {
      display: none;
    }
  }
`;

const DesktopProgressBarWrapper = styled.div`
  width: 100%;
  display: block;
  
  @media (max-width: 800px) {
    display: none;
  }
`;

const ExtraControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  width: 25%;
  
  @media (max-width: 800px) {
    display: none;
  }
`;

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  width: 120px;
`;

const VolumeSlider = styled.div`
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  cursor: pointer;
  position: relative;

  &:hover .vol-fill {
    background: var(--accent);
  }
`;

const VolumeFill = styled.div`
  height: 100%;
  background: #fff;
  border-radius: 2px;
`;

const MobileMiniProgress = styled.div<{ $pct: number }>`
  display: none;
  @media (max-width: 800px) {
    display: block;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: rgba(255, 255, 255, 0.1);
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: ${({ $pct }) => `${$pct}%`};
      background: #fff;
      transition: width 0.1s linear;
    }
  }
`;

const LiveDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 2s ease-in-out infinite;
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
`;

interface MiniPlayerProps {
  currentTrack: Track | null;
  onPlayPause: () => void;
  onSeek: (ms: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onToggleQueue?: () => void;
  roomCode?: string | null;
  isGuest?: boolean;
  isShuffle?: boolean;
  toggleShuffle?: () => void;
  isRepeat?: boolean;
  toggleRepeat?: () => void;
  onExpand: () => void;
  isLiked: boolean;
  toggleLike: (track: Track) => void;
  onNavigateArtist: (artistId: string, artistName: string) => void;
  volume: number;
  setVolume: (val: number) => void;
}

export function MiniPlayer({
  currentTrack,
  onPlayPause,
  onSeek,
  onNext,
  onPrev,
  onToggleQueue,
  roomCode,
  isGuest = false,
  isShuffle = false,
  toggleShuffle,
  isRepeat = false,
  toggleRepeat,
  onExpand,
  isLiked,
  toggleLike,
  onNavigateArtist,
  volume,
  setVolume,
}: MiniPlayerProps) {
  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setVolume(Math.round(pct));
  };

  const isPlaying = usePlayerStore(s => s.isPlaying);
  const positionMs = usePlayerStore(s => s.positionMs);
  const durationMs = usePlayerStore(s => s.durationMs);

  return (
    <MiniPlayerContainer>
      <TrackInfo onClick={onExpand}>
        {currentTrack ? (
          <>
            <img className="mini-thumb" src={currentTrack.thumbnailUrl} alt={currentTrack.title} />
            <TrackText>
              <div className="title">{currentTrack.title}</div>
              <div 
                className="artist"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateArtist(currentTrack.artistId || "", currentTrack.channelTitle || currentTrack.artist || "");
                }}
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                {currentTrack.channelTitle || currentTrack.artist || "Unknown Artist"}
              </div>
            </TrackText>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (currentTrack) toggleLike(currentTrack);
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: isLiked ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                padding: '4px', display: 'flex', alignItems: 'center'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </>
        ) : (
          <TrackText><div className="title" style={{ color: "rgba(255,255,255,0.3)" }}>No track playing</div></TrackText>
        )}
      </TrackInfo>

      <ControlsContainer>
        <ButtonsRow>
          <button 
            className="hide-on-mobile"
            disabled={isGuest}
            onClick={(e) => { e.stopPropagation(); if (toggleShuffle) toggleShuffle(); }}
            style={{ color: isShuffle ? 'var(--accent)' : 'inherit', opacity: isGuest ? 0.3 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }}
          >
            <Shuffle size={18} fill="currentColor" />
          </button>
          <button 
            className="hide-on-mobile"
            disabled={isGuest} 
            style={{ opacity: isGuest ? 0.3 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }} 
            onClick={(e) => { e.stopPropagation(); if(onPrev) onPrev(); }}
          >
            <SkipBack size={22} fill="currentColor" />
          </button>
          <button 
            className="play-btn" 
            disabled={isGuest} 
            style={{ opacity: isGuest ? 0.5 : 1, cursor: isGuest ? 'not-allowed' : 'pointer', background: isGuest ? 'rgba(255,255,255,0.1)' : 'var(--accent)', color: isGuest ? '#fff' : '#000' }} 
            onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: "2px" }} />}
          </button>
          <button 
            disabled={isGuest} 
            style={{ opacity: isGuest ? 0.3 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }} 
            onClick={(e) => { e.stopPropagation(); if(onNext) onNext(); }}
          >
            <SkipForward size={22} fill="currentColor" />
          </button>
          <button 
            className="hide-on-mobile"
            disabled={isGuest}
            onClick={(e) => { e.stopPropagation(); if (toggleRepeat) toggleRepeat(); }}
            style={{ color: isRepeat ? 'var(--accent)' : 'inherit', opacity: isGuest ? 0.3 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }}
          >
            <Repeat size={18} fill="currentColor" />
          </button>
        </ButtonsRow>
        <DesktopProgressBarWrapper>
          <ProgressBar onSeek={(ms) => { if (!isGuest) onSeek(ms); }} />
        </DesktopProgressBarWrapper>
      </ControlsContainer>

      <ExtraControls>
        {roomCode && <RoomBadge><LiveDot /> {roomCode}</RoomBadge>}
        <button 
          onClick={(e) => { e.stopPropagation(); if (onToggleQueue) onToggleQueue(); }}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '4px', display: 'flex' }}
        >
          <ListMusic size={20} />
        </button>
        <VolumeContainer>
          {volume === 0 ? <VolumeX size={20} onClick={(e) => { e.stopPropagation(); setVolume(70); }} /> : <Volume2 size={20} onClick={(e) => { e.stopPropagation(); setVolume(0); }} />}
          <VolumeSlider onClick={handleVolumeClick}><VolumeFill className="vol-fill" style={{ width: `${volume}%` }} /></VolumeSlider>
        </VolumeContainer>
      </ExtraControls>
      
      <MobileMiniProgress $pct={durationMs > 0 ? (positionMs / durationMs) * 100 : 0} />
    </MiniPlayerContainer>
  );
}
