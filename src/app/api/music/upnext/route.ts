import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";
import { getHighResThumbnail } from "@/lib/thumbnail";

// Keep a global singleton so we don't recreate Innertube on every request (which is slow)
let ytClient: Innertube | null = null;

async function getYtClient() {
  if (!ytClient) {
    ytClient = await Innertube.create();
  }
  return ytClient;
}

interface YTMusicVideo {
  type: string;
  video_id: string;
  title: { text: string };
  author: string;
  artists?: Array<{ name: string }>;
  thumbnail: Array<{ url: string }>;
  duration: { seconds: number };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  try {
    const yt = await getYtClient();
    const info = await yt.music.getInfo(videoId);
    const upNext = await info.getUpNext();

    const tracks = (upNext.contents as any[])
      .filter((c) => c.type === "PlaylistPanelVideo" && c.video_id)
      .map((c) => {
        let artistId = undefined;
        let channelTitle = c.author || c.artists?.[0]?.name || "Unknown Artist";
        
        if (c.artists && c.artists.length > 0) {
          channelTitle = c.artists.map((a: any) => a.name).join(", ");
          artistId = c.artists[0]?.channel_id || c.artists[0]?.id || c.artists[0]?.endpoint?.payload?.browseId;
        } else if (c.authors && c.authors.length > 0) {
          channelTitle = c.authors.map((a: any) => a.name).join(", ");
          artistId = c.authors[0]?.channel_id || c.authors[0]?.id || c.authors[0]?.endpoint?.payload?.browseId;
        }

        return {
          videoId: c.video_id,
          title: c.title?.text || c.title || "Unknown Title",
          artist: channelTitle,
          channelTitle: channelTitle,
          artistId,
          thumbnailUrl: getHighResThumbnail(c.thumbnail),
          durationMs: (c.duration?.seconds || 0) * 1000,
        };
      });

    // Filter out the exact same song if it's the first one
    const filteredTracks = tracks.filter((t) => t.videoId !== videoId);

    return NextResponse.json({ tracks: filteredTracks });
  } catch (error) {
    console.error("UpNext API Error:", error);
    return NextResponse.json({ error: "Failed to fetch Up Next" }, { status: 500 });
  }
}
