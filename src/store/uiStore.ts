import { create } from "zustand";
import type { Track } from "@/types/music";

interface UIState {
  playlistModalTrack: Track | null;
  setPlaylistModalTrack: (track: Track | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  playlistModalTrack: null,
  setPlaylistModalTrack: (track) => set({ playlistModalTrack: track }),
}));
