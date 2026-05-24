"use client";

import { useEffect, useState, useRef } from "react";
import type { PlayerState, Track } from "@/types/music";

// ============================================================
// 📚 LEARN: usePlayerState.ts
// ============================================================
// Instead of relying on events, we POLL the YouTube player every 500ms
// to get the true playback position.
//
// Q: Why useRef for intervalId?
// A: If we used useState(null) for intervalId, setting it would trigger a re-render!
//    useRef holds mutable data that DOES NOT cause a re-render.
// ============================================================

export interface UsePlayerStateReturn extends PlayerState {
  setCurrentTrack: (track: Track | null) => void;
  queue: Track[];
  queueIndex: number;
  setQueue: (tracks: Track[], index?: number) => void;
  playNext: () => void;
  playPrev: () => void;
  insertNext: (track: Track) => void;
  addToQueue: (track: Track) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
}

export function usePlayerState(
  playerRef: React.MutableRefObject<YT.Player | null>
): UsePlayerStateReturn {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  
  const [queue, setQueueState] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("vintify_player_state");
      if (savedState) {
        const { track, savedQueue, savedIndex } = JSON.parse(savedState);
        if (track) setCurrentTrack(track);
        if (savedQueue) setQueueState(savedQueue);
        if (savedIndex !== undefined) setQueueIndex(savedIndex);
      }
    } catch (e) {
      console.error("Failed to parse saved player state", e);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (currentTrack || queue.length > 0) {
      localStorage.setItem("vintify_player_state", JSON.stringify({
        track: currentTrack,
        savedQueue: queue,
        savedIndex: queueIndex
      }));
    }
  }, [currentTrack, queue, queueIndex]);

  useEffect(() => {
    const pollState = () => {
      if (!playerRef.current || !playerRef.current.getPlayerState) return;

      const stateName = playerRef.current.getPlayerState();
      
      // YT.PlayerState.PLAYING is 1
      if (stateName === 1) {
        setIsPlaying(true);
        const pos = playerRef.current.getCurrentTime() * 1000;
        setPositionMs(pos);
        
        const dur = playerRef.current.getDuration() * 1000;
        if (dur > 0 && dur !== durationMs) {
          setDurationMs(dur);
        }
      } else {
        setIsPlaying(false);
      }
    };

    intervalRef.current = setInterval(pollState, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playerRef, durationMs]);

  const handleSetTrack = (track: Track | null) => {
    setCurrentTrack(track);
    setPositionMs(0);
    if (track) setDurationMs(track.durationMs);
  };

  const setQueue = (tracks: Track[], index: number = 0) => {
    setQueueState(tracks);
    setQueueIndex(index);
    if (tracks[index]) {
      handleSetTrack(tracks[index]);
    }
  };

  const playNext = () => {
    if (queue.length > 0 && queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      handleSetTrack(queue[nextIndex]);
    }
  };

  const playPrev = () => {
    if (positionMs > 3000) {
      // If we are more than 3 seconds in, just restart the song
      if (playerRef.current) playerRef.current.seekTo(0, true);
    } else if (queue.length > 0 && queueIndex > 0) {
      // Otherwise go to previous song
      const prevIndex = queueIndex - 1;
      setQueueIndex(prevIndex);
      handleSetTrack(queue[prevIndex]);
    }
  };

  const insertNext = (track: Track) => {
    const newQueue = [...queue];
    const insertIndex = queue.length > 0 ? queueIndex + 1 : 0;
    newQueue.splice(insertIndex, 0, track);
    setQueueState(newQueue);
    
    // If the queue was empty, play it immediately
    if (queue.length === 0) {
      setQueueIndex(0);
      handleSetTrack(track);
    }
  };

  const addToQueue = (track: Track) => {
    const newQueue = [...queue, track];
    setQueueState(newQueue);
    
    // If the queue was empty, play it immediately
    if (queue.length === 0) {
      setQueueIndex(0);
      handleSetTrack(track);
    }
  };

  const reorderQueue = (startIndex: number, endIndex: number) => {
    const newQueue = [...queue];
    const [removed] = newQueue.splice(startIndex, 1);
    newQueue.splice(endIndex, 0, removed);
    
    // Update queue index if the currently playing track was moved,
    // or if tracks were moved around the currently playing track
    let newIndex = queueIndex;
    if (startIndex === queueIndex) {
      newIndex = endIndex;
    } else if (startIndex < queueIndex && endIndex >= queueIndex) {
      newIndex--;
    } else if (startIndex > queueIndex && endIndex <= queueIndex) {
      newIndex++;
    }

    setQueueState(newQueue);
    setQueueIndex(newIndex);
  };

  return { 
    currentTrack, 
    isPlaying, 
    positionMs, 
    durationMs, 
    setCurrentTrack: handleSetTrack,
    queue,
    queueIndex,
    setQueue,
    playNext,
    playPrev,
    insertNext,
    addToQueue,
    reorderQueue
  };
}
