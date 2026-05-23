"use client";

import { useState, useEffect, useRef } from "react";
import type { Track } from "@/types/music";

// ============================================================
// 📚 LEARN: useDJ.ts 
// ============================================================
// This hook automatically triggers the AI DJ whenever the current track changes.
// It generates a stable `sessionId` so the DJ remembers what it said previously
// during this browsing session.
// ============================================================

export interface UseDJReturn {
  djText: string;
  isLoading: boolean;
}

export function useDJ(currentTrack: Track | null): UseDJReturn {
  const [djText, setDjText] = useState<string>("WAITING FOR SIGNAL...");
  const [isLoading, setIsLoading] = useState(false);
  
  // Create a stable session ID for this user's tab once
  const sessionIdRef = useRef<string>(Math.random().toString(36).substring(7));

  useEffect(() => {
    if (!currentTrack) {
      setDjText("SYSTEM READY. DROP THE NEEDLE.");
      return;
    }

    let isMounted = true;

    async function fetchDJ() {
      setIsLoading(true);
      setDjText("CONNECTING TO ARCHIVE...");

      try {
        const res = await fetch("/api/ai/dj", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: currentTrack?.title,
            artist: currentTrack?.artist,
            album: currentTrack?.album,
            sessionId: sessionIdRef.current,
          }),
        });

        if (!res.ok) throw new Error("DJ signal lost");
        
        const data = await res.json();
        if (isMounted) setDjText(data.text);
        
      } catch (error) {
        console.error(error);
        if (isMounted) setDjText("STATIC ON THE LINE... RECOVERING...");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchDJ();

    return () => {
      isMounted = false; // Cleanup to prevent state updates if track changes fast
    };
  }, [currentTrack]);

  return { djText, isLoading };
}
