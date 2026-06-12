import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLibraryStore } from '@/store/libraryStore';
import { useRecentTracks } from './useRecentTracks';

export function useLibrarySync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const supabase = createClient();
  const hasSynced = useRef(false);
  
  const setPlaylists = useLibraryStore((state) => state.setPlaylists);
  const { setRecentTracks } = useRecentTracks();

  useEffect(() => {
    let mounted = true;

    const performSync = async () => {
      if (hasSynced.current) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return;
        
        setIsSyncing(true);

        const res = await fetch('/api/library/sync');
        if (!res.ok) throw new Error('Sync failed');

        const { playlists: dbPlaylists, recentTracks: dbRecentTracks } = await res.json();
        
        const localPlaylists = useLibraryStore.getState().playlists || [];
        const localRecentTracks = useLibraryStore.getState().recentTracks || [];

        let needsUpload = false;

        // Merge Playlists
        const mergedPlaylistsMap = new Map();
        if (dbPlaylists) {
          dbPlaylists.forEach((p: any) => mergedPlaylistsMap.set(p.id, JSON.parse(JSON.stringify(p)))); // Deep copy
        }
        localPlaylists.forEach((p: any) => {
          if (!mergedPlaylistsMap.has(p.id)) {
            mergedPlaylistsMap.set(p.id, p);
            needsUpload = true; // Local playlist not in DB
          } else {
            // Deep merge tracks if playlist exists in both
            const dbP = mergedPlaylistsMap.get(p.id);
            const dbTracksMap = new Map();
            if (dbP.tracks) dbP.tracks.forEach((t: any) => dbTracksMap.set(t.videoId, t));
            
            let playlistNeedsUpload = false;
            if (p.tracks) {
              p.tracks.forEach((t: any) => {
                if (!dbTracksMap.has(t.videoId)) {
                  dbP.tracks.push(t);
                  playlistNeedsUpload = true;
                }
              });
            }
            if (playlistNeedsUpload) {
              needsUpload = true;
              mergedPlaylistsMap.set(p.id, dbP);
            }
          }
        });
        const mergedPlaylists = Array.from(mergedPlaylistsMap.values());

        // Merge Recent Tracks
        const mergedRecentMap = new Map();
        if (dbRecentTracks) {
          dbRecentTracks.forEach((t: any) => mergedRecentMap.set(t.videoId, t));
        }
        localRecentTracks.forEach((t: any) => {
          if (!mergedRecentMap.has(t.videoId)) {
            mergedRecentMap.set(t.videoId, t);
            needsUpload = true; // Local track not in DB
          }
        });
        const mergedRecentTracks = Array.from(mergedRecentMap.values())
          .sort((a: any, b: any) => (b.playedAt || 0) - (a.playedAt || 0))
          .slice(0, 50);

        if (needsUpload) {
          await fetch('/api/library/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playlists: mergedPlaylists,
              recentTracks: mergedRecentTracks
            })
          });
        }
        
        if (mounted) {
          setPlaylists(mergedPlaylists);
          setRecentTracks(mergedRecentTracks);
          hasSynced.current = true;
        }
      } catch (error) {
        console.error('Failed to sync library from database:', error);
      } finally {
        if (mounted) {
          setIsSyncing(false);
        }
      }
    };

    performSync();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        hasSynced.current = false;
        performSync();
      } else if (event === 'SIGNED_OUT') {
        hasSynced.current = false;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isSyncing };
}
