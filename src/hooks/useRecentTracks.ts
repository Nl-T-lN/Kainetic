import { useState, useEffect } from 'react';
import type { Track } from '@/types/music';

const RECENT_TRACKS_KEY = 'ventify-recent-tracks';
const MAX_RECENT_TRACKS = 50;

export function useRecentTracks() {
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_TRACKS_KEY);
      if (stored) {
        setRecentTracks(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent tracks:', e);
    }
  }, []);

  const addTrack = (track: Track) => {
    setRecentTracks(prev => {
      // Remove track if it already exists to move it to the top
      const filtered = prev.filter(t => t.videoId !== track.videoId);
      const trackWithDate = { ...track, playedAt: Date.now() };
      const updated = [trackWithDate, ...filtered].slice(0, MAX_RECENT_TRACKS);
      
      try {
        localStorage.setItem(RECENT_TRACKS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent tracks:', e);
      }
      
      return updated;
    });
  };

  const clearRecent = () => {
    setRecentTracks([]);
    localStorage.removeItem(RECENT_TRACKS_KEY);
  };

  return { recentTracks, addTrack, clearRecent };
}
