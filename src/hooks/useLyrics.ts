"use client";

import { useState, useEffect } from "react";
import type { Track } from "@/types/music";
import type { ParsedLyricLine } from "@/utils/lyricsParser";

export function useLyrics(currentTrack: Track | null) {
  const [lyrics, setLyrics] = useState<ParsedLyricLine[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentTrack) {
      setLyrics([]);
      setPlainLyrics(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLyrics([]);
    setPlainLyrics(null);

    const fetchLyrics = async () => {
      try {
        const title = encodeURIComponent(currentTrack.title || "");
        const trackAny = currentTrack as any;
        let artistName = trackAny.artists && trackAny.artists.length > 0 
          ? trackAny.artists[0].name 
          : trackAny.artist || trackAny.channelTitle || "";
          
        if (artistName.toLowerCase() === "unknown artist") {
          artistName = "";
        }
        
        const artist = encodeURIComponent(artistName);
        const trackId = currentTrack.videoId ? encodeURIComponent(currentTrack.videoId) : "";

        const res = await fetch(
          `/api/lyrics?title=${title}&artist=${artist}&trackId=${trackId}`
        );
        if (!res.ok) throw new Error("Failed to fetch lyrics");

        const data = await res.json();
        if (!isMounted) return;

        if (data.type === "richsync" && data.lines) {
          setLyrics(data.lines);
        } else if (data.type === "plain" && data.lyrics) {
          setPlainLyrics(data.lyrics);
        }
      } catch (error) {
        console.error("Lyrics error:", error);
        if (isMounted) {
          setLyrics([]);
          setPlainLyrics(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLyrics();

    return () => {
      isMounted = false;
    };
  }, [currentTrack]);

  return { lyrics, plainLyrics, isLoading };
}


