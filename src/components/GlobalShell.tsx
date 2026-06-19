"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import styled from "styled-components";
import type { Track } from "@/types/music";
import YouTube from "react-youtube";

// Hooks
import { useYTPlayer } from "@/hooks/useYTPlayer";
import { usePlayerState } from "@/hooks/usePlayerState";
import { usePartyRoom } from "@/hooks/usePartyRoom";
import { useRecentTracks } from "@/hooks/useRecentTracks";
import { PlayerContext } from "@/contexts/PlayerContext";
import { useThemeSettings } from "@/hooks/useThemeSettings";

// Components
import { Sidebar } from "./Sidebar";
import { usePlayerStore } from "@/store/playerStore";
import { BottomPlayer } from "./BottomPlayer";
import { QueueSidebar } from "./QueueSidebar";
import { SearchHub } from "./SearchHub";
import { useSearch } from "@/hooks/useSearch";
import { useMoodSearch } from "@/hooks/useMoodSearch";
import { usePlaylistGen } from "@/hooks/usePlaylistGen";
import { useSimilarTracks } from "@/hooks/useSimilarTracks";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { BottomNavBar } from "./BottomNavBar";
import { useLyrics } from "@/hooks/useLyrics";
import { AuthButton } from "./AuthButton";
import { useUIStore } from "@/store/uiStore";
import { AddToPlaylistModal } from "./AddToPlaylistModal";

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
`;

const ModalCard = styled.div`
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  width: 90%;
  max-width: 420px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
