# GROOVEBOX — Learning-First Next.js Build Plan 🎵

> **Goal:** Build a vintage music player (GROOVEBOX) using Next.js 14 + TypeScript + Styled Components, while **teaching you each concept** as we go. You'll code key parts yourself, and I'll explain every "why" before the "how."

## 🎯 The Learning Philosophy

This isn't a "paste code and run" project. Here's how each section works:

| Symbol | What it means | Your role |
|--------|--------------|-----------|
| 🟢 **YOU CODE** | I give you a skeleton + explanation | You write the implementation |
| 🔵 **WE CODE** | I write parts, you fill in the blanks | 50/50 collaboration |
| 🟡 **I BUILD** | I write complex infrastructure | You study + add comments |
| ❓ **QUIZ** | Quick concept checks before moving on | Answer before I continue |

---

## Phase 1: Project Scaffolding (You'll understand every flag)

### What you'll learn
- What `--app` vs Pages Router means
- Why `--no-tailwind` (we use Styled Components)
- Why `--src-dir` (separation of concerns)
- What `@/*` import aliases do
- Why each dependency exists

### Steps
1. 🟢 **YOU RUN:** Initialize the Next.js project (I'll explain each CLI flag)
2. 🟢 **YOU RUN:** Install dependencies (I'll explain what each package does)
3. 🔵 **WE BUILD:** Config files (`next.config.ts`, `tsconfig.json`, `.env.local`)

---

## Phase 2: Types, Theme & Shell (Part 1 from workflow)

### What you'll learn
- TypeScript interfaces vs types — when to use which
- The `declare module` pattern for extending library types
- Styled Components SSR with Next.js App Router
- Server Components vs Client Components

### Files to create
#### [NEW] [music.ts](file:///d:/Desktop/weblearn/vintify/src/types/music.ts)
- 🟢 **YOU CODE:** `Track`, `SearchResult`, `PlayerState` interfaces
- I provide the field descriptions, you write the TypeScript

#### [NEW] [party.ts](file:///d:/Desktop/weblearn/vintify/src/types/party.ts)
- 🟢 **YOU CODE:** `PartyRoom`, `PartyEvent` interfaces

#### [NEW] [youtube.ts](file:///d:/Desktop/weblearn/vintify/src/types/youtube.ts)
- 🔵 **WE CODE:** YouTube API response shapes (complex nested types)

#### [NEW] [theme.ts](file:///d:/Desktop/weblearn/vintify/src/styles/theme.ts)
- 🔵 **WE CODE:** Color tokens + `DefaultTheme` declaration
- Matches Stitch MCP design system colors

#### [NEW] [GlobalStyles.ts](file:///d:/Desktop/weblearn/vintify/src/styles/GlobalStyles.ts)
- 🟡 **I BUILD:** `createGlobalStyle` with scanlines + CRT effects

#### [NEW] [StyledRegistry.tsx](file:///d:/Desktop/weblearn/vintify/src/styles/StyledRegistry.tsx)
- 🟡 **I BUILD:** SSR style flush (tricky Next.js-specific pattern)
- ❓ **QUIZ:** Why can't Styled Components just work without a registry in App Router?

#### [NEW] [layout.tsx](file:///d:/Desktop/weblearn/vintify/src/app/layout.tsx)
- 🔵 **WE CODE:** Font loading + Providers

#### [NEW] [page.tsx](file:///d:/Desktop/weblearn/vintify/src/app/page.tsx)
- 🟢 **YOU CODE:** Simple placeholder (but with proper metadata)

---

## Phase 3: YouTube Search API Route (Part 2)

### What you'll learn
- Next.js API routes in App Router (`route.ts` exports)
- Server-side environment variables vs `NEXT_PUBLIC_`
- ISO 8601 duration parsing
- `NextResponse.json()` typed responses

#### [NEW] [route.ts](file:///d:/Desktop/weblearn/vintify/src/app/api/search/route.ts)
- 🟡 **I BUILD:** YouTube Data API proxy
- ❓ **QUIZ:** Why do we proxy through our server instead of calling YouTube directly from the browser?

---

## Phase 4: Player Hooks (Part 3)

### What you'll learn
- Custom hooks pattern (`use*` naming convention)
- `useRef` for mutable values that don't trigger re-renders
- Polling patterns with `setInterval` inside `useEffect`
- Debounce implementation from scratch

#### [NEW] [useYTPlayer.ts](file:///d:/Desktop/weblearn/vintify/src/hooks/useYTPlayer.ts)
- 🔵 **WE CODE:** YouTube IFrame lifecycle (I write the API loading, you write the control methods)

#### [NEW] [usePlayerState.ts](file:///d:/Desktop/weblearn/vintify/src/hooks/usePlayerState.ts)
- 🟢 **YOU CODE:** Polling `getCurrentTime()` every 500ms
- ❓ **QUIZ:** Why `useRef` for the interval ID instead of `useState`?

#### [NEW] [useSearch.ts](file:///d:/Desktop/weblearn/vintify/src/hooks/useSearch.ts)
- 🟢 **YOU CODE:** Debounced search hook
- ❓ **QUIZ:** What happens if you don't clean up `setTimeout` in the debounce?

---

## Phase 5: LangChain AI (Parts 4-6)

### What you'll learn
- Server-side only code in Next.js
- LangChain chain patterns (ConversationChain vs LLMChain)
- BufferMemory for conversational context
- Streaming responses
- JSON output parsing from LLM

#### Server Chains (Part 4)
- 🟡 **I BUILD:** All 4 chain files (complex LangChain setup)
- ❓ **QUIZ:** What's the difference between ConversationChain and LLMChain?

#### AI API Routes (Part 5)
- 🔵 **WE CODE:** `/api/ai/dj`, `/api/ai/mood`, `/api/ai/playlist`, `/api/ai/similar`
- 🟢 **YOU CODE:** The deduplication logic in `/api/ai/mood`

#### Client-side AI hooks (Part 6)
- 🟢 **YOU CODE:** `useDJ.ts`, `useMoodSearch.ts`, `usePlaylistGen.ts`, `useSimilarTracks.ts`
- Same pattern as Phase 4 hooks — you should be comfortable with hooks by now

---

## Phase 6: Party Mode & FFT (Parts 7-8)

### What you'll learn
- WebSocket pub/sub patterns
- Token auth vs API key exposure
- `requestAnimationFrame` draw loops
- Canvas 2D rendering
- Synthetic audio data generation

#### [NEW] Party mode files
- 🟡 **I BUILD:** Ably integration (WebSocket setup is tricky)
- 🟢 **YOU CODE:** The room code generator (4-char uppercase)

#### [NEW] FFT Visualizer
- 🔵 **WE CODE:** Canvas drawing (I write the draw loop, you write the bar colors and peak dots)
- ❓ **QUIZ:** Why can't we use real FFT data from YouTube's audio?

---

## Phase 7: UI Components (Parts 9-11)

### What you'll learn
- Styled Components patterns (props → CSS)
- CSS keyframes for animations
- Component composition patterns
- Responsive layout with CSS Grid

#### Pixel Icons (Part 9)
- 🟢 **YOU CODE:** SVG path data on 32×32 grid (I give you the grid template)

#### UI Components (Part 10)
- 🔵 **WE CODE:** I build the complex ones (Vinyl, FFTVisualizer), you build the simpler ones (SearchBar, Controls, ProgressBar)

#### Player Assembly (Part 11)
- 🔵 **WE CODE:** Final wiring of all hooks + components
- This is the "aha moment" where everything connects

---

## Phase 8: Build & Verify

### What you'll learn
- TypeScript strict mode compilation
- Build-time vs runtime errors
- Vercel environment variable setup

---

## Verification Plan

### Automated Checks
```bash
# TypeScript type-checking (must pass with zero errors)
npx tsc --noEmit

# Next.js production build (catches runtime errors)
npm run build

# Dev server (visual verification)
npm run dev
```

### Browser Testing (I'll use the browser tool)
1. Open `http://localhost:3000`
2. Verify the vintage theme renders (dark background, scanlines, Press Start 2P font)
3. Test search functionality returns YouTube results
4. Verify the FFT visualizer animates
5. Check that all styled components render without hydration errors

### Manual Testing (YOU verify)
1. **Search:** Type a song name → you should see results with thumbnails
2. **Playback:** Click a track → YouTube audio plays, vinyl spins
3. **FFT:** Spectrum analyzer shows animated bars during playback
4. **AI DJ:** When a track starts, the DJ panel should show commentary

> [!IMPORTANT]
> **API Keys Required:** You'll need `YOUTUBE_API_KEY` and `GOOGLE_API_KEY` to test search and AI features. Party mode requires `ABLY_API_KEY`. I'll guide you through getting these free-tier keys when we reach those parts.

---

## How We Start

> [!TIP]
> **We start with Phase 1 right now.** I'll walk you through every command and explain what it does. Then in Phase 2, you'll write your first TypeScript interfaces. Ready?

The first thing you'll do is run the Next.js scaffold command. I'll explain each flag before you hit enter.
