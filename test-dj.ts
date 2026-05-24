import { runDJChain, createDJMemory } from "./src/lib/chains/djChain.js"; // Wait, I can just use a simple test file.
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function test() {
  try {
    const memory = createDJMemory();
    const result = await runDJChain({ title: "Test", artist: "Test" }, memory);
    console.log(result);
  } catch (err) {
    console.error("ERROR CAUGHT:", err);
  }
}

test();
