import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";
import type { SearchResult } from "@/types/music";
import { getHighResThumbnail } from "@/lib/thumbnail";

let innertube: Innertube | null = null;

async function getInnertube() {
  if (!innertube) {
    innertube = await Innertube.create();
  }
  return innertube;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  try {
    const yt = await getInnertube();
    
    // Get the "Up Next" queue for a specific video ID using YouTube Music
    const upNext = await yt.music.getUpNext(videoId);

    if (!upNext.contents || upNext.contents.length === 0) {
      return NextResponse.json({ tracks: [] });
    }

    const tracks: SearchResult[] = [];

    // upNext.contents contains the queue. It might be grouped or just a list of items.
    // Usually, the actual playlist items are in a PlaylistPanel or similar.
    // For simplicity, we just extract any "item" that has an id and title.
    
    // A quick hack to traverse the upNext contents and find track items
    const extractItems = (obj: any) => {
      if (!obj) return;
      if (Array.isArray(obj)) {
        obj.forEach(extractItems);
      } else if (typeof obj === "object") {
        if (obj.type === "PlaylistPanelVideoItem" || obj.type === "MusicResponsiveListItem") {
          
          let durationMs = 0;
          if (obj.duration && obj.duration.seconds) {
            durationMs = obj.duration.seconds * 1000;
          }

          const thumbnail = getHighResThumbnail(obj.thumbnails);

          let channelTitle = "Unknown Artist";
          if (obj.artists && obj.artists.length > 0) {
            channelTitle = obj.artists.map((a: any) => a.name).join(", ");
          } else if (obj.authors && obj.authors.length > 0) {
            channelTitle = obj.authors.map((a: any) => a.name).join(", ");
          }

          if (obj.id || obj.endpoint?.payload?.videoId) {
             tracks.push({
               videoId: obj.id || obj.endpoint?.payload?.videoId,
               title: obj.title,
               channelTitle: channelTitle,
               thumbnailUrl: thumbnail,
               durationMs,
             });
          }
        }
        Object.values(obj).forEach(extractItems);
      }
    };

    extractItems(upNext.contents);

    // Filter out duplicates (often the requested video is the first item)
    const uniqueTracks = Array.from(new Map(tracks.map(item => [item.videoId, item])).values());

    return NextResponse.json({ tracks: uniqueTracks });

  } catch (error) {
    console.error("YouTubei API Error:", error);
    return NextResponse.json({ error: "Failed to fetch recommendations from YouTubei" }, { status: 500 });
  }
}
