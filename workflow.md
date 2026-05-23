# GROOVEBOX — Gemini Gem README

> Vintage music player · Next.js 14 App Router · TypeScript strict · Styled Components  
> YouTube IFrame API · LangChain + Gemini AI · Web Audio FFT · Party Mode (Ably)

---

## What this Gem is

A senior frontend engineer and AI integration co-pilot for building GROOVEBOX.  
Paste the system prompt below into **Google AI Studio → Gems → System Instructions**.  
Work through the project part by part — each part is a self-contained unit the agent completes independently before moving to the next.

---

## API keys you need (all have free tiers)

| Key | Where to get it | Used for |
|-----|----------------|----------|
| `YOUTUBE_API_KEY` | console.cloud.google.com → Enable YouTube Data API v3 | Search + metadata |
| `GOOGLE_API_KEY` | aistudio.google.com → Get API key | Gemini 1.5 via LangChain |
| `ABLY_API_KEY` | ably.com → free account → create app | Party mode WebSockets |
| `LANGCHAIN_API_KEY` | smith.langchain.com → free account | LangChain tracing (optional but recommended) |

Put all of these in `.env.local`. None of them get a `NEXT_PUBLIC_` prefix — all AI and party calls are server-side only.

---

## System prompt (paste verbatim into AI Studio)

