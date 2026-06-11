"use client";

import styled, { keyframes } from "styled-components";
import { TrackList } from "./TrackList";
import { useState } from "react";
import type { Track } from "@/types/music";
import { Library, Heart, ListMusic, Plus } from "lucide-react";
import { useLikedTracks } from "@/hooks/useLikedTracks";
import Link from "next/link";

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ViewContainer = styled.div`
  width: 100%;
  animation: ${fadeSlideIn} 0.4s ease-out;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
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

const NewPlaylistCard = styled(PlaylistCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  background: transparent;
  color: var(--muted);
  gap: 1rem;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
    background: rgba(255, 255, 255, 0.02);
  }
`;

const NewPlaylistIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  
  ${NewPlaylistCard}:hover & {
    background: rgba(255, 255, 255, 0.1);
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

import { usePlayer } from "@/contexts/PlayerContext";
import { useLibraryStore } from "@/store/libraryStore";
import { NewPlaylistModal } from "./NewPlaylistModal";

export function LibraryView() {
  const { onPlay, onPlayNext, onAddToQueue, onStartRadio } = usePlayer();
  const [activeTab, setActiveTab] = useState("Liked Songs");
  const { likedTracks } = useLikedTracks();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Bring in our Local-First Zustand store!
  const { playlists, createPlaylist } = useLibraryStore();

  const handleSavePlaylist = (name: string, tracks: Track[]) => {
    createPlaylist(name, tracks);
    setIsModalOpen(false);
  };

  return (
    <ViewContainer>
      <SectionContainer>
        <SectionHeader>
          <h3>
            <ListMusic size={20} color="var(--accent)" />
            Your Playlists
          </h3>
        </SectionHeader>

        <PlaylistsGrid>
          <NewPlaylistCard onClick={() => setIsModalOpen(true)}>
            <NewPlaylistIcon>
              <Plus size={24} />
            </NewPlaylistIcon>
            <PlaylistTitle>New Playlist</PlaylistTitle>
          </NewPlaylistCard>

          {playlists.map(p => (
            <Link href={`/library/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
              <PlaylistCard>
                <PlaylistThumb>
                  {p.coverUrl ? (
                    <img src={p.coverUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'calc(var(--radius) * 0.8)' }} />
                  ) : (
                    <ListMusic size={32} />
                  )}
                </PlaylistThumb>
                <PlaylistTitle>{p.name}</PlaylistTitle>
                <PlaylistCount>{p.tracks.length} {p.tracks.length === 1 ? 'track' : 'tracks'}</PlaylistCount>
              </PlaylistCard>
            </Link>
          ))}
        </PlaylistsGrid>
      </SectionContainer>

      <SectionContainer>
        <SectionHeader>
          <h3>
            <Heart size={20} color="#ff6b6b" fill="rgba(255, 107, 107, 0.2)" />
            Liked Songs
          </h3>
        </SectionHeader>

        {likedTracks.length > 0 ? (
          <TrackList
            tracks={likedTracks}
            onTrackSelect={onPlay}
            onPlayNext={onPlayNext}
            onAddToQueue={onAddToQueue}
            onStartRadio={onStartRadio}
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

      {isModalOpen && (
        <NewPlaylistModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSavePlaylist}
        />
      )}
    </ViewContainer>
  );
}
