import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { playlistId, track } = await req.json();

    // Verify playlist belongs to user
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId }
    });

    if (!playlist || playlist.userId !== user.id) {
      return NextResponse.json({ error: "Not Found or Unauthorized" }, { status: 404 });
    }

    // Upsert Track
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

    // Get current position count
    const count = await prisma.playlistTrack.count({
      where: { playlistId }
    });

    // Add to playlist
    await prisma.playlistTrack.create({
      data: {
        playlistId,
        trackId: track.videoId,
        position: count,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add Track API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const playlistId = searchParams.get("playlistId");
    const trackId = searchParams.get("trackId");

    if (!playlistId || !trackId) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    // Verify playlist belongs to user
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId }
    });

    if (!playlist || playlist.userId !== user.id) {
      return NextResponse.json({ error: "Not Found or Unauthorized" }, { status: 404 });
    }

    await prisma.playlistTrack.delete({
      where: {
        playlistId_trackId: {
          playlistId,
          trackId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove Track API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
