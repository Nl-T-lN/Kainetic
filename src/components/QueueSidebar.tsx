"use client";

import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { X, Heart, Trash2, Download, Edit3, GripVertical, MoreVertical } from "lucide-react";
import type { Track } from "@/types/music";
import { useLikedTracks } from "@/hooks/useLikedTracks";
import { TrackContextMenu } from "./TrackContextMenu";

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
`;

const SidebarContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100vh;
  background: rgba(15, 15, 15, 0.6);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  transform: translateX(${({ $isOpen }) => ($isOpen ? "0" : "100%")});
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;

    button {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      display: flex;
      padding: 4px;
      transition: color 0.2s;

      &:hover {
        color: #fff;
      }
    }
  }
`;

const TrackList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const TrackItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.5rem 1.5rem;
  gap: 1rem;
  background: ${({ $isActive }) => ($isActive ? "rgba(255, 255, 255, 0.08)" : "transparent")};
  border-left: 2px solid ${({ $isActive }) => ($isActive ? "var(--accent)" : "transparent")};
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    .actions {
      opacity: 1;
    }
  }

  .drag-handle {
    color: rgba(255, 255, 255, 0.3);
    cursor: grab;
    display: flex;
  }

  img {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .title {
      color: ${({ $isActive }) => ($isActive ? "var(--accent)" : "#fff")};
      font-size: 0.9rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .artist {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }
  }

  .duration {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    font-variant-numeric: tabular-nums;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    opacity: ${({ $isActive }) => ($isActive ? "1" : "0")};
    transition: opacity 0.2s;

    button {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
      padding: 4px;
      display: flex;

      &:hover {
        color: #fff;
      }
    }
  }
`;

function formatDuration(ms?: number) {
  if (!ms) return "--:--";
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface QueueSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Track[];
  queueIndex: number;
  onPlayTrack: (index: number) => void;
  onRemoveTrack: (index: number) => void;
  onPlayNext?: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
  onStartRadio?: (track: Track) => void;
}

export function QueueSidebar({
  isOpen,
  onClose,
  queue,
  queueIndex,
  onPlayTrack,
  onRemoveTrack,
  onPlayNext,
  onAddToQueue,
  onStartRadio
}: QueueSidebarProps) {
  const { toggleLike, isLiked } = useLikedTracks();
  const [menuTrack, setMenuTrack] = useState<{ track: Track, x: number, y: number } | null>(null);

  const handleContextMenuClick = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuTrack({ track, x: rect.right - 240, y: rect.bottom });
  };

  return (
    <SidebarContainer $isOpen={isOpen}>
      <Header>
        <h2>Queue</h2>
        <div className="header-actions">
          <button title="Download">
            <Download size={18} />
          </button>
          <button title="Like">
            <Heart size={18} />
          </button>
          <button title="Edit">
            <Edit3 size={18} />
          </button>
          <button title="Clear Queue" onClick={() => queue.forEach((_, i) => onRemoveTrack(i))}>
            <Trash2 size={18} />
          </button>
          <button title="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </Header>
      
      <TrackList>
        {queue.map((track, i) => {
          const isActive = i === queueIndex;
          const liked = isLiked(track.videoId);

          return (
            <TrackItem key={`${track.videoId}-${i}`} $isActive={isActive}>
              <div className="drag-handle">
                <GripVertical size={16} />
              </div>
              
              <img 
                src={track.thumbnailUrl} 
                alt={track.title} 
                onClick={() => onPlayTrack(i)}
                style={{ cursor: 'pointer' }}
              />
              
              <div className="info" onClick={() => onPlayTrack(i)} style={{ cursor: 'pointer' }}>
                <div className="title">
                  {track.title}
                </div>
                <div className="artist">{track.artist || track.channelTitle || "Unknown Artist"}</div>
              </div>
              
              <div className="duration">{formatDuration(track.durationMs)}</div>
              
              <div className="actions">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                  style={{ color: liked ? "var(--accent)" : "inherit" }}
                >
                  <Heart size={16} fill={liked ? "currentColor" : "none"} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onRemoveTrack(i); }}>
                  <Trash2 size={16} />
                </button>
                <button onClick={(e) => handleContextMenuClick(e, track)}>
                  <MoreVertical size={16} />
                </button>
              </div>
            </TrackItem>
          );
        })}
      </TrackList>
      
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
    </SidebarContainer>
  );
}
