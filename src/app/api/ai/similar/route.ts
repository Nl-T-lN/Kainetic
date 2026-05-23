import { NextResponse } from "next/server";
import { runSimilarChain } from "@/lib/chains/similarChain";
import type { SearchResult } from "@/types/music";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const trackInfo = body.track || body;
    const { title, artist, album } = trackInfo;
    if (!title || !artist) return NextResponse.json({ error: "Title and artist required" }, { status: 400 });

    const similarSongs = await runSimilarChain({ title, artist, album });
    if (!similarSongs || similarSongs.length === 0) {
      return NextResponse.json({ tracks: [] });
    }

    const url = new URL(req.url);
    const origin = url.origin;

    const searchPromises = similarSongs.map(async (song) => {
      const q = `${song.title} ${song.artist}`;
      const res = await fetch(`${origin}/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.tracks?.[0] || null;
    });

    const results = await Promise.all(searchPromises);
    const validTracks = results.filter((track): track is SearchResult => track !== null);

    // Filter out the song we searched for, just in case AI returned it
    const dedupedFromCurrent = validTracks.filter(
      (t) => t.title.toLowerCase() !== title.toLowerCase()
    );

    return NextResponse.json({ tracks: dedupedFromCurrent });
  } catch (error) {
    console.error("Similar Tracks API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
