export interface Track {
  videoId: string;
  title: string;
  channelTitle?: string;
  artist: string;        // We will try to extract this from the title if possible
  album?: string;        // Optional, YouTube doesn't always have this
  thumbnailUrl: string;
  durationMs: number;
}

export interface SearchResult {
  videoId: string;
  title: string;
  channelTitle?: string;
  thumbnailUrl: string;
  durationMs: number;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
}
