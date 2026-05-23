"use client";

import { useEffect, useState, useRef } from "react";
import type { PlayerState, Track } from "@/types/music";

// ============================================================
// 📚 LEARN: usePlayerState.ts
// ============================================================
// Instead of relying on events, we POLL the YouTube player every 500ms
// to get the true playback position.
//
// Q: Why useRef for intervalId?
// A: If we used useState(null) for intervalId, setting it would trigger a re-render!
//    useRef holds mutable data that DOES NOT cause a re-render.
// ============================================================

export interface UsePlayerStateReturn extends PlayerState {
  setCurrentTrack: (track: Track | null) => void;
}

export function usePlayerState(
  playerRef: React.MutableRefObject<YT.Player | null>
): UsePlayerStateReturn {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 🟢 YOU CODE (Done for you): Polling function
    const pollState = () => {
      if (!playerRef.current || !playerRef.current.getPlayerState) return;

      const stateName = playerRef.current.getPlayerState();
      
      // YT.PlayerState.PLAYING is 1
      if (stateName === 1) {
        setIsPlaying(true);
        // YT returns seconds, we need ms
        const pos = playerRef.current.getCurrentTime() * 1000;
        setPositionMs(pos);
        
        // Grab duration if we don't have it
        const dur = playerRef.current.getDuration() * 1000;
        if (dur > 0 && dur !== durationMs) {
          setDurationMs(dur);
        }
      } else {
        setIsPlaying(false);
      }
    };

    // Run interval every 500ms
    intervalRef.current = setInterval(pollState, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playerRef, durationMs]);

  // When the track changes manually, reset the UI instantly before YouTube loads
  const handleSetTrack = (track: Track | null) => {
    setCurrentTrack(track);
    setPositionMs(0);
    if (track) setDurationMs(track.durationMs);
  };

  return { currentTrack, isPlaying, positionMs, durationMs, setCurrentTrack: handleSetTrack };
}
