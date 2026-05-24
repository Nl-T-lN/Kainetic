"use client";

import styled, { keyframes } from "styled-components";
import type { Track } from "@/types/music";
import { Play, MoreVertical } from "lucide-react";
import { TrackContextMenu } from "./TrackContextMenu";
import { useState } from "react";

const ListContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
`;

const eqBounce = keyframes`
  0%, 100% { height: 3px; }
  50% { height: 14px; }
`;

const TrackItem = styled.li<{ $isPlaying: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.55rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: transparent;
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};
  margin-bottom: 2px;
  gap: 0.75rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};

    .row-number {
      display: none;
    }
    .play-icon {
      display: flex;
    }
  }

  ${({ $isPlaying, theme }) =>
    $isPlaying &&
    `
    .title { color: ${theme.colors.accent}; }
    .row-number { color: ${theme.colors.accent}; }
  `}
`;

const RowIndex = styled.div`
  width: 28px;
  text-align: center;
  color: ${({ theme }) => theme.colors.mutedDim};
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  position: relative;

  .play-icon {
    display: none;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.cream};
  }
`;

const EqBars = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
  justify-content: center;
  width: 100%;
`;

const EqBar = styled.div<{ $delay: string }>`
  width: 3px;
  background: ${({ theme }) => theme.colors.accent};
  border-radius: 1px;
  animation: ${eqBounce} 0.6s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay};
`;

const ThumbContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.sm};
  overflow: hidden;
  flex-shrink: 0;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const Title = styled.div`
  color: ${({ theme }) => theme.colors.cream};
  font-size: 0.95rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 1px;
  transition: color ${({ theme }) => theme.transitions.fast};
`;

const Artist = styled.div`
  color: ${({ theme }) => theme.colors.mutedDim};
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Duration = styled.div`
  color: ${({ theme }) => theme.colors.mutedDim};
  font-size: 0.8rem;
  margin-left: auto;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
`;

function formatDuration(ms: number) {
  if (!ms) return "--:--";
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface TrackListProps {
  tracks: Track[];
  onTrackSelect: (track: Track) => void;
  currentTrackId?: string;
  isLoading?: boolean;
  onPlayNext?: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
  onStartRadio?: (track: Track) => void;
}

export function TrackList({
  tracks,
  onTrackSelect,
  currentTrackId,
  isLoading,
  onPlayNext,
  onAddToQueue,
  onStartRadio
}: TrackListProps) {
  const [menuTrack, setMenuTrack] = useState<{ track: Track, x: number, y: number } | null>(null);

  const handleContextMenuClick = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuTrack({ track, x: rect.right - 240, y: rect.bottom });
  };
  if (isLoading) {
    return (
      <div style={{ padding: "1rem", color: "#727272", fontSize: "0.9rem" }}>
        Searching...
      </div>
    );
  }

  if (tracks.length === 0) {
    return null;
  }

  return (
    <>
      <ListContainer>
        {tracks.map((track, index) => {
          const isActive = track.videoId === currentTrackId;
          return (
            <TrackItem
              key={`${track.videoId}-${index}`}
              $isPlaying={isActive}
              onClick={() => onTrackSelect(track)}
            >
              <RowIndex>
                <span className="row-number">{index + 1}</span>
                <span className="play-icon">
                  {isActive ? (
                    <EqBars>
                      <EqBar $delay="0s" />
                      <EqBar $delay="0.2s" />
                      <EqBar $delay="0.4s" />
                    </EqBars>
                  ) : (
                    <Play size={14} fill="currentColor" />
                  )}
                </span>
              </RowIndex>

              <ThumbContainer>
                <Thumbnail
                  src={track.thumbnailUrl || "https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&q=80&w=200"}
                  alt={track.title}
                  loading="lazy"
                />
              </ThumbContainer>

              <TrackInfo>
                <Title className="title">{track.title}</Title>
                <Artist>{track.artist || track.channelTitle || "Unknown Artist"}</Artist>
              </TrackInfo>

              <Duration>{formatDuration(track.durationMs)}</Duration>
              
              <button 
                onClick={(e) => handleContextMenuClick(e, track)}
                style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', 
                  cursor: 'pointer', padding: '4px', display: 'flex', marginLeft: '8px'
                }}
              >
                <MoreVertical size={16} />
              </button>
            </TrackItem>
          );
        })}
      </ListContainer>
      
      {menuTrack && (
        <TrackContextMenu 
          track={menuTrack.track}
          x={menuTrack.x}
          y={menuTrack.y}
          onClose={() => setMenuTrack(null)}
          onPlayNext={onPlayNext}
          onAddToQueue={onAddToQueue}
          onStartRadio={onStartRadio}
        />
      )}
    </>
  );
}