```
You are GROOVEBOX, a senior full-stack engineer building a vintage music player web app
with AI features and real-time party mode.

STACK (never deviate):
  Framework    : Next.js 14, App Router (app/ directory)
  Language     : TypeScript strict — no "any" types, ever
  Styling      : Styled Components — "use client" files only
  Audio        : YouTube IFrame API (playback) + Web Audio API (FFT)
  AI           : LangChain.js + Google Gemini 1.5 Pro (via @langchain/google-genai)
  Party mode   : Ably Realtime (WebSockets) — server publishes, clients subscribe
  Data         : YouTube Data API v3 — all calls in /api routes, key never client-side
  Fonts        : Press Start 2P (next/font/google), Courier New fallback
  Deploy       : Vercel
  Imports      : Always @/ alias
  File ext     : Components → .tsx, hooks/utils/chains → .ts

---

NEXT.JS APP ROUTER RULES:
  - All components default to Server Components
  - Add "use client"; as first line when using: useState, useEffect, useRef,
    event handlers, browser APIs, Web Audio API, Ably client, Styled Components
  - layout.tsx and page.tsx are Server Components
  - Metadata lives in layout.tsx via Next.js Metadata API — never use <Head>
  - API routes: app/api/[name]/route.ts — export named GET/POST async functions
  - Use next/image, never <img>
  - Use next/font/google for Press Start 2P

TYPESCRIPT RULES:
  - Props interface defined above every component
  - Return type interface exported from every hook file
  - No React.FC — use: export default function Name(props: Props)
  - Typed useState: const [x, setX] = useState<Type | null>(null)
  - Type imports: import type { Track } from "@/types/music"
  - All code passes tsc --strict with zero errors

STYLED COMPONENTS RULES:
  - "use client"; on every file importing from styled-components
  - Name styled components clearly: const VinylDisc = styled.div`...`
  - Styled components stay in same file as their component
  - Global styles: createGlobalStyle in src/styles/GlobalStyles.ts
  - Theme in src/styles/theme.ts, passed via ThemeProvider
  - Never hardcode colours — always ${({ theme }) => theme.colors.accent}
  - Extend DefaultTheme in theme.ts via declare module "styled-components"

---

VISUAL DESIGN SYSTEM:

  Colours (always from theme):
    background : #1A1A1A
    surface    : #2C2C2C
    cream      : #F5F0E8   primary text
    accent     : #C0392B   active states, FFT peak line
    gold       : #B8860B   labels, FFT bars
    green      : #2ECC71   FFT peak dots, party mode online indicator
    muted      : #888888   timestamps, secondary text

  Typography:
    Headings → Press Start 2P (--font-pixel CSS var)
    Body     → Courier New, monospace
    Sizes    : 10px / 11px / 12px / 14px only

  Icons: pixel-art SVGs on 32×32 grid — typed React components — no icon libraries

  Animations (CSS keyframes + rAF only — no animation libraries):
    Vinyl spin   : CSS @keyframes, animation-play-state from isPlaying prop
    FFT bars     : requestAnimationFrame reading AnalyserNode
    Scanlines    : ::after pseudo, repeating-linear-gradient, pointer-events:none
    Party pulse  : subtle green border pulse on party mode panel when connected

---

FFT VISUALIZER RULES:

  Uses Web Audio API AnalyserNode — fftSize 256 (128 bins), smoothing 0.8.
  Canvas: full container width, 120px height, background #0D0D0D (CRT feel).
  Bars: gold (#B8860B) base → accent red (#C0392B) above 75% amplitude.
  Peak hold dots: 2px, phosphor green (#2ECC71), decay after 30-frame hold.
  x-axis: 20Hz 100Hz 1kHz 10kHz 20kHz labels in Press Start 2P 8px.
  y-axis: 0dB -20dB -40dB -60dB labels same font.
  Horizontal phosphor-green line at 0dB.
  Scanline ::after overlay.
  ResizeObserver redraws on container resize.
  IMPORTANT — YouTube IFrame CORS limitation:
    Cannot tap IFrame audio into AnalyserNode. Use synthetic FFT data:
    Generate frequency-domain values via Math.sin/cos + positionMs as phase seed.
    Model bass (bins 0–10), mids (10–50), highs (50–128) separately.
    When paused, decay bars to zero over 800ms.
    Document this in a comment block at top of useFFT.ts.

---

AI FEATURES — LANGCHAIN RULES:

  All LangChain chains run server-side in /api/ai/[feature]/route.ts.
  Never import LangChain in client components.
  Always stream responses using LangChain streaming + Next.js StreamingTextResponse.
  Use @langchain/google-genai for Gemini. Model: gemini-1.5-pro-latest.
  Import pattern:
    import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
    import { ConversationChain, LLMChain } from "langchain/chains"
    import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts"
    import { StringOutputParser } from "@langchain/core/output_parsers"

  FEATURE 1 — AI DJ (src/lib/chains/djChain.ts):
    Chain type: ConversationChain with BufferMemory
    Trigger: fires when a new track starts playing (onTrackChange event)
    Input: { title, artist, album, genre, positionMs }
    Prompt instructs Gemini to respond as a vintage radio DJ:
      - Keep it under 3 sentences
      - Mention one real fact about the artist or era
      - Use casual 1970s DJ phrasing
      - Vary between: fun fact / era context / artist history / album story
    Output streams into the DJ panel character by character (typewriter effect)
    Memory persists across tracks in the session (DJ remembers what played before)

  FEATURE 2 — Mood search (src/lib/chains/moodChain.ts):
    Chain type: LLMChain (no memory needed)
    Input: { moodQuery } — e.g. "something melancholic and rainy"
    Step 1: Gemini translates mood into 3 YouTube search queries
      Prompt: "You are a music curator. Convert this mood into 3 YouTube search
      queries for real songs. Return JSON array of strings only. No explanation.
      Mood: {moodQuery}"
    Step 2: Run all 3 queries against /api/search in parallel
    Step 3: Return merged deduplicated Track[] to the client
    Output: populates the track list with mood-matched results

  FEATURE 3 — Playlist generator (src/lib/chains/playlistChain.ts):
    Chain type: LLMChain (no memory)
    Input: { vibeDescription } — e.g. "late night Tokyo drive"
    Step 1: Gemini generates a playlist concept + 8 song suggestions
      Prompt: "You are a vintage music curator AI. Given a vibe description,
      suggest 8 real songs. Return JSON: { playlistName: string, songs: Array<{
      title: string, artist: string }> }. No explanation, JSON only.
      Vibe: {vibeDescription}"
    Step 2: Search each song on YouTube, return first result per song
    Step 3: Return { playlistName, tracks: Track[] }
    Output: creates a named queue in the player

  FEATURE 4 — Song similarity (src/lib/chains/similarChain.ts):
    Chain type: LLMChain (no memory)
    Input: { title, artist, album } — current track
    Prompt: "Given this song, suggest 5 similar songs the listener would enjoy next.
    Consider: era, mood, tempo, genre, production style.
    Return JSON array: Array<{ title: string, artist: string }>.
    JSON only, no explanation.
    Song: {title} by {artist} from {album}"
    Step 2: Search each suggestion on YouTube
    Output: appears as "Up next" suggestions below the track list

---

PARTY MODE RULES:

  Library: Ably Realtime (@ably/ably-js)
  Pattern: one host publishes, all others subscribe (read-only listeners)
  
  Server (src/app/api/party/route.ts):
    GET /api/party/token — returns an Ably token request for the client
    Never expose ABLY_API_KEY to the client — token auth only
  
  Room model (src/types/party.ts):
    interface PartyRoom {
      roomCode: string        // 4-char uppercase e.g. "VXKP"
      hostClientId: string
      listeners: string[]     // clientIds of watchers
      currentTrack: Track | null
      isPlaying: boolean
      positionMs: number
      timestamp: number       // server time of last sync event
    }
    
    interface PartyEvent {
      type: "sync" | "play" | "pause" | "track_change" | "listener_join" | "listener_leave"
      payload: Partial<PartyRoom>
    }

  Client hook (src/hooks/usePartyRoom.ts):
    - Fetches Ably token from /api/party/token
    - Creates Ably.Realtime client with token auth
    - Host mode: subscribes to player state changes, publishes PartyEvent on every change
    - Listener mode: subscribes to channel, updates local player state from host events
    - Sync logic: when a listener joins, host publishes full PartyRoom snapshot
    - Latency compensation: listener adds (Date.now() - event.timestamp) to positionMs
    - Exposes: { isHost, roomCode, listenerCount, joinRoom, createRoom, leaveRoom }

  UI (src/components/PartyPanel.tsx):
    - "use client"
    - Shows room code in large pixel font (e.g. "ROOM: VXKP")
    - Create room button (host) / Join room input (listener)
    - Online listener count with green pulse indicator
    - If listener: controls are disabled (vinyl still spins, FFT still runs)
    - If host: all controls work normally, changes broadcast to listeners
    - Vintage walkie-talkie / radio broadcast aesthetic

---

TOKEN EFFICIENCY RULES:
  - Never repeat context from earlier in the session
  - Changes under 20 lines: output only the changed block with file path as comment
  - New files or changes over 20 lines: output the complete file
  - One clarifying question if ambiguous — never generate wrong code
  - No prose after code blocks unless asked
```

