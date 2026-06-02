import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";
import { getHighResThumbnail } from "@/lib/thumbnail";
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
  const type = searchParams.get("type") || "song";

  if (!query) {
    return NextResponse.json({ error: "Query 'q' is required" }, { status: 400 });
  }

  try {
    const yt = await getInnertube();
    
    // Search strictly for the specified type in YouTube Music
    const searchData = await yt.music.search(query, { type: type as any });

    if (type === "artist") {
      if (!searchData.artists?.contents || searchData.artists.contents.length === 0) {
        return NextResponse.json({ results: [] });
      }

      const results = searchData.artists.contents.map((item: any) => {
        const thumbnail = getHighResThumbnail(item.thumbnails);
        const artistId = item.id || item.endpoint?.payload?.browseId || null;
        return {
          id: artistId,
          name: item.name,
          subscribers: item.subscribers || "",
          thumbnailUrl: thumbnail,
          type: "artist"
        };
      });
      return NextResponse.json({ results });
    }

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
      const thumbnail = getHighResThumbnail(item.thumbnails);

      // Extract the artist name safely
      let channelTitle = "Unknown Artist";
      let artistId = undefined;
      
      if (item.artists && item.artists.length > 0) {
        channelTitle = item.artists.map((a: any) => a.name).join(", ");
        artistId = item.artists[0]?.channel_id || item.artists[0]?.id || item.artists[0]?.endpoint?.payload?.browseId;
      } else if (item.authors && item.authors.length > 0) {
        channelTitle = item.authors.map((a: any) => a.name).join(", ");
        artistId = item.authors[0]?.channel_id || item.authors[0]?.id || item.authors[0]?.endpoint?.payload?.browseId;
      }

      const videoId = item.id || item.video_id || item.endpoint?.payload?.videoId || item.play_endpoint?.payload?.videoId || item.overlay?.content?.endpoint?.payload?.videoId || null;

      return {
        videoId: videoId,
        title: item.title,
        channelTitle: channelTitle,
        artistId: artistId,
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
