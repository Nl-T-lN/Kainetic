"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import type { Track } from "@/types/music";
import YouTube from "react-youtube";

// Hooks
import { useYTPlayer } from "@/hooks/useYTPlayer";
import { usePlayerState } from "@/hooks/usePlayerState";
import { useSearch } from "@/hooks/useSearch";
import { useMoodSearch } from "@/hooks/useMoodSearch";
import { usePlaylistGen } from "@/hooks/usePlaylistGen";
import { useSimilarTracks } from "@/hooks/useSimilarTracks";
import { usePartyRoom } from "@/hooks/usePartyRoom";
import { useRecentTracks } from "@/hooks/useRecentTracks";
// Components
import { TrackList } from "./TrackList";
import { Sidebar } from "./Sidebar";
import { BottomPlayer } from "./BottomPlayer";
import { HomeGrid } from "./HomeGrid";
import { SimilarTracks as SimilarTracksComponent } from "./SimilarTracks";
import { SearchHub } from "./SearchHub";
import { ListenAlong } from "./ListenAlong";
import { SettingsView } from "./SettingsView";
import { RecentView } from "./RecentView";
import { LibraryView } from "./LibraryView";
const AppLayout = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: transparent;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0 1.75rem;
  padding-bottom: 110px;
  position: relative;
  z-index: 1;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 1.25rem 1.75rem 1rem 1.75rem;
  margin: 0 -1.75rem 1.5rem -1.75rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const ResultsContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0;
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

