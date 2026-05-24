import { useRef, useState, useCallback } from "react";
import type { Track } from "@/types/music";

export interface UseYTPlayerReturn {
  playerReady: boolean;
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  seek: (ms: number) => void;
  onReady: (event: { target: any }) => void;
  playerRef: React.MutableRefObject<any>;
}

export function useYTPlayer(): UseYTPlayerReturn {
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);

  const onReady = useCallback((event: { target: any }) => {
    playerRef.current = event.target;
    setPlayerReady(true);
  }, []);

  const play = useCallback((track: Track) => {
    if (playerReady && playerRef.current && typeof playerRef.current.loadVideoById === "function") {
      playerRef.current.loadVideoById(track.videoId);
    } else {
      console.warn("YouTube player not fully initialized yet.");
    }
  }, [playerReady]);

  const pause = useCallback(() => {
    if (playerReady && playerRef.current && typeof playerRef.current.pauseVideo === "function") {
      playerRef.current.pauseVideo();
    }
  }, [playerReady]);

  const resume = useCallback(() => {
    if (playerReady && playerRef.current && typeof playerRef.current.playVideo === "function") {
      playerRef.current.playVideo();
    }
  }, [playerReady]);

  const seek = useCallback((ms: number) => {
    if (playerReady && playerRef.current && typeof playerRef.current.seekTo === "function") {
      playerRef.current.seekTo(ms / 1000, true);
    }
  }, [playerReady]);

  return { playerReady, play, pause, resume, seek, onReady, playerRef };
}
