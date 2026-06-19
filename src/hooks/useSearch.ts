"use client";

import { useState, useCallback, useRef } from "react";
import type { Track } from "@/types/music";

export interface UseSearchReturn {
  tracks: Track[];
  artists: any[];
  albums: any[];
  playlists: any[];
  isLoading: boolean;
  query: string;
  search: (query: string) => void;
}

export function useSearch(): UseSearchReturn {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  
  // Keep the timeout ID across renders without causing a re-render
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [artists, setArtists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);

  const search = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setTracks([]);
      setArtists([]);
      setAlbums([]);
      setPlaylists([]);
      setQuery("");
      return;
    }

    setIsLoading(true);
    setQuery(query);

    debounceRef.current = setTimeout(async () => {
      try {
        const [trackRes, artistRes, albumRes, playlistRes] = await Promise.all([
          fetch(`/api/search?q=${encodeURIComponent(query)}&type=song`),
          fetch(`/api/search?q=${encodeURIComponent(query)}&type=artist`),
          fetch(`/api/search?q=${encodeURIComponent(query)}&type=album`),
          fetch(`/api/search?q=${encodeURIComponent(query)}&type=playlist`)
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
        
        if (albumRes.ok) {
          const data = await albumRes.json();
          setAlbums(data.results || []);
        } else {
          setAlbums([]);
        }
        
        if (playlistRes.ok) {
          const data = await playlistRes.json();
          setPlaylists(data.results || []);
        } else {
          setPlaylists([]);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setTracks([]);
        setArtists([]);
        setAlbums([]);
        setPlaylists([]);
      } finally {
        setIsLoading(false);
      }
    }, 400); // 400ms debounce
  }, []);

  return { tracks, artists, albums, playlists, isLoading, query, search };
}
