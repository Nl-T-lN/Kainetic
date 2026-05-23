"use client";

import styled, { keyframes } from "styled-components";
import { TrackList } from "./TrackList";
import type { Track } from "@/types/music";
import { useRecentTracks } from "@/hooks/useRecentTracks";
import { History, Trash2 } from "lucide-react";

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ViewContainer = styled.div`
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  animation: ${fadeSlideIn} 0.4s ease-out;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 1rem;
`;

const Header = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: var(--accent);
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 100, 100, 0.1);
  color: #ff6b6b;
  border: 1px solid rgba(255, 100, 100, 0.2);
  border-radius: 99px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 100, 100, 0.2);
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

export function RecentView({ onPlay }: { onPlay: (track: Track) => void }) {
  const { recentTracks, clearRecent } = useRecentTracks();

  return (
    <ViewContainer>
      <HeaderRow>
        <Header>
          <History size={26} />
          Recently Played
        </Header>
        {recentTracks.length > 0 && (
          <ClearButton onClick={clearRecent}>
            <Trash2 size={16} />
            Clear History
          </ClearButton>
        )}
      </HeaderRow>
      
      {recentTracks.length > 0 ? (
        <TrackList 
          tracks={recentTracks} 
          onTrackSelect={onPlay} 
          currentTrackId={undefined} 
        />
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
