import { Innertube } from "youtubei.js";

// Central connection pool for youtubei.js
// Prevents memory leaks and API rate limits by sharing a single instance
let innertubeCache: Innertube | null = null;

export async function getSharedInnertube(): Promise<Innertube> {
  if (!innertubeCache) {
    innertubeCache = await Innertube.create();
  }
  return innertubeCache;
}
