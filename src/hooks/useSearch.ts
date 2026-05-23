"use client";

import { useState, useCallback, useRef } from "react";
import type { Track } from "@/types/music";

export interface UseSearchReturn {
  tracks: Track[];
  isLoading: boolean;
  search: (query: string) => void;
}

// ============================================================
// 📚 LEARN: useSearch.ts (Debounce Pattern)
// ============================================================
// A "debounce" prevents a function from running too often.
// If the user types "D-A-F-T" quickly:
// - Without debounce: 4 API calls fired instantly
// - With debounce: Waits 400ms after they STOP typing, fires 1 call
// 
// You MUST clear the previous timeout before setting a new one, 
// otherwise all 4 calls will still happen, just delayed!
// ============================================================

export function useSearch(): UseSearchReturn {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Keep the timeout ID across renders without causing a re-render
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback((query: string) => {
    // 🟢 YOU CODE (Done for you): The Debounce Logic
    if (debounceRef.current) {
      clearTimeout(debounceRef.current); // Cancel the previous timer!
    }

    if (!query.trim()) {
      setTracks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Search failed");
        
        const data = await res.json();
        setTracks(data.tracks || []);
      } catch (error) {
        console.error("Search error:", error);
        setTracks([]);
      } finally {
        setIsLoading(false);
      }
    }, 400); // 400ms delay
  }, []);

  return { tracks, isLoading, search };
}
