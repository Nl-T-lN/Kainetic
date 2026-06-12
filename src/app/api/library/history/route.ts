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

    const { track } = await req.json();

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

    // Add to PlayHistory
    await prisma.playHistory.create({
      data: {
        userId: user.id,
        trackId: track.videoId,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add History API Error:", error);
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

    await prisma.playHistory.deleteMany({
      where: { userId: user.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear History API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
