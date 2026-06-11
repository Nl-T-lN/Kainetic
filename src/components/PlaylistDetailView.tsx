"use client";

import styled, { keyframes } from "styled-components";
import { useLibraryStore } from "@/store/libraryStore";
import { usePlayer } from "@/contexts/PlayerContext";
import { TrackList } from "./TrackList";
import { ArrowLeft, Trash2, ListMusic, Play, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useSimilarTracks } from "@/hooks/useSimilarTracks";
import type { Track } from "@/types/music";

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

const Header = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05), transparent);
  border-radius: var(--radius);
  align-items: flex-end;
  position: relative;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }
`;

const Cover = styled.div`
  width: 200px;
  height: 200px;
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: 768px) {
    margin-top: 3rem;
  }
`;

const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  h4 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--muted);
  }
  
  h1 {
    margin: 0;
    font-size: 3rem;
    font-weight: 900;
    color: #fff;
    line-height: 1.1;
  }
  
  p {
    margin: 0;
    color: var(--muted);
    font-size: 1rem;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const PlayButton = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent);
  color: #000;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  color: var(--muted);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ff6b6b;
    border-color: rgba(255, 107, 107, 0.3);
  }
`;

const EmptyState = styled.div`
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: var(--muted);
  
  svg {
    opacity: 0.5;
    margin-bottom: 1rem;
  }
  
  h3 {
    color: #fff;
    margin-bottom: 0.5rem;
  }
`;

const SectionContainer = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchInputContainer = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--accent);
    background: rgba(255, 255, 255, 0.1);
  }
`;

export function PlaylistDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { playlists, deletePlaylist, removeTrackFromPlaylist, addTrackToPlaylist } = useLibraryStore();
  const { onPlay, onPlayNext, onAddToQueue, onStartRadio } = usePlayer();
  const [mounted, setMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const { tracks: searchResults, isLoading: isSearchLoading, search } = useSearch();

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      search(searchQuery);
    }
  }, [searchQuery, search]);

  useEffect(() => setMounted(true), []);

  const playlist = playlists.find(p => p.id === id);
  const lastTrack = playlist?.tracks.length ? playlist.tracks[playlist.tracks.length - 1] : null;
  const { tracks: recommendedTracks, isLoading: isRecLoading } = useSimilarTracks(lastTrack);

  if (!mounted) return null;

  if (!playlist) {
    return (
      <ViewContainer>
        <EmptyState>
          <ListMusic size={48} />
          <h3>Playlist Not Found</h3>
          <p>The playlist you are looking for does not exist.</p>
          <button
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '99px', background: 'var(--accent)', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => router.push('/library')}
          >
            Go to Library
          </button>
        </EmptyState>
      </ViewContainer>
    );
  }

  const handlePlayAll = () => {
    if (playlist.tracks.length > 0) {
      onPlay(playlist.tracks[0], playlist.tracks);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      deletePlaylist(playlist.id);
      router.push('/library');
    }
  };

  const handleRemoveTrack = (track: Track) => {
    removeTrackFromPlaylist(playlist.id, track.videoId);
  };

  const handleAddTrack = (track: Track) => {
    // Check if already in playlist
    if (!playlist.tracks.some(t => t.videoId === track.videoId)) {
      addTrackToPlaylist(playlist.id, track);
      setSearchQuery(""); // Clear search after adding
    }
  };

  return (
    <ViewContainer>
      <Header>
        <BackButton onClick={() => router.push('/library')}>
          <ArrowLeft size={20} />
        </BackButton>

        <Cover>
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl} alt={playlist.name} />
          ) : (
            <ListMusic size={64} color="var(--muted)" />
          )}
        </Cover>

        <Info>
          <h4>Playlist</h4>
          <h1>{playlist.name}</h1>
          <p>
            {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'} • Created {new Date(playlist.createdAt).toLocaleDateString()}
          </p>

          <ActionsRow>
            <PlayButton
              onClick={handlePlayAll}
              disabled={playlist.tracks.length === 0}
              title="Play"
            >
              <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />
            </PlayButton>
            <IconButton onClick={handleDelete} title="Delete Playlist">
              <Trash2 size={18} />
            </IconButton>
          </ActionsRow>
        </Info>
      </Header>

      {playlist.tracks.length > 0 ? (
        <TrackList
          tracks={playlist.tracks}
          onTrackSelect={onPlay}
          onPlayNext={onPlayNext}
          onAddToQueue={onAddToQueue}
          onStartRadio={onStartRadio}
          isContextQueueEnabled={true}
          onRemoveTrack={handleRemoveTrack}
        />
      ) : (
        <EmptyState>
          <ListMusic size={48} />
          <h3>It's a bit empty here...</h3>
          <p>Add some songs to this playlist to get started.</p>
        </EmptyState>
      )}

      <SectionContainer>
        <SectionTitle>
          <Search size={20} /> Let's find something for your playlist
        </SectionTitle>
        <SearchInputContainer>
          <Search size={18} />
          <SearchInput
            placeholder="Search for songs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchInputContainer>

        {searchQuery ? (
          <TrackList
            tracks={searchResults}
            onTrackSelect={onPlay}
            onPlayNext={onPlayNext}
            onAddToQueue={onAddToQueue}
            onStartRadio={onStartRadio}
            onAddTrack={handleAddTrack}
          />
        ) : recommendedTracks.length > 0 ? (
          <>
            <SectionTitle style={{ marginTop: '2rem', fontSize: '1.1rem', color: 'var(--muted)' }}>
              <Sparkles size={18} /> Recommended
            </SectionTitle>
            <TrackList
              tracks={recommendedTracks.slice(0, 5)}
              onTrackSelect={onPlay}
              onPlayNext={onPlayNext}
              onAddToQueue={onAddToQueue}
              onStartRadio={onStartRadio}
              onAddTrack={handleAddTrack}
            />
          </>
        ) : null}
      </SectionContainer>
    </ViewContainer>
  );
}