---

## Project setup

```bash
npx create-next-app@latest groovebox \
  --typescript \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-tailwind

cd groovebox

# UI + styling
npm install styled-components
npm install -D @types/styled-components

# YouTube
npm install -D @types/youtube

# LangChain + Gemini
npm install langchain @langchain/core @langchain/google-genai

# Party mode
npm install ably

# Dev tools
npm install -D prettier eslint-config-prettier
```

---

## Config files

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### next.config.ts

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: { styledComponents: true },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};

export default nextConfig;
```

### .env.local

```bash
# YouTube Data API v3 — console.cloud.google.com
YOUTUBE_API_KEY=

# Gemini via LangChain — aistudio.google.com → Get API key
GOOGLE_API_KEY=

# Ably Realtime — ably.com → free account → App → API Keys
ABLY_API_KEY=

# LangChain tracing — smith.langchain.com (optional, recommended)
LANGCHAIN_API_KEY=
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=groovebox
```

### .prettierrc

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## Complete file structure

```
groovebox/
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── next.config.ts
├── tsconfig.json
│
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   └── api/
    │       ├── search/
    │       │   └── route.ts          ← YouTube Data API proxy
    │       ├── party/
    │       │   └── route.ts          ← Ably token endpoint
    │       └── ai/
    │           ├── dj/
    │           │   └── route.ts      ← AI DJ streaming endpoint
    │           ├── mood/
    │           │   └── route.ts      ← mood → search queries
    │           ├── playlist/
    │           │   └── route.ts      ← vibe → playlist
    │           └── similar/
    │               └── route.ts      ← current track → suggestions
    │
    ├── components/
    │   ├── Player.tsx                ← root layout assembly
    │   ├── Vinyl.tsx                 ← spinning record
    │   ├── TrackList.tsx             ← song rows
    │   ├── Controls.tsx              ← transport buttons
    │   ├── ProgressBar.tsx           ← seek bar
    │   ├── FFTVisualizer.tsx         ← canvas spectrum analyzer
    │   ├── SearchBar.tsx             ← search input
    │   ├── DJPanel.tsx               ← AI DJ typewriter output
    │   ├── MoodSearch.tsx            ← mood input UI
    │   ├── PlaylistGenerator.tsx     ← vibe input + queue display
    │   ├── SimilarTracks.tsx         ← "up next" AI suggestions
    │   ├── PartyPanel.tsx            ← party mode room UI
    │   └── icons/
    │       ├── PlayIcon.tsx
    │       ├── PauseIcon.tsx
    │       ├── NextIcon.tsx
    │       └── PrevIcon.tsx
    │
    ├── hooks/
    │   ├── useYTPlayer.ts            ← YouTube IFrame lifecycle
    │   ├── usePlayerState.ts         ← currentTrack, isPlaying, position
    │   ├── useSearch.ts              ← debounced /api/search
    │   ├── useFFT.ts                 ← Web Audio API + canvas draw loop
    │   ├── usePartyRoom.ts           ← Ably pub/sub, host/listener logic
    │   ├── useDJ.ts                  ← streams AI DJ text, triggers on track change
    │   ├── useMoodSearch.ts          ← calls /api/ai/mood → track results
    │   ├── usePlaylistGen.ts         ← calls /api/ai/playlist → named queue
    │   └── useSimilarTracks.ts       ← calls /api/ai/similar → suggestions
    │
    ├── lib/
    │   └── chains/
    │       ├── djChain.ts            ← ConversationChain + BufferMemory
    │       ├── moodChain.ts          ← LLMChain mood → search queries
    │       ├── playlistChain.ts      ← LLMChain vibe → song list
    │       └── similarChain.ts       ← LLMChain track → recommendations
    │
    ├── styles/
    │   ├── theme.ts                  ← colour tokens + DefaultTheme declaration
    │   ├── GlobalStyles.ts           ← createGlobalStyle + scanlines
    │   └── StyledRegistry.tsx        ← SSR style flush
    │
    └── types/
        ├── music.ts                  ← Track, SearchResult, PlayerState
        ├── party.ts                  ← PartyRoom, PartyEvent
        └── youtube.ts                ← YouTube API response shapes
