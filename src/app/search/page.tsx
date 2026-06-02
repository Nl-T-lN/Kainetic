"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styled from "styled-components";
import { useSearch } from "@/hooks/useSearch";
import { useMoodSearch } from "@/hooks/useMoodSearch";
import { usePlaylistGen } from "@/hooks/usePlaylistGen";
import { useSimilarTracks } from "@/hooks/useSimilarTracks";
import { SearchResultsOverlay } from "@/components/SearchResultsOverlay";
import { usePlayer } from "@/contexts/PlayerContext";

const SearchPageContainer = styled.div`
  width: 100%;
  padding-bottom: 100px;
`;

import { Suspense } from "react";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const vibe = searchParams.get("vibe");
  const magic = searchParams.get("magic");

  const search = useSearch();
  const moodSearch = useMoodSearch();
  const playlistGen = usePlaylistGen();
  const { currentTrack } = usePlayer();
  const similar = useSimilarTracks(currentTrack);

  useEffect(() => {
    if (q) {
      search.search(q);
    } else if (vibe) {
      moodSearch.searchMood(vibe);
    } else if (magic) {
      playlistGen.generatePlaylist(magic);
    }
  }, [q, vibe, magic]);

  return (
    <SearchPageContainer>
      <SearchResultsOverlay 
        query={q || vibe || magic || ""}
        tracks={search.tracks.length > 0 ? search.tracks : (moodSearch.tracks.length > 0 ? moodSearch.tracks : playlistGen.tracks)}
        artists={search.artists}
        albums={search.albums}
        playlists={search.playlists}
        isLoading={search.isLoading || moodSearch.isLoading || playlistGen.isLoading}
        similarTracks={similar.tracks}
        isSimilarLoading={similar.isLoading}
        currentTrackId={currentTrack?.videoId}
      />
    </SearchPageContainer>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }}>Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
