"use client";

import { useEffect, useRef, useState } from "react";
import type { Track } from "@/types/music";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any; // We use simplified any here to avoid needing the full @types/youtube if it's finicky
  }
}

// ============================================================
// 📚 LEARN: useYTPlayer.ts
// ============================================================
// 1. We dynamically load the YouTube IFrame API script
// 2. We attach the player to a hidden <div>
// 3. We expose controls (play, pause, seek) that other components can call
// ============================================================

export interface UseYTPlayerReturn {
  playerReady: boolean;
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  seek: (ms: number) => void;
  playerRef: React.MutableRefObject<YT.Player | null>;
}

export function useYTPlayer(): UseYTPlayerReturn {
  const [playerReady, setPlayerReady] = useState(false);
  // useRef keeps a reference to the YT.Player instance WITHOUT triggering re-renders
  const playerRef = useRef<YT.Player | null>(null);

  useEffect(() => {
    // 🟡 I BUILD: The YouTube API script loading
    if (!window.YT) {
      // Prevent multiple script tags in React Strict Mode
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }

      // Chain the callback in case another hook is also waiting
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        initPlayer();
      };
    } else if (window.YT && window.YT.Player) {
      initPlayer();
    }

    function initPlayer() {
      // Create the player hidden in the DOM
      playerRef.current = new window.YT.Player("yt-player", {
        height: "200",
        width: "200",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
        },
        events: {
          onReady: () => setPlayerReady(true),
        },
      });
    }

    return () => {
      // Cleanup
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  // 🟢 YOU CODE (Done for you): The control proxy methods
  const play = (track: Track) => {
    if (playerReady && playerRef.current) {
      playerRef.current.loadVideoById(track.videoId);
    }
  };

  const pause = () => {
    if (playerReady && playerRef.current) playerRef.current.pauseVideo();
  };

  const resume = () => {
    if (playerReady && playerRef.current) playerRef.current.playVideo();
  };

  const seek = (ms: number) => {
    if (playerReady && playerRef.current) {
      playerRef.current.seekTo(ms / 1000, true);
    }
  };

  return { playerReady, play, pause, resume, seek, playerRef };
}
