"use client";

import { useState, useEffect } from "react";

export interface SavedPlaylist {
  playlistId: string;
  title: string;
  author: string;
  thumbnailUrl?: string;
  type: string;
}

export interface UseSavedPlaylistsReturn {
  savedPlaylists: SavedPlaylist[];
  toggleSave: (playlist: SavedPlaylist) => void;
  isSaved: (playlistId: string) => boolean;
}

export function useSavedPlaylists(): UseSavedPlaylistsReturn {
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vintify_saved_playlists");
      if (saved) {
        setSavedPlaylists(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load saved playlists", e);
    }
  }, []);

  const saveToStorage = (playlists: SavedPlaylist[]) => {
    try {
      localStorage.setItem("vintify_saved_playlists", JSON.stringify(playlists));
    } catch (e) {
      console.error("Failed to save playlists", e);
    }
  };

  const isSaved = (playlistId: string) => {
    return savedPlaylists.some((p) => p.playlistId === playlistId);
  };

  const toggleSave = (playlist: SavedPlaylist) => {
    const alreadySaved = isSaved(playlist.playlistId);

    setSavedPlaylists((prev) => {
      let next;
      if (alreadySaved) {
        next = prev.filter((p) => p.playlistId !== playlist.playlistId);
      } else {
        next = [playlist, ...prev];
      }
      saveToStorage(next);
      return next;
    });
  };

  return { savedPlaylists, toggleSave, isSaved };
}
