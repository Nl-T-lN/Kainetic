"use client";

import { useState, useEffect } from "react";
import type { Track } from "@/types/music";

export interface UseLikedTracksReturn {
  likedTracks: Track[];
  toggleLike: (track: Track) => void;
  isLiked: (videoId: string) => boolean;
}

export function useLikedTracks(): UseLikedTracksReturn {
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vintify_liked_tracks");
      if (saved) {
        setLikedTracks(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load liked tracks", e);
    }
  }, []);

  const saveToStorage = (tracks: Track[]) => {
    try {
      localStorage.setItem("vintify_liked_tracks", JSON.stringify(tracks));
    } catch (e) {
      console.error("Failed to save liked tracks", e);
    }
  };

  const isLiked = (videoId: string) => {
    return likedTracks.some((t) => t.videoId === videoId);
  };

  const toggleLike = (track: Track) => {
    setLikedTracks((prev) => {
      let next;
      if (prev.some((t) => t.videoId === track.videoId)) {
        next = prev.filter((t) => t.videoId !== track.videoId);
      } else {
        next = [...prev, track];
      }
      saveToStorage(next);
      return next;
    });
  };

  return { likedTracks, toggleLike, isLiked };
}
