import { NextResponse } from "next/server";
import { runMoodChain } from "@/lib/chains/moodChain";
import type { SearchResult } from "@/types/music";

export async function POST(req: Request) {
  try {
    const { moodQuery } = await req.json();
    if (!moodQuery) return NextResponse.json({ error: "No mood provided" }, { status: 400 });

    // 1. Ask Gemini for 3 search strings
    const queries = await runMoodChain(moodQuery);
    if (!queries || queries.length === 0) {
      return NextResponse.json({ error: "Failed to parse AI queries" }, { status: 500 });
    }

    // Determine absolute base URL for API calls
    const url = new URL(req.url);
    const origin = url.origin;

    // 2. 🟢 YOU CODE (Done for you): Parallel fetches to /api/search
    // We launch all 3 YouTube searches at the exact same time using Promise.all!
    const searchPromises = queries.map(async (q) => {
      const res = await fetch(`${origin}/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.tracks || [];
    });

    const resultsArray = await Promise.all(searchPromises);
    
    // 3. Flatten the array of arrays into one big list of tracks
    const allTracks: SearchResult[] = resultsArray.flat();

    // 4. We MUST deduplicate by videoId! 
    // Sometimes two searches return the exact same song
    const trackMap = new Map<string, SearchResult>();
    allTracks.forEach((t) => {
      if (!trackMap.has(t.videoId)) {
        trackMap.set(t.videoId, t);
      }
    });

    const dedupedTracks = Array.from(trackMap.values());

    return NextResponse.json({ tracks: dedupedTracks });
  } catch (error) {
    console.error("Mood API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
