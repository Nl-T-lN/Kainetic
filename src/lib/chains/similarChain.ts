import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

export async function runSimilarChain(track: { title: string; artist: string; album?: string }): Promise<Array<{ title: string; artist: string }> | null> {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash-latest",
    temperature: 0.5, 
  });

  const prompt = PromptTemplate.fromTemplate(`
The user is currently listening to:
"{title}" by "{artist}" (from "{album}")

Suggest 5 highly similar songs the listener would enjoy playing next.
Consider the era, tempo, mood, production style, and genre. Do not suggest other songs by the exact same artist.

Return ONLY a valid JSON array. No markdown, no explanation.

SCHEMA:
[
  {{ "title": "Song Name", "artist": "Artist Name" }}
]
`);

  const chain = new LLMChain({
    llm: llm as any,
    prompt: prompt as any,
  });
  const response = await chain.call({ 
    title: track.title, 
    artist: track.artist, 
    album: track.album || "Unknown" 
  });
  
  try {
    const cleanJson = (response.text as string).replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Failed to parse similar tracks JSON:", error);
    return null;
  }
}