`;

const ModalTitle = styled.h3`
  font-size: 1.35rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModalText = styled.p`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.5;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
  
  button {
    flex: 1;
    padding: 0.85rem;
    border-radius: 99px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  
  .cancel {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.1);
    &:hover { background: rgba(255, 255, 255, 0.15); }
  }
  
  .leave {
    background: var(--accent);
    color: #000;
    &:hover { filter: brightness(1.1); transform: scale(1.02); }
  }
`;

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
  padding: 0;
  padding-bottom: 110px;
  position: relative;
  z-index: 1;

  @media (max-width: 800px) {
    padding-bottom: 145px;
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 1.25rem 2rem 1rem 2rem;
  margin-bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  gap: 1rem;

  @media (max-width: 800px) {
    padding: 1rem;
    margin-bottom: 0;
  }
`;

const SettingsButton = styled(Link)`
  display: none;
  color: ${({ theme }) => theme.colors.cream};
  
  @media (max-width: 800px) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border-radius: 50%;
    margin-left: 0.5rem;
    transition: background 0.2s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
`;

export function GlobalShell({ children }: { children: React.ReactNode }) {
  const player = useYTPlayer();
  const playerState = usePlayerState(player.playerRef);
  const isPlaying = usePlayerStore(s => s.isPlaying);
  const { settings } = useThemeSettings();

  const [volume, setVolumeState] = useState(70);

  const handleSetVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    player.setVolume(vol);
  }, [player]);

  const search = useSearch();
  const moodSearch = useMoodSearch();
  const playlistGen = usePlaylistGen();
  const similar = useSimilarTracks(playerState.currentTrack);

  // Party room (Listen Along)
  const party = usePartyRoom(playerState);

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const { playlistModalTrack, setPlaylistModalTrack } = useUIStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { addTrack } = useRecentTracks();
  const pathname = usePathname();
  const [pendingTrackAction, setPendingTrackAction] = useState<{ track: Track, contextQueue?: Track[] } | null>(null);
  const lastTrackChangeRef = useRef(0);

  // Global lyrics fetching
  const { lyrics, plainLyrics, isLoading: isLyricsLoading } = useLyrics(playerState.currentTrack);

  // When in listener mode, sync to party state
  useEffect(() => {
    if (!party.isHost && party.partyPlayerState) {
      const ps = party.partyPlayerState;

      // If the track changed, load the new track
      if (
        ps.currentTrack &&
        ps.currentTrack.videoId !== playerState.currentTrack?.videoId
      ) {
        lastTrackChangeRef.current = Date.now();
        playerState.setCurrentTrack(ps.currentTrack);
        addTrack(ps.currentTrack);
        return; // Return early to let react-youtube load the new video before issuing play/seek commands
      }

      // If we just changed the track less than 2 seconds ago, skip manual sync commands
      // to avoid race conditions with react-youtube's internal loading logic.
      if (Date.now() - lastTrackChangeRef.current < 2000) {
        return;
      }

      // Sync play/pause based on host's state
      if (ps.isPlaying && !isPlaying) {
        player.resume();
      } else if (!ps.isPlaying && isPlaying) {
        player.pause();
      }

      // Sync position (only if drift > 3s to avoid constant seeking)
      if (
        ps.isPlaying &&
        Math.abs(ps.positionMs - playerState.getExactPosition()) > 3000
      ) {
        player.seek(ps.positionMs);
      }
    }
  }, [party.isHost, party.partyPlayerState, player, playerState, playerState.currentTrack?.videoId, isPlaying]);

  // document title
  useEffect(() => {
    if (playerState.currentTrack) {
      const trackName = playerState.currentTrack.title;
      document.title = `${trackName} | Kainetic`;
    } else {
      document.title = "Kainetic";
    }
  }, [playerState.currentTrack]);

  useEffect(() => {
    if (playerState.currentTrack?.thumbnailUrl && settings.dynamicAccent) {
      import('@/lib/vibrant-color').then(({ getVibrantColorFromImage }) => {
        getVibrantColorFromImage(playerState.currentTrack!.thumbnailUrl!)
          .then(color => {
            if (typeof window !== 'undefined') (window as any).__vintifyHasDynamicColor = true;
            document.documentElement.style.setProperty('--accent', color);
            // Convert to RGB for alpha usage
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);

            // Also set primary if needed by other components
            document.documentElement.style.setProperty('--primary', color);

            // Set a very dark subtle background color (Material You style)
            // We want it to be ~5-8% lightness of the accent color, mostly black.
            // A simple mix is 10% accent color and 90% black.
            const bgR = Math.floor(r * 0.08);
            const bgG = Math.floor(g * 0.08);
            const bgB = Math.floor(b * 0.08);
            document.documentElement.style.setProperty('--bg', `rgb(${bgR}, ${bgG}, ${bgB})`);
            document.documentElement.style.setProperty('--bg-rgb', `${bgR}, ${bgG}, ${bgB}`);
          })
          .catch(() => { });
      });
    } else {
      if (typeof window !== 'undefined') (window as any).__vintifyHasDynamicColor = false;
      document.documentElement.style.removeProperty('--accent');
      document.documentElement.style.removeProperty('--accent-rgb');
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--bg');
      document.documentElement.style.removeProperty('--bg-rgb');

      // Force settings to re-apply their colors
      window.dispatchEvent(new Event('storage'));
    }
  }, [playerState.currentTrack?.thumbnailUrl, settings.dynamicAccent]);

  // Sync to OS MediaSession for background playback
  useEffect(() => {
    if (playerState.currentTrack && typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: playerState.currentTrack.title,
        artist: playerState.currentTrack.channelTitle || (playerState.currentTrack as any).artist || 'Unknown Artist',
        album: 'Kainetic',
        artwork: [
          { src: playerState.currentTrack.thumbnailUrl || '', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => player.resume());
      navigator.mediaSession.setActionHandler('pause', () => player.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => playerState.playPrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => playerState.playNext());
    }
  }, [playerState.currentTrack, player, playerState]);

  const handlePlayTrack = async (track: Track, contextQueue?: Track[]) => {
    // 1. Play track immediately and clear old queue
    playerState.setCurrentTrack(track);
    addTrack(track);

    if (contextQueue && contextQueue.length > 0) {
      // Find the index of the track in the context queue
      const startIndex = contextQueue.findIndex(t => t.videoId === track.videoId);
      playerState.setQueue(contextQueue, startIndex >= 0 ? startIndex : 0);
    } else {
      // Set queue to just this track initially
      playerState.setQueue([track], 0);

      // 2. Start fetching similar tracks
      const res = await fetch(`/api/music/upnext?videoId=${track.videoId}`);

      if (res.ok) {
        const data = await res.json();
        if (data.tracks && data.tracks.length > 0) {
          // Ensure the original track is first, then similar tracks
          const newQueue = [track, ...data.tracks];
          // Only update if user hasn't changed track while fetching
          playerState.setQueue(newQueue, 0);
        }
      }
    }
  };

  const togglePlay = () => {
    // Prevent guests from controlling playback directly
    if (party.roomCode && !party.isHost) return;

    if (!playerState.currentTrack) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.resume();
    }
  };

  const interceptedOnPlay = async (track: Track, contextQueue?: Track[]) => {
    if (party.roomCode) {
      if (party.isHost) {
        party.requestAddTrack(track, "PLAY_NOW");
      } else {
        setPendingTrackAction({ track, contextQueue });
      }
    } else {
      handlePlayTrack(track, contextQueue);
    }
  };

  const confirmLeaveParty = () => {
    party.leaveRoom();
    if (pendingTrackAction) {
      handlePlayTrack(pendingTrackAction.track, pendingTrackAction.contextQueue);
    }
    setPendingTrackAction(null);
  };

  const interceptedOnPlayNext = (track: Track) => {
    if (party.roomCode) {
      party.requestAddTrack(track, "PLAY_NEXT");
    } else {
      playerState.insertNext(track);
    }
  };

  const interceptedOnAddToQueue = (track: Track) => {
    if (party.roomCode) {
      party.requestAddTrack(track, "ADD_TRACK");
    } else {
      playerState.addToQueue(track);
    }
  };

  const activeQueue = party.roomCode ? party.partyQueue : playerState.queue;
  const activeQueueIndex = party.roomCode ? party.partyQueueIndex : playerState.queueIndex;

  const handleSkip = (direction: "forward" | "backward") => {
    const skipAmount = 10000; // 10 seconds
    const currentPos = usePlayerStore.getState().positionMs;
    if (direction === "forward") {
      player.seek(currentPos + skipAmount);
    } else {
      player.seek(Math.max(0, currentPos - skipAmount));
    }
  };

  return (
    <PlayerContext.Provider value={{
      onPlay: interceptedOnPlay,
      onPlayNext: interceptedOnPlayNext,
      onAddToQueue: interceptedOnAddToQueue,
      onStartRadio: interceptedOnPlay,
      party,
      currentTrack: playerState.currentTrack || null,
      lyrics,
      plainLyrics,
      isLyricsLoading,
      playerRef: player.playerRef
    }}>
      <AppLayout style={{ '--sidebar-width': isSidebarCollapsed ? '80px' : '230px' } as any}>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        />

        <MainContent>
          <TopBar>
            <div style={{ flex: 1 }}>
              <Suspense fallback={<div>Loading...</div>}>
                <SearchHub
                  onSearch={search.search}
                  onMoodSearch={moodSearch.searchMood}
                  onPlaylistGenerate={playlistGen.generatePlaylist}
                  isLoading={search.isLoading || moodSearch.isLoading || playlistGen.isLoading}
                />
              </Suspense>
            </div>
            <AuthButton />
            <SettingsButton href="/settings">
              <Settings size={24} strokeWidth={2.5} />
            </SettingsButton>
          </TopBar>

          {children}
        </MainContent>

        <YouTube
          videoId={playerState.currentTrack?.videoId}
          opts={{
            height: '1',
            width: '1',
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              rel: 0,
              playsinline: 1,
            },
          }}
          onReady={(event) => {
            event.target.setPlaybackQuality('small');
            player.onReady(event);
          }}
          onEnd={() => {
            if (party.roomCode && !party.isHost) return;
            playerState.playNext();
          }}
          className="yt-player-hidden"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "1px",
            height: "1px",
            opacity: 0.01,
            pointerEvents: "none",
            zIndex: -1,
          }}
        />

        <BottomPlayer
          currentTrack={playerState.currentTrack}
          queue={activeQueue}
          queueIndex={activeQueueIndex}
          onPlayPause={togglePlay}
          onSkip={handleSkip}
          onSeek={player.seek}
          onNext={playerState.playNext}
          onPrev={playerState.playPrev}
          onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
          roomCode={party.roomCode}
          listenerCount={party.members.length}
          isHost={party.isHost}
          isShuffle={playerState.isShuffle}
          toggleShuffle={playerState.toggleShuffle}
          isRepeat={playerState.isRepeat}
          toggleRepeat={playerState.toggleRepeat}
          volume={volume}
          setVolume={handleSetVolume}
        />

        <QueueSidebar
          isOpen={isQueueOpen}
          onClose={() => setIsQueueOpen(false)}
          queue={activeQueue}
          queueIndex={activeQueueIndex}
          onPlayTrack={(idx) => {
            playerState.setQueue(playerState.queue, idx);
          }}
          onPlayNext={playerState.insertNext}
          onAddToQueue={playerState.addToQueue}
          onStartRadio={handlePlayTrack}
          onReorderQueue={playerState.reorderQueue}
          onRemoveTrack={(idx) => {
            const newQueue = [...playerState.queue];
            newQueue.splice(idx, 1);
            if (newQueue.length === 0) {
              playerState.setQueue([], 0);
              playerState.setCurrentTrack(null);
            } else {
              let newIdx = playerState.queueIndex;
              if (idx < playerState.queueIndex) newIdx--;
              else if (idx === playerState.queueIndex) {
                if (newIdx >= newQueue.length) newIdx = newQueue.length - 1;
              }
              playerState.setQueue(newQueue, newIdx);
            }
          }}
        />

        <BottomNavBar />

        {pendingTrackAction && (
          <ModalOverlay>
            <ModalCard>
              <ModalTitle>
                <AlertTriangle color="var(--accent)" /> Leave Party?
              </ModalTitle>
              <ModalText>
                You are currently in a Listen Along session. Playing a song will disconnect you from the party room. Do you want to proceed?
              </ModalText>
              <ModalButtons>
                <button className="cancel" onClick={() => setPendingTrackAction(null)}>Cancel</button>
                <button className="leave" onClick={confirmLeaveParty}>Leave Party</button>
              </ModalButtons>
            </ModalCard>
          </ModalOverlay>
        )}

        {playlistModalTrack && (
          <AddToPlaylistModal
            track={playlistModalTrack}
            onClose={() => setPlaylistModalTrack(null)}
            onAdded={() => { }}
          />
        )}
      </AppLayout>
    </PlayerContext.Provider>
  );
}
