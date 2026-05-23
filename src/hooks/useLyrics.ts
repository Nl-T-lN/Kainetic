"use client";

import { useState, useEffect } from "react";
import type { Track } from "@/types/music";

export interface LyricLine {
  timeMs: number;
  text: string;
}

interface LRCLibResponse {
  syncedLyrics?: string;
  plainLyrics?: string;
}

export function useLyrics(currentTrack: Track | null) {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
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
        // Clean the title: remove (Official Video), [Lyrics], etc.
        const cleanTitle = currentTrack.title
          .replace(/\(.*?\)|\[.*?\]/g, "")
          .replace(/official|video|lyrics|audio|hd|hq|4k|mv/gi, "")
          .trim();
        const title = encodeURIComponent(cleanTitle);
        const artist = encodeURIComponent(
          currentTrack.artist || currentTrack.channelTitle || ""
        );

        const res = await fetch(
          `https://lrclib.net/api/search?track_name=${title}&artist_name=${artist}`
        );
        if (!res.ok) throw new Error("Failed to fetch lyrics");

        const data = (await res.json()) as LRCLibResponse[];

        if (!isMounted) return;

        // Try to find a match with synced lyrics first
        const syncedMatch = data.find((song) => song.syncedLyrics);

        if (syncedMatch) {
          const lrc = syncedMatch.syncedLyrics as string;
          const lines = lrc.split("\n");
          const parsed: LyricLine[] = [];

          for (const line of lines) {
            // [mm:ss.xx] text
            const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
            if (match) {
              const minutes = parseInt(match[1], 10);
              const seconds = parseInt(match[2], 10);
              const milliseconds = parseInt(match[3].padEnd(3, "0"), 10);
              const text = match[4].trim();

              const timeMs = (minutes * 60 + seconds) * 1000 + milliseconds;
              if (text) {
                parsed.push({ timeMs, text });
              }
            }
          }
          setLyrics(parsed);
          return;
        }

        // Fallback: try plain (unsynced) lyrics
        const plainMatch = data.find((song) => song.plainLyrics);
        if (plainMatch) {
          setPlainLyrics(plainMatch.plainLyrics as string);
          return;
        }

        // Nothing found — try again with just the title (no artist)
        const retryRes = await fetch(
          `https://lrclib.net/api/search?track_name=${title}`
        );
        if (retryRes.ok && isMounted) {
          const retryData = (await retryRes.ok ? await retryRes.json() : []) as LRCLibResponse[];
          const retrySynced = retryData.find((song) => song.syncedLyrics);
          if (retrySynced) {
            const lrc = retrySynced.syncedLyrics as string;
            const parsed: LyricLine[] = [];
            for (const line of lrc.split("\n")) {
              const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
              if (match) {
                const minutes = parseInt(match[1], 10);
                const seconds = parseInt(match[2], 10);
                const milliseconds = parseInt(match[3].padEnd(3, "0"), 10);
                const text = match[4].trim();
                const timeMs = (minutes * 60 + seconds) * 1000 + milliseconds;
                if (text) parsed.push({ timeMs, text });
              }
            }
            setLyrics(parsed);
            return;
          }
          const retryPlain = retryData.find((song) => song.plainLyrics);
          if (retryPlain) {
            setPlainLyrics(retryPlain.plainLyrics as string);
          }
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
