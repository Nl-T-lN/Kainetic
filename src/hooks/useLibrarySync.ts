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
        
        // Fetch local state
        const localPlaylists = useLibraryStore.getState().playlists || [];
        const storedRecent = localStorage.getItem('ventify-recent-tracks');
        const localRecentTracks = storedRecent ? JSON.parse(storedRecent) : [];

        let mergedPlaylists = [...localPlaylists];
        let mergedRecentTracks = [...localRecentTracks];
        let needsUpload = false;

        if (dbPlaylists && dbPlaylists.length > 0) {
          mergedPlaylists = dbPlaylists;
        } else if (localPlaylists.length > 0) {
          needsUpload = true;
        }

        if (dbRecentTracks && dbRecentTracks.length > 0) {
          mergedRecentTracks = dbRecentTracks;
        } else if (localRecentTracks.length > 0) {
          needsUpload = true;
        }

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
