"use client";

import { useState, useCallback } from "react";
import type { Track } from "@/types/music";

export interface UsePlaylistGenReturn {
  playlistName: string | null;
  tracks: Track[];
  isLoading: boolean;
  generatePlaylist: (vibeDescription: string) => Promise<void>;
}

export function usePlaylistGen(): UsePlaylistGenReturn {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generatePlaylist = useCallback(async (vibeDescription: string) => {
    if (!vibeDescription.trim()) return;

    setIsLoading(true);
    setPlaylistName(null);
    setTracks([]);

    try {
      const res = await fetch("/api/ai/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibeDescription }),
      });

      if (!res.ok) throw new Error("Failed to generate playlist");
      
      const data = await res.json();
      setPlaylistName(data.playlistName || "SYSTEM MIX");
      setTracks(data.tracks || []);
    } catch (error) {
      console.error(error);
      setTracks([]);
      setPlaylistName("ERROR: CORRUPTED TAPE");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { playlistName, tracks, isLoading, generatePlaylist };
}