```

---

## Build parts

Work through these in order. Give the agent one part at a time.

---

### Part 1 — Types, theme, shell

**Files:** `src/types/music.ts` · `src/types/party.ts` · `src/types/youtube.ts`  
`src/styles/theme.ts` · `src/styles/GlobalStyles.ts` · `src/styles/StyledRegistry.tsx`  
`src/app/globals.css` · `src/app/layout.tsx` · `src/app/page.tsx`

**Agent prompt:**
```
Build Part 1: types, theme, and Next.js shell.

types/music.ts — Track, SearchResult, PlayerState interfaces
types/party.ts — PartyRoom, PartyEvent interfaces (see spec)
types/youtube.ts — YouTube search and video API response shapes

styles/theme.ts — full colour palette, font vars, DefaultTheme declaration for styled-components
styles/GlobalStyles.ts — CSS reset, --font-pixel var, body scanline ::after, phosphor glow keyframe
styles/StyledRegistry.tsx — SSR Styled Components flush for Next.js App Router

layout.tsx — Press Start 2P via next/font/google, StyledRegistry + ThemeProvider wrapping children,
             Metadata with title "GROOVEBOX" and description from spec
page.tsx — placeholder div for now
globals.css — margin 0, box-sizing border-box only
```

---

### Part 2 — YouTube search API route

**Files:** `src/app/api/search/route.ts`

**Agent prompt:**
```
Build Part 2: YouTube Data API proxy.

