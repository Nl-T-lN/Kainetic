import { create } from 'zustand';

interface PlayerStoreState {
  positionMs: number;
  durationMs: number;
  isPlaying: boolean;
  setPositionMs: (pos: number) => void;
  setDurationMs: (dur: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

export const usePlayerStore = create<PlayerStoreState>((set) => ({
  positionMs: 0,
  durationMs: 0,
  isPlaying: false,
  setPositionMs: (pos) => set({ positionMs: pos }),
  setDurationMs: (dur) => set({ durationMs: dur }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
