import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Track } from "@/types/music";

export interface Playlist {
  id: string;
  name: string;
  coverUrl?: string;
  tracks: Track[];
  createdAt: number;
}

interface LibraryState {
  playlists: Playlist[];
  createPlaylist: (name: string, initialTracks?: Track[]) => string;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      playlists: [],

      createPlaylist: (name: string, initialTracks?: Track[]) => {
        const id = crypto.randomUUID();
        const newPlaylist: Playlist = {
          id,
          name,
          tracks: initialTracks || [],
          coverUrl: initialTracks && initialTracks.length > 0 ? initialTracks[0].thumbnailUrl : undefined,
          createdAt: Date.now(),
        };
        set({ playlists: [...get().playlists, newPlaylist] });
        return id;
      },

      deletePlaylist: (id: string) => {
        set({ playlists: get().playlists.filter((p) => p.id !== id) });
      },

      addTrackToPlaylist: (playlistId: string, track: Track) => {
        set({
          playlists: get().playlists.map((p) => {
            if (p.id === playlistId) {
              // Prevent duplicates
              if (p.tracks.some((t) => t.videoId === track.videoId)) return p;
              return {
                ...p,
                tracks: [...p.tracks, track],
                // Update cover to the newest track if it doesn't have one
                coverUrl: p.coverUrl || track.thumbnailUrl,
              };
            }
            return p;
          }),
        });
      },

      removeTrackFromPlaylist: (playlistId: string, trackId: string) => {
        set({
          playlists: get().playlists.map((p) => {
            if (p.id === playlistId) {
              return {
                ...p,
                tracks: p.tracks.filter((t) => t.videoId !== trackId),
              };
            }
            return p;
          }),
        });
      },
    }),
    {
      name: "vintify-library-storage", // stores in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