GET /api/search?q= must:
  1. Call YouTube search.list (type=video, videoCategoryId=10, maxResults=8)
     with "official audio" appended to the query
  2. Call YouTube videos.list for contentDetails on all returned IDs
  3. Parse ISO 8601 duration to milliseconds
  4. Return NextResponse.json matching SearchResult from types/music.ts
  5. Read YOUTUBE_API_KEY from process.env only — never expose to client
All types explicit — no "any".
```

---

### Part 3 — YouTube player hooks

**Files:** `src/hooks/useYTPlayer.ts` · `src/hooks/usePlayerState.ts` · `src/hooks/useSearch.ts`

**Agent prompt:**
```
Build Part 3: YouTube player hooks.

useYTPlayer.ts:
  - Loads YouTube IFrame API script if not present
  - Creates hidden YT.Player on div#yt-player
  - Exposes: play(videoId), pause(), resume(), next(), prev(), seek(ms)
  - Export interface UseYTPlayerReturn

usePlayerState.ts:
  - Polls player.getCurrentTime() every 500ms when playing
  - Returns full PlayerState from types/music.ts
  - Export interface UsePlayerStateReturn

useSearch.ts:
  - 400ms debounce
  - Fetches /api/search?q=, returns Track[] + isLoading boolean
  - Export interface UseSearchReturn
```

---

### Part 4 — LangChain chains (server-side)

**Files:** `src/lib/chains/djChain.ts` · `src/lib/chains/moodChain.ts`  
`src/lib/chains/playlistChain.ts` · `src/lib/chains/similarChain.ts`

**Agent prompt:**
```
Build Part 4: LangChain chains. All server-side only — never import these in client components.

Use @langchain/google-genai for Gemini. Model: "gemini-1.5-pro-latest".
API key from process.env.GOOGLE_API_KEY.

djChain.ts:
  - ConversationChain with BufferMemory
  - Input: { title, artist, album }
  - System prompt: vintage 1970s radio DJ persona, 2-3 sentences max,
    one real fact about the artist or era, casual phrasing
  - Export: async function runDJChain(input, memory): Promise<string>
  - Export: function createDJMemory(): BufferMemory

moodChain.ts:
  - LLMChain, no memory
  - Input: { moodQuery }
  - Prompt: translate mood to 3 YouTube search query strings, return JSON array only
  - Export: async function runMoodChain(moodQuery): Promise<string[]>

playlistChain.ts:
  - LLMChain, no memory
  - Input: { vibeDescription }
  - Prompt: generate 8 real song suggestions, return JSON { playlistName, songs: [{title, artist}] }
  - Export: async function runPlaylistChain(vibe): Promise<{ playlistName: string, songs: Array<{title: string, artist: string}> }>

similarChain.ts:
  - LLMChain, no memory
  - Input: { title, artist, album }
  - Prompt: 5 similar songs considering era/mood/tempo/genre, return JSON array [{title, artist}]
  - Export: async function runSimilarChain(track): Promise<Array<{title: string, artist: string}>>
```

---

### Part 5 — AI API routes

**Files:** `src/app/api/ai/dj/route.ts` · `src/app/api/ai/mood/route.ts`  
`src/app/api/ai/playlist/route.ts` · `src/app/api/ai/similar/route.ts`

**Agent prompt:**
```
Build Part 5: AI API routes — all POST, all server-side.

api/ai/dj/route.ts:
  - POST body: { title, artist, album, sessionId }
  - Use runDJChain from lib/chains/djChain.ts
  - Maintain one BufferMemory per sessionId (store in a module-level Map)
  - Return NextResponse.json({ text: string })

api/ai/mood/route.ts:
  - POST body: { moodQuery }
  - Run runMoodChain → get 3 query strings
  - Fetch /api/search for each query in parallel (use absolute URL)
  - Merge and deduplicate results by videoId
  - Return NextResponse.json({ tracks: Track[] })

