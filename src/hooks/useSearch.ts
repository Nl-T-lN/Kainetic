"use client";

import { useState, useCallback, useRef } from "react";
import type { Track } from "@/types/music";

export interface UseSearchReturn {
  tracks: Track[];
  artists: any[];
  isLoading: boolean;
  query: string;
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
  const [query, setQuery] = useState("");
  
  // Keep the timeout ID across renders without causing a re-render
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [artists, setArtists] = useState<any[]>([]);

  const search = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setTracks([]);
      setArtists([]);
      setQuery("");
      return;
    }

    setIsLoading(true);
    setQuery(query);

    debounceRef.current = setTimeout(async () => {
      try {
        const [trackRes, artistRes] = await Promise.all([
          fetch(`/api/search?q=${encodeURIComponent(query)}&type=song`),
          fetch(`/api/search?q=${encodeURIComponent(query)}&type=artist`)
        ]);

        if (trackRes.ok) {
          const data = await trackRes.json();
          setTracks(data.tracks || []);
        } else {
          setTracks([]);
        }

        if (artistRes.ok) {
          const data = await artistRes.json();
          setArtists(data.results || []);
        } else {
          setArtists([]);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setTracks([]);
        setArtists([]);
      } finally {
        setIsLoading(false);
      }
    }, 400); // 400ms debounce
  }, []);

  return { tracks, artists, isLoading, query, search };
}
