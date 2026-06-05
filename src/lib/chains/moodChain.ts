import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

// ============================================================
// 📚 LEARN: moodChain.ts (LLMChain - Stateless)
// ============================================================
// We use LLMChain here because we don't need memory — we just want
// the AI to do one task immediately: translate a "Vibe" into "Search queries".
// 
// EX: "Melancholic rain" -> ["sad acoustic indie", "slow rain piano", "lofi chill sad"]
// This is called "Query Expansion" in AI engineering.
// ============================================================

export async function runMoodChain(moodQuery: string): Promise<string[]> {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash-latest",
    temperature: 0.5, // Lower temperature to force strict JSON output format
  });

  const prompt = PromptTemplate.fromTemplate(`
You are an expert music curator and YouTube search algorithm whisperer.
The user wants to listen to music matching this mood/vibe: "{moodQuery}"

Your job is to convert this mood into exactly 3 highly effective YouTube search queries 
that will return REAL songs matching this vibe.

RULES:
- Return ONLY a valid JSON array of strings. No markdown, no prose, no explanation.
- Example: ["upbeat 70s disco hits", "funky basslines 1970s", "classic funk dance tracks"]
- Do not wrap in \`\`\`json blocks, just return the raw array.
`);

  const chain = new LLMChain({
    llm: llm as any, // LLMChain just runs a single query without memory
    prompt: prompt as any,
  });

  const response = await chain.call({ moodQuery });
  
  try {
    // LLMs sometimes ignore instructions and wrap JSON in markdown anyway.
    // We clean it up before parsing:
    const cleanJson = (response.text as string).replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    const queries = JSON.parse(cleanJson);
    if (Array.isArray(queries)) return queries.slice(0, 3);
    return [];
  } catch (error) {
    console.error("Failed to parse mood chain JSON:", error, response.text);
    return [];
  }
}
