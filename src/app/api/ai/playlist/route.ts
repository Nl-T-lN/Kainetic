import { NextResponse } from "next/server";
import { runPlaylistChain } from "@/lib/chains/playlistChain";
import type { SearchResult } from "@/types/music";

export async function POST(req: Request) {
  try {
    const { vibeDescription } = await req.json();
    if (!vibeDescription) return NextResponse.json({ error: "No vibe description provided" }, { status: 400 });

    // 1. Get playlist suggestions from Gemini
    const playlistData = await runPlaylistChain(vibeDescription);
    if (!playlistData || !playlistData.songs) {
      return NextResponse.json({ error: "Failed to generate playlist structure" }, { status: 500 });
    }

    const { playlistName, songs } = playlistData;
    const url = new URL(req.url);
    const origin = url.origin;

    // 2. Parallel fetch for all suggested songs
    const searchPromises = songs.map(async (song) => {
      const q = `${song.title} ${song.artist}`;
      const res = await fetch(`${origin}/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return null;
      const data = await res.json();
      // We only want the top hit for each specific song
      return data.tracks?.[0] || null;
    });

    const results = await Promise.all(searchPromises);
    const validTracks = results.filter((track): track is SearchResult => track !== null);

    return NextResponse.json({ 
      playlistName, 
      tracks: validTracks 
    });
  } catch (error) {
    console.error("Playlist API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
