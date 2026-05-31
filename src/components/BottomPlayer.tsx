"use client";

import { useState } from "react";
import styled from "styled-components";
import type { Track } from "@/types/music";
import { useRouter } from 'next/navigation';
import { useLikedTracks } from "@/hooks/useLikedTracks";
import { MiniPlayer } from "./MiniPlayer";
import { ExpandedPlayer } from "./ExpandedPlayer";

const BottomBar = styled.div<{ $isExpanded: boolean }>`
  position: fixed;
  bottom: ${({ $isExpanded }) => ($isExpanded ? "0" : "15px")};
  left: ${({ $isExpanded }) => ($isExpanded ? "0" : "calc(var(--sidebar-width, 240px) + 15px)")};
  right: ${({ $isExpanded }) => ($isExpanded ? "0" : "15px")};
  width: ${({ $isExpanded }) => ($isExpanded ? "100%" : "calc(100% - var(--sidebar-width, 240px) - 30px)")};
  height: ${({ $isExpanded }) => ($isExpanded ? "100vh" : "86px")};
  background: ${({ $isExpanded }) =>
    $isExpanded
      ? "var(--bg)"
      : "rgba(0, 0, 0, 0.4)"};
  backdrop-filter: ${({ $isExpanded }) => ($isExpanded ? "none" : "blur(12px)")};
  -webkit-backdrop-filter: ${({ $isExpanded }) => ($isExpanded ? "none" : "blur(12px)")};
  border-radius: ${({ $isExpanded }) => ($isExpanded ? "0" : "var(--radius)")};
  border: ${({ $isExpanded }) =>
    $isExpanded ? "none" : "1px solid rgba(255, 255, 255, 0.1)"};
  box-shadow: ${({ $isExpanded }) =>
    $isExpanded ? "none" : "0 20px 40px rgba(0,0,0,0.4)"};
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
  transition: bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              height 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              left 0.3s cubic-bezier(0.2, 0, 0, 1),
              width 0.3s cubic-bezier(0.2, 0, 0, 1),
              border-radius 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              background 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  will-change: width, left, height, bottom;

  @media (max-width: 800px) {
    left: ${({ $isExpanded }) => ($isExpanded ? "0" : "8px")};
    right: ${({ $isExpanded }) => ($isExpanded ? "0" : "8px")};
    width: ${({ $isExpanded }) => ($isExpanded ? "100%" : "calc(100% - 16px)")};
    bottom: ${({ $isExpanded }) => ($isExpanded ? "0" : "70px")};
    border-radius: ${({ $isExpanded }) => ($isExpanded ? "0" : "8px")};
    border: none;
    background: ${({ $isExpanded }) => ($isExpanded ? "var(--bg)" : "rgba(0, 0, 0, 0.75)")};
  }
`;

interface BottomPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  queue?: Track[];
  queueIndex?: number;
  onPlayPause: () => void;
  onSkip?: (direction: "forward" | "backward") => void;
  onSeek: (ms: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onToggleQueue?: () => void;
  roomCode?: string | null;
  listenerCount?: number;
  isHost?: boolean;
  isShuffle?: boolean;
  toggleShuffle?: () => void;
  isRepeat?: boolean;
  toggleRepeat?: () => void;
}

export function BottomPlayer({
  currentTrack,
  isPlaying,
  positionMs,
  durationMs,
  queue,
  queueIndex,
  onPlayPause,
  onSkip,
  onSeek,
  onNext,
  onPrev,
  onToggleQueue,
  roomCode,
  listenerCount = 0,
  isHost = true,
  isShuffle = false,
  toggleShuffle,
  isRepeat = false,
  toggleRepeat
}: BottomPlayerProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(70);
  const { toggleLike, isLiked } = useLikedTracks();
  
  const isGuest = !!roomCode && !isHost;

  return (
    <BottomBar $isExpanded={isExpanded}>
      {!isExpanded ? (
        <MiniPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          positionMs={positionMs}
          durationMs={durationMs}
          onPlayPause={onPlayPause}
          onSeek={onSeek}
          onNext={onNext}
          onPrev={onPrev}
          onToggleQueue={onToggleQueue}
          roomCode={roomCode}
          isGuest={isGuest}
          isShuffle={isShuffle}
          toggleShuffle={toggleShuffle}
          isRepeat={isRepeat}
          toggleRepeat={toggleRepeat}
          onExpand={() => setIsExpanded(true)}
          isLiked={currentTrack ? isLiked(currentTrack.videoId) : false}
          toggleLike={toggleLike}
          onNavigateArtist={(artistId, name) => {
            if (artistId) router.push('/artist/' + artistId);
            else router.push('/search?q=' + encodeURIComponent(name));
          }}
          volume={volume}
          setVolume={setVolume}
        />
      ) : (
        <ExpandedPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          positionMs={positionMs}
          durationMs={durationMs}
          onPlayPause={onPlayPause}
          onSeek={onSeek}
          onNext={onNext}
          onPrev={onPrev}
          isGuest={isGuest}
          isShuffle={isShuffle}
          toggleShuffle={toggleShuffle}
          isRepeat={isRepeat}
          toggleRepeat={toggleRepeat}
          roomCode={roomCode}
          listenerCount={listenerCount}
          isHost={isHost}
          onClose={() => setIsExpanded(false)}
        />
      )}
    </BottomBar>
  );
}