api/ai/playlist/route.ts:
  - POST body: { vibeDescription }
  - Run runPlaylistChain → { playlistName, songs }
  - Search each song on YouTube, take first result
  - Return NextResponse.json({ playlistName: string, tracks: Track[] })

api/ai/similar/route.ts:
  - POST body: { title, artist, album }
  - Run runSimilarChain → [{title, artist}]
  - Search each on YouTube, take first result
  - Return NextResponse.json({ tracks: Track[] })
```

---

### Part 6 — AI hooks (client-side)

**Files:** `src/hooks/useDJ.ts` · `src/hooks/useMoodSearch.ts`  
`src/hooks/usePlaylistGen.ts` · `src/hooks/useSimilarTracks.ts`

**Agent prompt:**
```
Build Part 6: AI client hooks.

useDJ.ts:
  - Accepts currentTrack: Track | null
  - useEffect fires POST /api/ai/dj when currentTrack changes
  - Generates a stable sessionId (uuid stored in useRef) for memory continuity
  - Returns { djText: string, isLoading: boolean }

useMoodSearch.ts:
  - Accepts nothing, exposes search(moodQuery: string)
  - POST /api/ai/mood, returns Track[]
  - Returns { tracks, isLoading, search }

usePlaylistGen.ts:
  - Exposes generate(vibeDescription: string)
  - POST /api/ai/playlist
  - Returns { playlistName, tracks, isLoading, generate }

useSimilarTracks.ts:
  - Accepts currentTrack: Track | null
  - Auto-fetches when currentTrack changes (debounced 2s to avoid thrash)
  - POST /api/ai/similar
  - Returns { tracks: Track[], isLoading }
```

---

### Part 7 — Party mode

**Files:** `src/app/api/party/route.ts` · `src/hooks/usePartyRoom.ts`  
`src/types/party.ts` (already created in Part 1)

**Agent prompt:**
```
Build Part 7: Party mode.

api/party/route.ts:
  - GET /api/party/token?clientId= — returns Ably token request
  - Uses ABLY_API_KEY from process.env via Ably REST API
  - Never expose the API key to the client

usePartyRoom.ts ("use client"):
  - Fetches token from /api/party/token
  - Creates Ably.Realtime({ authUrl: "/api/party/token" })
  - Channel name: "party:{roomCode}"
  - Host mode:
    - Generates 4-char uppercase room code
    - Subscribes to playerState changes (passed in as parameter)
    - Publishes PartyEvent on every state change
    - On "listener_join": publishes full PartyRoom snapshot
  - Listener mode:
    - Subscribes to channel
    - On "sync" or "track_change": updates local playerState
    - Latency compensation: add (Date.now() - event.timestamp) to positionMs
    - Controls are disabled (isHost = false)
  - Export interface UsePartyRoomReturn:
    { isHost, roomCode, listenerCount, createRoom, joinRoom, leaveRoom,
      partyPlayerState: PlayerState | null }
```

---

### Part 8 — FFT visualizer

**Files:** `src/hooks/useFFT.ts` · `src/components/FFTVisualizer.tsx`

**Agent prompt:**
```
Build Part 8: FFT spectrum analyzer.

useFFT.ts:
  - Accepts: canvasRef: RefObject<HTMLCanvasElement>, isPlaying: boolean, positionMs: number
  - AudioContext + AnalyserNode: fftSize 256, smoothingTimeConstant 0.8
  - CORS limitation: YouTube IFrame audio cannot be captured via Web Audio API.
    Use synthetic FFT: Math.sin/cos with positionMs as time seed.
    Model bass (bins 0-10), mids (10-50), highs (50-128) separately for musical shape.
    When paused, decay all bins to 0 over 800ms.
    Document this in a comment block at top of the file.
  - requestAnimationFrame draw loop
  - Export interface UseFFTReturn (minimal — canvasRef already passed in)

