"use client";

import { useState, useEffect, useRef } from "react";
import type { Track } from "@/types/music";

export interface UseSimilarTracksReturn {
  tracks: Track[];
  isLoading: boolean;
}

export function useSimilarTracks(currentTrack: Track | null): UseSimilarTracksReturn {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!currentTrack) {
      setTracks([]);
      return;
    }

    setIsLoading(true);
    let isMounted = true;

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/music/upnext?videoId=${currentTrack.videoId}`);

        if (!res.ok) throw new Error("Failed to fetch Up Next tracks");
        
        const data = await res.json();
        if (isMounted) setTracks(data.tracks || []);
        
      } catch (error) {
        console.error(error);
        if (isMounted) setTracks([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, 2000); // Wait 2 seconds of playback before fetching suggestions

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentTrack]);

  return { tracks, isLoading };
}
