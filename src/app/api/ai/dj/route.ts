import { NextResponse } from "next/server";
import { runDJChain, createDJMemory } from "@/lib/chains/djChain";
import { BufferMemory } from "langchain/memory";

// ============================================================
// 📚 LEARN: api/ai/dj/route.ts
// ============================================================
// We need to keep the DJ's memory alive across multiple API calls,
// so we store memories in a global Map associated with a `sessionId`.
// Note: In a real distributed backend, you'd save this to Redis!
// For this tutorial, an in-memory Map is fine.
// ============================================================

// Memory store for user sessions 
const memoryStore = new Map<string, BufferMemory>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, artist, album, genre, positionMs, sessionId } = body;

    if (!sessionId || !title || !artist) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get existing memory or create new
    if (!memoryStore.has(sessionId)) {
      memoryStore.set(sessionId, createDJMemory());
    }
    const memory = memoryStore.get(sessionId)!;

    // Run the LLM Chain
    const djText = await runDJChain({ title, artist, album, genre, positionMs }, memory);

    return NextResponse.json({ text: djText });
  } catch (error) {
    console.error("DJ API Error:", error);
    return NextResponse.json({ error: "Failed to run AI DJ" }, { status: 500 });
  }
}
