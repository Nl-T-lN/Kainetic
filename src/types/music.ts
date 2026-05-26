export interface Track {
  videoId: string;
  title: string;
  channelTitle?: string;
  artist: string;        // We will try to extract this from the title if possible
  artistId?: string;     // Added for artist page routing
  album?: string;        // Optional, YouTube doesn't always have this
  thumbnailUrl: string;
  durationMs: number;
}

export interface SearchResult {
  videoId: string;
  title: string;
  channelTitle?: string;
  artistId?: string;
  thumbnailUrl: string;
  durationMs: number;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
}
