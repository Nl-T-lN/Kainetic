"use client";

import styled, { keyframes } from "styled-components";
import { TrackList } from "./TrackList";
import { useState } from "react";
import type { Track } from "@/types/music";
import { Library, Heart, ListMusic, Plus } from "lucide-react";

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
  margin-bottom: 2rem;
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

const SectionContainer = styled.div`
  margin-bottom: 3rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;

  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 99px;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  
  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  h4 {
    color: #fff;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.9rem;
  }
`;

const PlaylistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const PlaylistCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
  }
`;

const PlaylistThumb = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: calc(var(--radius) * 0.8);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.2);
`;

const PlaylistTitle = styled.div`
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.25rem;
`;

const PlaylistCount = styled.div`
  font-size: 0.8rem;
  color: var(--muted);
`;

export function LibraryView({ onPlay }: { onPlay: (track: Track) => void }) {
  const [likedSongs] = useState<Track[]>([]);
  const [playlists] = useState<{ id: string; name: string; count: number }[]>([]);

  return (
    <ViewContainer>
      <HeaderRow>
        <Header>
          <Library size={28} />
          Your Library
        </Header>
      </HeaderRow>

      <SectionContainer>
        <SectionHeader>
          <h3>
            <ListMusic size={20} color="var(--accent)" />
            Your Playlists
          </h3>
          <CreateButton>
            <Plus size={16} />
            New Playlist
          </CreateButton>
        </SectionHeader>

        {playlists.length > 0 ? (
          <PlaylistsGrid>
            {playlists.map(p => (
              <PlaylistCard key={p.id}>
                <PlaylistThumb>
                  <ListMusic size={32} />
                </PlaylistThumb>
                <PlaylistTitle>{p.name}</PlaylistTitle>
                <PlaylistCount>{p.count} tracks</PlaylistCount>
              </PlaylistCard>
            ))}
          </PlaylistsGrid>
        ) : (
          <EmptyState>
            <ListMusic size={40} />
            <h4>No playlists created</h4>
            <p>Create your first playlist to start organizing your music.</p>
          </EmptyState>
        )}
      </SectionContainer>

      <SectionContainer>
        <SectionHeader>
          <h3>
            <Heart size={20} color="#ff6b6b" fill="rgba(255, 107, 107, 0.2)" />
            Liked Songs
          </h3>
        </SectionHeader>

        {likedSongs.length > 0 ? (
          <TrackList 
            tracks={likedSongs} 
            onTrackSelect={onPlay} 
            currentTrackId={undefined} 
          />
        ) : (
          <EmptyState>
            <Heart size={40} />
            <h4>No liked songs yet</h4>
            <p>Tap the heart icon on any track to add it to your liked songs.</p>
          </EmptyState>
        )}
      </SectionContainer>
    </ViewContainer>
  );
}