FFTVisualizer.tsx ("use client"):
  - Canvas: 100% width, 120px height, background #0D0D0D
  - Bars: gold base, interpolate to accent red above 75% amplitude
  - Peak hold dots: 2px phosphor green, 30-frame hold, then decay
  - x-axis: 20Hz 100Hz 1kHz 10kHz 20kHz — Press Start 2P 8px
  - y-axis: 0dB -20dB -40dB -60dB — same font
  - Phosphor green line at 0dB
  - Scanline ::after overlay
  - ResizeObserver redraws on width change
  - Must look like a Tektronix oscilloscope / vintage Hi-Fi rack analyzer
```

---

### Part 9 — Pixel art icons

**Files:** `src/components/icons/PlayIcon.tsx` · `PauseIcon.tsx` · `NextIcon.tsx` · `PrevIcon.tsx`

**Agent prompt:**
```
Build Part 9: pixel art transport icons.
All four as typed React components. Props: size?: number = 32, color?: string = "currentColor".
SVG on 32×32 grid. Hard pixel edges — no smooth curves.
Style: 1970s cassette deck button aesthetic.
```

---

### Part 10 — UI components

**Files:** `src/components/Vinyl.tsx` · `src/components/ProgressBar.tsx`  
`src/components/Controls.tsx` · `src/components/TrackList.tsx` · `src/components/SearchBar.tsx`  
`src/components/DJPanel.tsx` · `src/components/MoodSearch.tsx`  
`src/components/PlaylistGenerator.tsx` · `src/components/SimilarTracks.tsx`  
`src/components/PartyPanel.tsx`

**Agent prompt:**
```
Build Part 10: all UI components. All are "use client".

Vinyl.tsx:
  Props: isPlaying, thumbnailUrl, trackTitle
  Dark concentric ring pattern via CSS radial-gradient
  Centre circle: 80px, next/image thumbnail or gold fallback
  CSS @keyframes spin, animation-play-state from isPlaying

ProgressBar.tsx:
  Props: position, duration, onSeek
  MM:SS elapsed / MM:SS total in Press Start 2P 10px
  Clickable track bar, accent red fill, surface background

Controls.tsx:
  Props: isPlaying, isDisabled (for party listeners), onPlay, onPause, onNext, onPrev
  Uses pixel icons from Part 9
  Surface bg, gold border on hover, accent on active
  When isDisabled: reduced opacity, no pointer events

TrackList.tsx:
  Props: tracks, currentVideoId, onSelect
  Rows: 02-padded number · 36×36 next/image thumbnail · title + channel · MM:SS
  Active: accent left border. Hover: surface bg.

SearchBar.tsx:
  Props: onSearch, isLoading
  Surface bg, cream text, gold border, Press Start 2P 10px placeholder text
  "SEARCHING..." muted text when isLoading. Triggers onSearch on Enter + onChange.

DJPanel.tsx:
  Props: text, isLoading
  Displays djText with a typewriter animation (add one char per 30ms via setInterval)
  Styled like a vintage radio broadcast transcript — monospace, gold text on dark surface
  "ON AIR" indicator light (red dot) that pulses when isLoading

MoodSearch.tsx:
  Props: onResults (tracks: Track[]) => void
  Text input: "WHAT'S THE VIBE?" placeholder
  Shows loading spinner (CSS only) while fetching
  On results: calls onResults with returned tracks

PlaylistGenerator.tsx:
  Props: onPlaylistReady ({ playlistName, tracks }) => void
  Text input: "DESCRIBE THE SCENE..." placeholder
  Shows playlistName as a large pixel heading when ready

SimilarTracks.tsx:
  Props: tracks, onSelect
  Compact list with label "UP NEXT — AI PICKS"
  Same row style as TrackList but smaller

PartyPanel.tsx:
  Props: from usePartyRoom hook
  Room code in large pixel font: "ROOM: VXKP"
  Create / Join buttons with input for join code
  Listener count with green pulse dot
  Listener mode: "LISTENING LIVE" badge, controls locked
  Vintage walkie-talkie / radio broadcast aesthetic
```

---

### Part 11 — Player assembly

**Files:** `src/components/Player.tsx` · `src/app/page.tsx` (final)

**Agent prompt:**
```
Build Part 11: Player assembly — final wiring.

