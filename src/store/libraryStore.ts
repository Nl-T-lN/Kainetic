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
  setPlaylists: (playlists: Playlist[]) => void;
  createPlaylist: (name: string, initialTracks?: Track[]) => string;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      playlists: [],

      setPlaylists: (playlists: Playlist[]) => {
        set({ playlists });
      },

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

        // Sync API
        fetch('/api/library/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newPlaylist.id,
            name: newPlaylist.name,
            coverUrl: newPlaylist.coverUrl,
            createdAt: newPlaylist.createdAt
          })
        }).then(() => {
          if (initialTracks) {
            initialTracks.forEach(track => {
              fetch('/api/library/playlists/tracks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playlistId: id, track })
              }).catch(console.error);
            });
          }
        }).catch(console.error);

        return id;
      },

      deletePlaylist: (id: string) => {
        set({ playlists: get().playlists.filter((p) => p.id !== id) });
        fetch(`/api/library/playlists?id=${id}`, { method: 'DELETE' }).catch(console.error);
      },

      addTrackToPlaylist: (playlistId: string, track: Track) => {
        set({
          playlists: get().playlists.map((p) => {
            if (p.id === playlistId) {
              if (p.tracks.some((t) => t.videoId === track.videoId)) return p;
              return {
                ...p,
                tracks: [...p.tracks, track],
                coverUrl: p.coverUrl || track.thumbnailUrl,
              };
            }
            return p;
          }),
        });

        fetch('/api/library/playlists/tracks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlistId, track })
        }).catch(console.error);
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

        fetch(`/api/library/playlists/tracks?playlistId=${playlistId}&trackId=${trackId}`, { method: 'DELETE' }).catch(console.error);
      },
    }),
    {
      name: "vintify-library-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
