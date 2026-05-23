import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { PromptTemplate } from "@langchain/core/prompts";

// ============================================================
// 📚 LEARN: djChain.ts (ConversationChain)
// ============================================================
// LangChain makes building AI easy by chaining together common parts.
// We use "ConversationChain" here because the DJ needs MEMORY.
// When track 3 plays, the DJ needs to remember what track 1 was to make
// callbacks ("That was Daft Punk, moving on from the funk of Earth, Wind & Fire...").
// ============================================================

export function createDJMemory(): BufferMemory {
  // BufferMemory stores the entire chat history
  return new BufferMemory({
    memoryKey: "history",
    returnMessages: true,
  });
}

export async function runDJChain(
  input: { title: string; artist: string; album?: string; genre?: string; positionMs?: number },
  memory: BufferMemory
): Promise<string> {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-pro-latest",
    temperature: 0.7, // 0.7 gives a good mix of creativity and focus
  });

  const prompt = PromptTemplate.fromTemplate(`
You are GROOVEBOX, a vintage 1970s radio DJ. You are currently live on air.

CURRENT TRACK PLAYING: "{title}" by "{artist}" (Album: {album})

RULES:
1. Keep it under 3 sentences. Be punchy.
2. Mention one REAL fun fact about the artist, the era, or the recording process. No made-up facts.
3. Use casual 1970s DJ phrasing (e.g. "cats", "dig this", "spinning", "on the dial").
4. Vary your commentary. Don't always say the same intro.
5. If the history shows previous songs, you can smoothly transition from them.

Chat History:
{history}

Human (System): A new track just started playing. Give us your DJ intro!
DJ GROOVEBOX:
`);

  // We bind the LLM, the Memory, and the Prompt together into a Chain
  const chain = new ConversationChain({
    llm: llm as any,
    memory,
    prompt: prompt as any,
  });

  const response = await chain.call({
    title: input.title,
    artist: input.artist,
    album: input.album || "Unknown",
  });

  return response.response as string;
}
