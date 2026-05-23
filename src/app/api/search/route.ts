import { NextResponse } from "next/server";
import type { YouTubeSearchResponse, YouTubeVideoResponse } from "@/types/youtube";
import type { SearchResult } from "@/types/music";

// ============================================================
// 📚 LEARN: api/search/route.ts (I Build)
// ============================================================
// Here we proxy the YouTube Data API through our Next.js backend.
// 
// WHAT IS HAPPENING:
// 1. We receive a GET request like `/api/search?q=daft+punk`
// 2. We securely read process.env.YOUTUBE_API_KEY (safe on server!)
// 3. We call YouTube's "search.list" to get Video IDs.
// 4. We call YouTube's "videos.list" to get durations (search doesn't return duration).
// 5. We parse the weird "PT4M32S" duration string into milliseconds.
// 6. We return a clean JSON response matching our SearchResult interface.
// ============================================================

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Helper: Convert ISO 8601 duration string (e.g. "PT4M32S") to milliseconds
function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  
  const hours = (parseInt(match[1]) || 0);
  const minutes = (parseInt(match[2]) || 0);
  const seconds = (parseInt(match[3]) || 0);
  
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

export async function GET(request: Request) {
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ error: "Missing YouTube API Key setup in .env.local" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query 'q' is required" }, { status: 400 });
  }

  try {
    // 1. Search for videos (we append "official audio" to get better music matches)
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${encodeURIComponent(query + " official audio")}&type=video&videoCategoryId=10&key=${YOUTUBE_API_KEY}`
    );
    const searchData = (await searchRes.json()) as YouTubeSearchResponse;

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({ tracks: [] });
    }

    // 2. We need the durations, so we extract all the IDs
    const videoIds = searchData.items.map((item) => item.id.videoId).join(",");

    // 3. Fetch contentDetails for all those IDs to get the duration
    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    const videoData = (await videoRes.json()) as YouTubeVideoResponse;

    // Create a duration map { "videoId": durationMs }
    const durationMap: Record<string, number> = {};
    videoData.items?.forEach((item) => {
      durationMap[item.id] = parseISO8601Duration(item.contentDetails.duration);
    });

    // 4. Map into our clean SearchResult type
    const tracks: SearchResult[] = searchData.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'"), // basic unescape
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.high?.url || "",
      durationMs: durationMap[item.id.videoId] || 0,
    }));

    return NextResponse.json({ tracks });

  } catch (error) {
    console.error("YouTube API Error:", error);
    return NextResponse.json({ error: "Failed to fetch from YouTube" }, { status: 500 });
  }
}
