import { useState, useEffect } from 'react';
import type { Track } from '@/types/music';

const RECENT_TRACKS_KEY = 'ventify-recent-tracks';
const MAX_RECENT_TRACKS = 50;

export function useRecentTracks() {
  const [recentTracks, setRecentTracksState] = useState<Track[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_TRACKS_KEY);
      if (stored) {
        setRecentTracksState(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent tracks:', e);
    }
  }, []);

  const setRecentTracks = (tracks: Track[]) => {
    setRecentTracksState(tracks);
    try {
      localStorage.setItem(RECENT_TRACKS_KEY, JSON.stringify(tracks));
    } catch (e) {
      console.error('Failed to save recent tracks:', e);
    }
  };

  const addTrack = (track: Track) => {
    setRecentTracksState(prev => {
      // Remove track if it already exists to move it to the top
      const filtered = prev.filter(t => t.videoId !== track.videoId);
      const updated = [track, ...filtered].slice(0, MAX_RECENT_TRACKS);

      try {
        localStorage.setItem(RECENT_TRACKS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent tracks:', e);
      }

      return updated;
    });

    fetch('/api/library/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track })
    }).catch(console.error);
  };

  const clearRecent = () => {
    setRecentTracksState([]);
    localStorage.removeItem(RECENT_TRACKS_KEY);
    fetch('/api/library/history', { method: 'DELETE' }).catch(console.error);
  };

  return { recentTracks, addTrack, clearRecent, setRecentTracks };
}
