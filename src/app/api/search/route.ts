import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";
import type { SearchResult } from "@/types/music";

// ============================================================
// 📚 LEARN: api/search/route.ts (I Build)
// ============================================================
// We are now using the unlimited Innertube API via `youtubei.js`.
// This bypasses the strict daily quotas of the standard YouTube Data API v3,
// and gives us direct access to YouTube Music's high-quality metadata.
// ============================================================

// Keep a cached instance of Innertube for performance
let innertube: Innertube | null = null;

async function getInnertube() {
  if (!innertube) {
    // Generate an Innertube client
    innertube = await Innertube.create();
  }
  return innertube;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query 'q' is required" }, { status: 400 });
  }

  try {
    const yt = await getInnertube();
    
    // 1. Search strictly for songs in YouTube Music
    const searchData = await yt.music.search(query, { type: 'song' });

    if (!searchData.songs?.contents || searchData.songs.contents.length === 0) {
      return NextResponse.json({ tracks: [] });
    }

    // 2. Map into our clean SearchResult type
    const tracks: SearchResult[] = searchData.songs.contents.map((item: any) => {
      
      // Parse duration
      let durationMs = 0;
      if (item.duration && item.duration.seconds) {
        durationMs = item.duration.seconds * 1000;
      }

      // Get the highest resolution thumbnail
      const thumbnail = item.thumbnails && item.thumbnails.length > 0 
        ? item.thumbnails[item.thumbnails.length - 1].url 
        : "";

      // Extract the artist name safely
      let channelTitle = "Unknown Artist";
      if (item.artists && item.artists.length > 0) {
        channelTitle = item.artists.map((a: any) => a.name).join(", ");
      } else if (item.authors && item.authors.length > 0) {
        channelTitle = item.authors.map((a: any) => a.name).join(", ");
      }

      return {
        videoId: item.id,
        title: item.title,
        channelTitle: channelTitle,
        thumbnailUrl: thumbnail,
        durationMs,
      };
    }).filter(t => t.videoId); // Filter out any malformed items

    return NextResponse.json({ tracks });

  } catch (error) {
    console.error("YouTubei API Error:", error);
    return NextResponse.json({ error: "Failed to fetch from YouTubei" }, { status: 500 });
  }
}
