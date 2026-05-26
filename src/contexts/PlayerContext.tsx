import { createContext, useContext } from 'react';
import type { Track } from '@/types/music';

import type { UsePartyRoomReturn } from '@/hooks/usePartyRoom';

interface PlayerContextType {
  onPlay: (track: Track, contextQueue?: Track[]) => void;
  onPlayNext: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onStartRadio: (track: Track) => void;
  party: UsePartyRoomReturn;
  currentTrack: Track | null;
}

export const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerContext.Provider');
  }
  return context;
}
