import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

export async function runPlaylistChain(vibeDescription: string): Promise<{
  playlistName: string;
  songs: Array<{ title: string; artist: string }>;
} | null> {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash-latest",
    temperature: 0.7, 
  });

  // Prompt Engineering trick: we give the LLM a rigid JSON schema to follow.
  const prompt = PromptTemplate.fromTemplate(`
You are an elite vintage music curator. 
Create an 8-song playlist based exactly on this vibe: "{vibeDescription}"

REQUIREMENTS:
1. Every single song MUST be a real, existing song by the real artist. Do not hallucinate.
2. Include a mix of well-known and slightly underground tracks.
3. Return ONLY valid JSON, adhering EXACTLY to this schema. No markdown, no prose.

SCHEMA:
{{
  "playlistName": "A creative, cool 2-4 word name for the playlist",
  "songs": [
    {{ "title": "Song Name", "artist": "Artist Name" }}
  ]
}}
`);

  const chain = new LLMChain({
    llm: llm as any,
    prompt: prompt as any,
  });
  const response = await chain.call({ vibeDescription });
  
  try {
    const cleanJson = (response.text as string).replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Failed to parse playlist JSON:", error);
    return null;
  }
}
