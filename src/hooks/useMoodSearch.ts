"use client";

import { useState, useCallback } from "react";
import type { Track } from "@/types/music";

export interface UseMoodSearchReturn {
  tracks: Track[];
  isLoading: boolean;
  searchMood: (moodQuery: string) => Promise<void>;
}

export function useMoodSearch(): UseMoodSearchReturn {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchMood = useCallback(async (moodQuery: string) => {
    if (!moodQuery.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moodQuery }),
      });

      if (!res.ok) throw new Error("Failed to fetch mood tracks");
      
      const data = await res.json();
      setTracks(data.tracks || []);
    } catch (error) {
      console.error(error);
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { tracks, isLoading, searchMood };
}
