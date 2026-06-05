import { NextResponse } from "next/server";
import { getSharedInnertube } from "@/lib/youtube";
import { getHighResThumbnail } from "@/lib/thumbnail";

// Using shared singleton from @/lib/youtube

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "No id provided" }, { status: 400 });
    }
    
    const yt = await getSharedInnertube();
    
    let result: any;
    try {
      // Try fetching as an album first
      result = await yt.music.getAlbum(id);
    } catch (e) {
      // If it fails, try fetching as a playlist
      try {
        result = await yt.music.getPlaylist(id);
      } catch (e2) {
        return NextResponse.json({ error: "Failed to fetch album or playlist" }, { status: 500 });
      }
    }
    
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const title = result.header?.title?.text || result.title || "Unknown Album";
    const author = result.header?.author?.name || result.author || "Unknown Artist";
    const thumbnailUrl = getHighResThumbnail(result.header?.thumbnail?.contents || result.header?.thumbnails || result.thumbnails || []);
    
    const tracks = (result.contents || result.items || []).map((item: any) => {
      // Handle both album and playlist item structures
      const trackId = item.id || item.videoId || item.endpoint?.payload?.videoId || item.play_endpoint?.payload?.videoId || item.overlay?.content?.endpoint?.payload?.videoId;
      if (!trackId) return null;
      
      return {
        videoId: trackId,
        title: item.title?.text || item.title || "Unknown Track",
        artist: item.author?.name || item.authors?.[0]?.name || item.artists?.[0]?.name || author,
        thumbnailUrl: getHighResThumbnail(item.thumbnail?.contents || item.thumbnails || []) || thumbnailUrl,
        durationMs: item.duration?.seconds ? item.duration.seconds * 1000 : 0
      };
    }).filter(Boolean);
    
    return NextResponse.json({
      id,
      title,
      author,
      thumbnailUrl,
      tracks
    });
  } catch (error) {
    console.error("Album API Error:", error);
    return NextResponse.json({ error: "Failed to fetch album" }, { status: 500 });
  }
}
