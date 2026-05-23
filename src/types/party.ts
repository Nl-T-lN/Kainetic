import type { Track } from "./music";

// ============================================================
// 📚 LEARN: party.ts (Party Mode Types)
// ============================================================
// These interfaces define the shape of our Ably WebSocket messages.
// TypeScript shines here — it ensures that when the Host sends a "PartyRoom"
// object over the wire, the Listener expects exactly the same fields.
// ============================================================

export interface PartyRoom {
  roomCode: string;        // 4-char uppercase, e.g., "VXKP"
  hostClientId: string;    // Ably client ID of the host
  listeners: string[];     // Array of client IDs watching
  currentTrack: Track | null;
  isPlaying: boolean;
  positionMs: number;
  timestamp: number;       // Server time of last sync event, critical for latency comp
}

export interface PartyEvent {
  type: "sync" | "play" | "pause" | "track_change" | "listener_join" | "listener_leave";
  payload: Partial<PartyRoom>; // "Partial" means any subset of PartyRoom fields is valid
}
