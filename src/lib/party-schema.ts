import { z } from "zod";

// Basic Data Types
export const TrackSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  channelTitle: z.string().nullable().optional().transform(v => v ?? undefined),
  artist: z.string().nullable().optional().transform(v => v ?? "Unknown Artist"),
  artistId: z.string().nullable().optional().transform(v => v ?? undefined),
  album: z.string().nullable().optional().transform(v => v ?? undefined),
  thumbnailUrl: z.string().nullable().optional().transform(v => v ?? ""),
  durationMs: z.number().nullable().optional().transform(v => v ?? 0)
});

export const PartyProfileSchema = z.object({
  name: z.string(),
  avatarId: z.string().optional()
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  text: z.string(),
  timestamp: z.number()
});

export const SyncPayloadSchema = z.object({
  isPlaying: z.boolean(),
  positionMs: z.number(),
  currentTrack: TrackSchema.nullable().optional().transform(v => v ?? null),
  queue: z.array(TrackSchema),
  currentIndex: z.number(),
  timestamp: z.number()
});

// Event Payloads
const SyncEventSchema = z.object({
  type: z.literal("SYNC"),
  syncPayload: SyncPayloadSchema
});

const ChatEventSchema = z.object({
  type: z.literal("CHAT"),
  chatMessage: ChatMessageSchema
});

const CommandEventSchema = z.object({
  type: z.literal("COMMAND"),
  commandPayload: z.object({
    action: z.enum(["ADD_TRACK", "PLAY_NEXT", "PLAY_NOW"]),
    track: TrackSchema
  })
});

const QueueReorderEventSchema = z.object({
  type: z.literal("QUEUE_REORDER"),
  queuePayload: z.object({
    queue: z.array(TrackSchema),
    currentIndex: z.number()
  })
});

// NTP Implementation Events
const NtpRequestSchema = z.object({
  type: z.literal("NTP_REQUEST"),
  ntpPayload: z.object({
    clientId: z.string(),
    t0: z.number()
  })
});

const NtpResponseSchema = z.object({
  type: z.literal("NTP_RESPONSE"),
  ntpPayload: z.object({
    clientId: z.string(),
    t0: z.number(),
    t1: z.number(),
    t2: z.number()
  })
});

const AdminEventSchema = z.object({
  type: z.literal("ADMIN"),
  adminPayload: z.object({
    action: z.enum(["KICK", "TRANSFER_HOST"]),
    targetClientId: z.string()
  })
});

// Full Validated Event Payload
export const PartyEventSchema = z.discriminatedUnion("type", [
  SyncEventSchema,
  ChatEventSchema,
  CommandEventSchema,
  QueueReorderEventSchema,
  NtpRequestSchema,
  NtpResponseSchema,
  AdminEventSchema
]);

export type ValidatedPartyEvent = z.infer<typeof PartyEventSchema>;