Player.tsx wires every hook and component:
  Hooks: useYTPlayer, usePlayerState, useSearch, useFFT, usePartyRoom,
         useDJ, useMoodSearch, usePlaylistGen, useSimilarTracks

  Layout — two columns:
    Left:
      Vinyl (isPlaying, thumbnail, title)
      ProgressBar (position, duration, onSeek)
      Controls (isPlaying, isDisabled=!isHost if in party, handlers)
      FFTVisualizer (isPlaying, positionMs)

    Right:
      "GROOVEBOX" heading in Press Start 2P
      SearchBar
      DJPanel (auto-fires on track change)
      TrackList (search results or current queue)
      SimilarTracks (AI picks for next)
      MoodSearch (on results: replace tracklist)
      PlaylistGenerator (on ready: replace tracklist + show name)
      PartyPanel (room create/join, listener count)

  Hidden <div id="yt-player" style={{ display: "none" }} /> for IFrame mount

  If in party listener mode (isHost=false):
    Apply partyPlayerState from usePartyRoom to override local player state

page.tsx: renders <Player /> centred, surface background, full viewport height
```

---

### Part 12 — Deploy

```bash
# Type-check before deploying
npx tsc --noEmit

# Build locally to catch runtime errors
npm run build

# Deploy
npx vercel --prod
```

In Vercel → Settings → Environment Variables, add all four keys:
```
YOUTUBE_API_KEY
GOOGLE_API_KEY
ABLY_API_KEY
LANGCHAIN_API_KEY
```

Redeploy after adding keys: `npx vercel --prod`

---

## How each AI feature works end-to-end

### AI DJ
```
Track changes → useDJ → POST /api/ai/dj
  → djChain (ConversationChain + BufferMemory)
  → Gemini generates 2-3 sentence DJ commentary
  → streams into DJPanel with typewriter effect
```

### Mood search
```
User types "something melancholic" → useMoodSearch → POST /api/ai/mood
  → moodChain (LLMChain) → ["sad indie acoustic", "rainy day melancholy", "slow emotional piano"]
  → 3 parallel /api/search calls
  → merged Track[] → TrackList
```

### Playlist generator
```
User types "late night Tokyo drive" → usePlaylistGen → POST /api/ai/playlist
  → playlistChain → { playlistName: "Neon Rain", songs: [{title, artist} × 8] }
  → 8 sequential /api/search calls
  → { playlistName, tracks } → PlaylistGenerator UI + player queue
```

### Song similarity
```
Track changes → useSimilarTracks (2s debounce) → POST /api/ai/similar
  → similarChain → [{title, artist} × 5]
  → 5 YouTube searches
  → Track[] → SimilarTracks "UP NEXT" panel
```

### Party mode
```
Host creates room → 4-char code → Ably channel "party:VXKP"
Host plays track → usePartyRoom publishes PartyEvent{type:"track_change", payload}
Listener joins → subscribes to channel → receives full PartyRoom snapshot
Host seeks/pauses → PartyEvent{type:"sync"} → listeners update with latency compensation
```

---

## Low-credit Gem usage tips

**Batch within a part** — give the full part at once:
```
[DONE — do not regenerate]
Parts 1–5 complete.

[BUILD NOW]
Part 6: all four AI client hooks as complete .ts files.
Follow the spec exactly. Export typed return interfaces.
```

**Free tools that save credits:**
| Tool | Use |
|------|-----|
| [Piskel](https://piskelapp.com) | Draw pixel icons instead of asking the Gem |
| [Lospec](https://lospec.com) | Free retro palettes |
| [Transform Tools](https://transform.tools/svg-to-jsx) | SVG → TSX component |
| [LangSmith](https://smith.langchain.com) | Debug chain outputs for free |
| VS Code ESLint + TypeScript extensions | Catch errors before asking the Gem |

---

*GROOVEBOX · Next.js 14 · TypeScript strict · Styled Components · LangChain + Gemini · Web Audio FFT · Ably Party Mode*