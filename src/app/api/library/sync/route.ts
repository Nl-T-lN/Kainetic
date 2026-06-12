import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma, ensureUserExists } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in our local DB
    await ensureUserExists(user);

    const dbPlaylists = await prisma.playlist.findMany({
      where: { userId: user.id },
      include: {
        tracks: {
          include: { track: true },
          orderBy: { position: 'asc' }
        }
      }
    });

    const playlists = dbPlaylists.map(p => ({
      id: p.id,
      name: p.name,
      coverUrl: p.coverUrl,
      createdAt: p.createdAt.getTime(),
      tracks: p.tracks.map(pt => ({
        videoId: pt.track.id,
        title: pt.track.title,
        artist: pt.track.artist,
        thumbnailUrl: pt.track.coverUrl,
        durationMs: pt.track.durationMs,
      }))
    }));

    const dbHistory = await prisma.playHistory.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: 'desc' },
      take: 50,
      include: { track: true }
    });

    const recentTracksMap = new Map();
    const recentTracks: any[] = [];
    for (const h of dbHistory) {
      if (!recentTracksMap.has(h.track.id)) {
        recentTracksMap.set(h.track.id, true);
        recentTracks.push({
          videoId: h.track.id,
          title: h.track.title,
          artist: h.track.artist,
          thumbnailUrl: h.track.coverUrl,
          durationMs: h.track.durationMs,
          playedAt: h.playedAt.getTime()
        });
      }
    }

    return NextResponse.json({ playlists, recentTracks });
  } catch (error) {
    console.error("Sync API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { playlists, recentTracks } = await req.json();

    await ensureUserExists(user);

    // 1. Sync recent tracks
    if (recentTracks && Array.isArray(recentTracks)) {
      for (const track of recentTracks) {
        await prisma.track.upsert({
          where: { id: track.videoId },
          update: {},
          create: {
            id: track.videoId,
            title: track.title,
            artist: track.channelTitle || track.artist || "Unknown Artist",
            coverUrl: track.thumbnailUrl,
            durationMs: track.durationMs,
          }
        });
        
        await prisma.playHistory.create({
          data: {
            userId: user.id,
            trackId: track.videoId,
            playedAt: track.playedAt ? new Date(track.playedAt) : undefined,
          }
        });
      }
    }

    // 2. Sync playlists
    if (playlists && Array.isArray(playlists)) {
      for (const p of playlists) {
        const dbPlaylist = await prisma.playlist.upsert({
          where: { id: p.id },
          update: {
            name: p.name,
            coverUrl: p.coverUrl,
          },
          create: {
            id: p.id,
            userId: user.id,
            name: p.name,
            coverUrl: p.coverUrl,
            createdAt: new Date(p.createdAt || Date.now()),
          }
        });

        if (p.tracks && Array.isArray(p.tracks)) {
          for (let i = 0; i < p.tracks.length; i++) {
            const track = p.tracks[i];
            await prisma.track.upsert({
              where: { id: track.videoId },
              update: {},
              create: {
                id: track.videoId,
                title: track.title,
                artist: track.channelTitle || track.artist || "Unknown Artist",
                coverUrl: track.thumbnailUrl,
                durationMs: track.durationMs,
              }
            });

            const existingPt = await prisma.playlistTrack.findUnique({
              where: {
                playlistId_trackId: {
                  playlistId: p.id,
                  trackId: track.videoId
                }
              }
            });

            if (!existingPt) {
              await prisma.playlistTrack.create({
                data: {
                  playlistId: p.id,
                  trackId: track.videoId,
                  position: i
                }
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Bulk Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
