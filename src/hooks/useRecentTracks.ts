import { useLibraryStore } from '@/store/libraryStore';
import type { Track } from '@/types/music';

export function useRecentTracks() {
  const recentTracks = useLibraryStore((state) => state.recentTracks);
  const addRecentTrack = useLibraryStore((state) => state.addRecentTrack);
  const setRecentTracksStore = useLibraryStore((state) => state.setRecentTracks);

  const setRecentTracks = (tracks: Track[]) => {
    setRecentTracksStore(tracks);
  };

  const addTrack = (track: Track) => {
    addRecentTrack(track);
  };

  const clearRecent = () => {
    setRecentTracksStore([]);
    fetch('/api/library/history', { method: 'DELETE' }).catch(console.error);
  };

  return { recentTracks, addTrack, clearRecent, setRecentTracks };
}
