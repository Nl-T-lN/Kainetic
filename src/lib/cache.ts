import type { Track } from "@/types/music";

interface HomeCache {
  tracks: Track[] | null;
  hitlists: any[] | null;
  timestamp: number;
}

const cache: HomeCache = {
  tracks: null,
  hitlists: null,
  timestamp: 0,
};

export function getHomeCache() {
  return cache;
}

export function setHomeCache(tracks: Track[], hitlists: any[]) {
  cache.tracks = tracks;
  cache.hitlists = hitlists;
  cache.timestamp = Date.now();
}

export function clearHomeCache() {
  cache.tracks = null;
  cache.hitlists = null;
  cache.timestamp = 0;
}
