import { NextResponse } from "next/server";
import { runDJChain, createDJMemory } from "@/lib/chains/djChain";
import { BufferMemory } from "langchain/memory";
import { LRUCache } from "lru-cache";

// ============================================================
// 📚 LEARN: api/ai/dj/route.ts
// ============================================================
// We need to keep the DJ's memory alive across multiple API calls,
// so we store memories in a global LRUCache associated with a `sessionId`.
// The LRUCache limits the number of sessions, preventing unbounded memory leaks.
// ============================================================

// Memory store for user sessions 
const memoryStore = new LRUCache<string, BufferMemory>({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hour TTL
});

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
