
export interface YouTubeSearchItem {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
}

export interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
}

export interface YouTubeVideoItem {
  id: string; // The video ID
  contentDetails: {
    duration: string; // e.g. "PT4M32S" (ISO 8601 duration)
  };
}

export interface YouTubeVideoResponse {
  items: YouTubeVideoItem[];
}