export function Player() {
  const player = useYTPlayer();
  const playerState = usePlayerState(player.playerRef);

  const search = useSearch();
  const moodSearch = useMoodSearch();
  const playlistGen = usePlaylistGen();
  const similar = useSimilarTracks(playerState.currentTrack);

  // Party room (Listen Along)
  const party = usePartyRoom({
    currentTrack: playerState.currentTrack,
    isPlaying: playerState.isPlaying,
    positionMs: playerState.positionMs,
    durationMs: playerState.durationMs,
  });

  const [activeView, setActiveView] = useState("HOME");
  const [activeQueueId, setActiveQueueId] = useState<
    "SEARCH" | "MOOD" | "PLAYLIST"
  >("SEARCH");
  const [searchCategory, setSearchCategory] = useState("All");

  const { addTrack } = useRecentTracks();

  // When in listener mode, sync to party state
  useEffect(() => {
    if (!party.isHost && party.partyPlayerState) {
      const ps = party.partyPlayerState;

      // If the track changed, load the new track
      if (
        ps.currentTrack &&
        ps.currentTrack.videoId !== playerState.currentTrack?.videoId
      ) {
        playerState.setCurrentTrack(ps.currentTrack);
        player.play(ps.currentTrack);
        addTrack(ps.currentTrack);
      }

      // Sync play/pause
      if (ps.isPlaying && !playerState.isPlaying) {
        player.resume();
      } else if (!ps.isPlaying && playerState.isPlaying) {
        player.pause();
      }

      // Sync position (only if drift > 2s to avoid constant seeking)
      if (
        ps.isPlaying &&
        Math.abs(ps.positionMs - playerState.positionMs) > 2000
      ) {
        player.seek(ps.positionMs);
      }
    }
  }, [party.isHost, party.partyPlayerState, player, playerState, playerState.currentTrack?.videoId, playerState.isPlaying, playerState.positionMs]);

  const handlePlayTrack = (track: Track) => {
    playerState.setCurrentTrack(track);
    player.play(track);
    addTrack(track);
  };

  const togglePlay = () => {
    if (playerState.isPlaying) player.pause();
    else player.resume();
  };

  const handleSkip = () => {
    if (similar.tracks.length > 0) {
      handlePlayTrack(similar.tracks[0]);
    }
  };

  const handleSearch = (query: string) => {
    setActiveQueueId("SEARCH");
    search.search(query);
    setActiveView(query.trim() !== "" ? "SEARCH" : "HOME");
  };

  const handleMoodSearch = (vibe: string) => {
    setActiveQueueId("MOOD");
    moodSearch.searchMood(vibe);
    setActiveView("SEARCH");
  };

  const handlePlaylistGen = (vibe: string) => {
    setActiveQueueId("PLAYLIST");
    playlistGen.generatePlaylist(vibe);
    setActiveView("SEARCH");
  };

  const handleCategoryChange = (category: string) => {
    setSearchCategory(category);
  };

  const getActiveTracks = () => {
    let tracks = search.tracks;
    if (activeQueueId === "PLAYLIST") tracks = playlistGen.tracks;
    else if (activeQueueId === "MOOD") tracks = moodSearch.tracks;

    if (activeQueueId === "SEARCH" && searchCategory !== "All") {
      // Basic mock filtering since we only get standard tracks from YT
      if (searchCategory === "Artists") {
        return tracks.filter((_, i) => i % 3 === 0);
      } else if (searchCategory === "Albums") {
        return tracks.filter((_, i) => i % 4 === 0);
      } else if (searchCategory === "Playlists") {
        return tracks.filter((_, i) => i % 5 === 0);
      } else if (searchCategory === "Podcasts") {
        return []; // Usually empty for standard music search
      }
    }
    
    return tracks;
  };

  const getResultsTitle = () => {
    if (activeQueueId === "MOOD") return "Vibe Results";
    if (activeQueueId === "PLAYLIST") return "AI Playlist";
    if (search.query) return `Search Results for "${search.query}"`;
    return "Search Results";
  };

  return (
    <AppLayout>
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        roomCode={party.roomCode}
      />

      <MainContent>
        <TopBar>
          <SearchHub
            onSearch={handleSearch}
            onMoodSearch={handleMoodSearch}
            onPlaylistGenerate={handlePlaylistGen}
            onCategoryChange={handleCategoryChange}
            isLoading={
              search.isLoading ||
              moodSearch.isLoading ||
              playlistGen.isLoading
            }
          />
        </TopBar>

        {activeView === "HOME" && <HomeGrid onPlay={handlePlayTrack} />}

        {activeView === "SEARCH" && (
          <ResultsContainer>
            <ResultsHeader>{getResultsTitle()}</ResultsHeader>
            
            {activeQueueId === "SEARCH" && (
              <ResultsTabs>
                {["All", "Tracks", "Albums", "Artists", "Playlists", "Podcasts"].map(cat => (
                  <ResultTabButton
                    key={cat}
                    $active={searchCategory === cat}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                  </ResultTabButton>
                ))}
              </ResultsTabs>
            )}

            <TrackList
              tracks={getActiveTracks()}
              currentTrackId={playerState.currentTrack?.videoId}
              onTrackSelect={handlePlayTrack}
              isLoading={
                search.isLoading ||
                moodSearch.isLoading ||
                playlistGen.isLoading
              }
            />

            {similar.tracks.length > 0 && (
              <SimilarTracksComponent
                tracks={similar.tracks}
                isLoading={similar.isLoading}
                onSelect={handlePlayTrack}
              />
            )}
          </ResultsContainer>
        )}

        {activeView === "PARTIES" && (
          <ListenAlong
            isHost={party.isHost}
            roomCode={party.roomCode}
            listenerCount={party.listenerCount}
            messages={party.messages}
            onCreate={party.createRoom}
            onJoin={party.joinRoom}
            onLeave={party.leaveRoom}
            onSendMessage={party.sendMessage}
          />
        )}

        {activeView === "SETTINGS" && <SettingsView />}
        {activeView === "RECENT" && <RecentView onPlay={handlePlayTrack} />}
        {activeView === "LIBRARY" && <LibraryView onPlay={handlePlayTrack} />}
      </MainContent>

      <YouTube
        videoId={playerState.currentTrack?.videoId}
        opts={{
          height: '200',
          width: '200',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
          },
        }}
        onReady={player.onReady}
        className="yt-player-hidden"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "200px",
          height: "200px",
        }}
      />

      <BottomPlayer
        currentTrack={playerState.currentTrack}
        isPlaying={playerState.isPlaying}
        positionMs={playerState.positionMs}
        durationMs={playerState.durationMs}
        onPlayPause={togglePlay}
        onSkip={handleSkip}
        onSeek={player.seek}
        roomCode={party.roomCode}
        listenerCount={party.listenerCount}
        isHost={party.isHost}
      />
    </AppLayout>
  );
}
