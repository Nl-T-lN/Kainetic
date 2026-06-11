"use client";

import styled, { keyframes } from "styled-components";
import { TrackList } from "./TrackList";
import type { Track } from "@/types/music";
import { useRecentTracks } from "@/hooks/useRecentTracks";
import { History, Trash2 } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ViewContainer = styled.div`
  width: 100%;
  animation: ${fadeSlideIn} 0.4s ease-out;
  padding: 0 2rem 2rem 2rem;
  position: relative;

  @media (max-width: 768px) {
    padding: 0 1rem 1rem 1rem;
  }
`;

const TopControls = styled.div`
  position: absolute;
  top: 1rem;
  right: 2rem;
  z-index: 10;
  
  @media (max-width: 768px) {
    right: 1rem;
  }
`;



const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  color: var(--muted);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    transform: scale(1.05);
  }
`;

const DateHeader = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  margin: 2rem 0 0.5rem 0;
  padding-bottom: 0.5rem;
  letter-spacing: -0.5px;
  
  &:first-of-type {
    margin-top: 1rem;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 5rem 2rem;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  
  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  h3 {
    color: #fff;
    margin-bottom: 0.5rem;
  }
`;

export function RecentView() {
  const { onPlay, onPlayNext, onAddToQueue, onStartRadio } = usePlayer();
  const { recentTracks, clearRecent } = useRecentTracks();

  const groupedTracks: { label: string, tracks: Track[] }[] = [];

  recentTracks.forEach(track => {
    let label = "Earlier";
    if ((track as any).playedAt) {
      const date = new Date((track as any).playedAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        label = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        label = "Yesterday";
      } else {
        label = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
      }
    }

    const lastGroup = groupedTracks[groupedTracks.length - 1];
    if (lastGroup && lastGroup.label === label) {
      lastGroup.tracks.push(track);
    } else {
      groupedTracks.push({ label, tracks: [track] });
    }
  });

  return (
    <ViewContainer>
      {recentTracks.length > 0 && (
        <TopControls>
          <ClearButton onClick={clearRecent} title="Clear History">
            <Trash2 size={20} />
          </ClearButton>
        </TopControls>
      )}

      {groupedTracks.length > 0 ? (
        <div>
          {groupedTracks.map((group, idx) => (
            <div key={idx}>
              <DateHeader>{group.label}</DateHeader>
              <TrackList
                tracks={group.tracks}
                onTrackSelect={onPlay}
                onPlayNext={onPlayNext}
                onAddToQueue={onAddToQueue}
                onStartRadio={onStartRadio}
                currentTrackId={undefined}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState>
          <History size={48} />
          <h3>No History Yet</h3>
          <p>Tracks you play will appear here so you can easily find them again.</p>
        </EmptyState>
      )}
    </ViewContainer>
  );
}
