import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";
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
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: "Missing artist id" }, { status: 400 });
  }

  try {
    const yt = await getInnertube();
    const artist = await yt.music.getArtist(id);

    const formatTrack = (item: any) => ({
      videoId: item.id,
      title: Array.isArray(item.title) ? item.title[0]?.text : item.title?.text || item.title || "Unknown Title",
      artist: item.authors?.[0]?.name || artist.header?.title?.text || "Unknown",
      channelTitle: item.authors?.[0]?.name || artist.header?.title?.text || "Unknown",
      thumbnailUrl: getHighResThumbnail(item.thumbnails),
      durationMs: item.duration?.seconds ? item.duration.seconds * 1000 : 0
    });

    const formatAlbum = (item: any) => ({
      id: item.id,
      title: item.title?.text || item.title || "Unknown Album",
      year: item.year?.text || item.year || "",
      thumbnailUrl: getHighResThumbnail(item.thumbnails)
    });

    let topTracks: any[] = [];
    let albums: any[] = [];
    let singles: any[] = [];

    // Parse the sections
    if (artist.sections) {
      for (const section of artist.sections) {
        let title = "";
        if ('header' in section) {
           title = (section.header as any)?.title?.text?.toLowerCase() || "";
        } else if ('title' in section) {
           title = (section.title as any)?.text?.toLowerCase() || "";
        }

        if (title.includes('songs') || title.includes('tracks')) {
          topTracks = section.contents?.filter((c:any) => c.type === 'MusicResponsiveListItem').map(formatTrack) || [];
        } else if (title.includes('albums')) {
          albums = section.contents?.filter((c:any) => c.type === 'MusicTwoRowItem').map(formatAlbum) || [];
        } else if (title.includes('singles')) {
          singles = section.contents?.filter((c:any) => c.type === 'MusicTwoRowItem').map(formatAlbum) || [];
        }
      }
    }

    // Sometimes yt.music returns a Top Songs playlist we might need to fetch separately if it's a shelf, 
    // but usually the first few songs are in contents directly.

    return NextResponse.json({
      name: (artist.header as any)?.title?.text,
      subscribers: (artist.header as any)?.subscribers?.text,
      description: (artist.header as any)?.description?.text,
      thumbnailUrl: getHighResThumbnail((artist.header as any)?.thumbnail || (artist.header as any)?.thumbnails),
      topTracks,
      albums,
      singles
    });
  } catch (error) {
    console.error("Artist API Error:", error);
    return NextResponse.json({ error: "Failed to fetch artist" }, { status: 500 });
  }
}
