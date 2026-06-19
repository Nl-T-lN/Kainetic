import { NextResponse } from "next/server";
import { getSharedInnertube } from "@/lib/youtube";
import { getHighResThumbnail } from "@/lib/thumbnail";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing track ID" }, { status: 400 });
    }

    const yt = await getSharedInnertube();
    
    // Fetch both track info and up-next simultaneously
    const [info, upNext] = await Promise.all([
      yt.music.getInfo(id),
      yt.music.getUpNext(id).catch(() => null)
    ]);

    if (!info?.basic_info) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const basicInfo = info.basic_info;

    // Process up next tracks
    const relatedTracks = (upNext?.contents || []).filter((item: any) => item.type === "PlaylistPanelVideo").map((item: any) => {
      const title = item.title?.text || "Unknown";
      let author = "Unknown";
      let artistId = null;

      if (item.author) {
        author = typeof item.author === 'string' ? item.author : (item.author.name || item.author[0]?.name || "Unknown");
        artistId = typeof item.author !== 'string' ? (item.author.channel_id || item.author[0]?.channel_id) : null;
      }

      return {
        videoId: item.video_id,
        title,
        artist: author,
        artistId,
        thumbnailUrl: getHighResThumbnail(item.thumbnails || []),
        durationMs: (item.duration?.seconds || 0) * 1000,
        album: item.album?.name,
        albumId: item.album?.id,
      };
    });

    const result = {
      id: basicInfo.id,
      title: basicInfo.title,
      artist: basicInfo.author,
      thumbnailUrl: getHighResThumbnail(basicInfo.thumbnail || []),
      durationMs: (basicInfo.duration || 0) * 1000,
      tags: basicInfo.tags || [],
      viewCount: basicInfo.view_count,
      relatedTracks
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Track API Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
