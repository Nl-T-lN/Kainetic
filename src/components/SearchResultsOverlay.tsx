"use client";

import styled from "styled-components";
import { TrackList } from "./TrackList";
import { ArtistGrid } from "./ArtistGrid";
import { SimilarTracks as SimilarTracksComponent } from "./SimilarTracks";
import { useState } from "react";
import type { Track } from "@/types/music";
import { usePlayer } from "@/contexts/PlayerContext";

const OverlayContainer = styled.div`
  width: 100%;
  padding-bottom: 20px;
`;

const ResultsHeader = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.cream};
`;

const ResultsTabs = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ResultTabButton = styled.button<{ $active?: boolean }>`
  background: transparent;
  border: none;
  color: ${({ $active, theme }) => ($active ? theme.colors.cream : theme.colors.muted)};
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 0;
  cursor: pointer;
  position: relative;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.cream};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${({ $active, theme }) => ($active ? theme.colors.cream : "transparent")};
    transition: background ${({ theme }) => theme.transitions.fast};
  }
`;

interface SearchResultsOverlayProps {
  query: string;
  tracks: Track[];
  artists: any[];
  isLoading: boolean;
  similarTracks: Track[];
  isSimilarLoading: boolean;
  currentTrackId?: string;
}

export function SearchResultsOverlay({
  query,
  tracks,
  artists,
  isLoading,
  similarTracks,
  isSimilarLoading,
  currentTrackId
}: SearchResultsOverlayProps) {
  const [searchCategory, setSearchCategory] = useState("All");
  const { onPlay, onPlayNext, onAddToQueue, onStartRadio } = usePlayer();

  const getResultsTitle = () => {
    if (query) return `Search Results for "${query}"`;
    return "Search Results";
  };

  const getActiveTracks = () => {
    if (searchCategory !== "All") {
      if (searchCategory === "Artists") {
        return tracks.filter((_, i) => i % 3 === 0);
      } else if (searchCategory === "Albums") {
        return tracks.filter((_, i) => i % 4 === 0);
      } else if (searchCategory === "Playlists") {
        return tracks.filter((_, i) => i % 5 === 0);
      } else if (searchCategory === "Podcasts") {
        return [];
      }
    }
    return tracks;
  };

  return (
    <OverlayContainer>
      <ResultsHeader>{getResultsTitle()}</ResultsHeader>
      
      <ResultsTabs>
        {["All", "Tracks", "Albums", "Artists", "Playlists", "Podcasts"].map(cat => (
          <ResultTabButton
            key={cat}
            $active={searchCategory === cat}
            onClick={() => setSearchCategory(cat)}
          >
            {cat}
          </ResultTabButton>
        ))}
      </ResultsTabs>

      {searchCategory === "Artists" ? (
        <ArtistGrid 
          artists={artists} 
        />
      ) : (
        <TrackList
          tracks={getActiveTracks()}
          currentTrackId={currentTrackId}
          onTrackSelect={onPlay}
          isLoading={isLoading}
          onPlayNext={onPlayNext}
          onAddToQueue={onAddToQueue}
          onStartRadio={onStartRadio}
        />
      )}

      {similarTracks.length > 0 && (
        <SimilarTracksComponent
          tracks={similarTracks}
          isLoading={isSimilarLoading}
          onSelect={onPlay}
        />
      )}
    </OverlayContainer>
  );
}
