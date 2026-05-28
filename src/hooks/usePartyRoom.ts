"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Ably from "ably";
import type { 
  Track, 
  PartyProfile, 
  PartyMember, 
  PartyPermissions,
  PartyEvent,
  SyncPayload,
  ChatMessage 
} from "@/types/music";
import type { UsePlayerStateReturn } from "./usePlayerState";
import { PartyEventSchema } from "@/lib/party-schema";
import { createMeasurement, calculateOffsetEstimate, NTPMeasurement } from "@/lib/ntp";
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface UsePartyRoomReturn {
  isHost: boolean;
  roomCode: string | null;
  members: PartyMember[];
  permissions: PartyPermissions;
  
  partyQueue: Track[];
  partyQueueIndex: number;
  partyPlayerState: SyncPayload | null;
  
  messages: ChatMessage[];
  connectionStatus: ConnectionStatus;
  
  createRoom: (forceProfile?: PartyProfile) => void;
  joinRoom: (code: string, forceProfile?: PartyProfile) => Promise<boolean>;
  leaveRoom: () => void;
  sendMessage: (text: string) => void;
  
  requestAddTrack: (track: Track, action: "ADD_TRACK" | "PLAY_NEXT" | "PLAY_NOW") => void;
  broadcastQueueReorder: (newQueue: Track[], newIndex: number) => void;
  
  toggleGuestAdditions: (allow: boolean) => void;
  kickUser: (clientId: string) => void;
  
  profile: PartyProfile | null;
  saveProfile: (name: string) => PartyProfile;
}

const getRandomAvatarColor = () => {
  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#6c5ce7", "#a8e6cf"];
  return colors[Math.floor(Math.random() * colors.length)];
};

export function usePartyRoom(localState: UsePlayerStateReturn): UsePartyRoomReturn {
  const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [permissions, setPermissions] = useState<PartyPermissions>({ allowGuestAdditions: true });
  
  const [partyQueue, setPartyQueue] = useState<Track[]>([]);
  const [partyQueueIndex, setPartyQueueIndex] = useState(0);
  const [partyPlayerState, setPartyPlayerState] = useState<SyncPayload | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [profile, setProfile] = useState<PartyProfile | null>(null);
  
  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const lastSyncTime = useRef<number>(0);
  const myClientId = useRef<string>("");
  
  const prevIsPlaying = useRef<boolean>(false);
  const prevTrackId = useRef<string | undefined>(undefined);
  
  const clockOffsetRef = useRef<number>(0);
  const ntpMeasurementsRef = useRef<NTPMeasurement[]>([]);
  
  // Use a ref for localState to prevent stale closures inside Ably subscriptions
  const localStateRef = useRef(localState);
  useEffect(() => {
    localStateRef.current = localState;
  }, [localState]);

  if (!myClientId.current) {
    myClientId.current = Math.random().toString(36).substring(2, 10);
  }

  // 1. Profile Management
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vintify_party_profile");
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const saveProfile = useCallback((name: string) => {
    const p: PartyProfile = { name, avatarId: getRandomAvatarColor() };
    setProfile(p);
    localStorage.setItem("vintify_party_profile", JSON.stringify(p));
    return p;
  }, []);

  // Clean up connection
  useEffect(() => {
    return () => ablyRef.current?.close();
  }, []);

  // 2. Host Broadcast Engine
  // Broadcast SYNC every 2s, or immediately if major state changes
  useEffect(() => {
    if (isHost && roomCode && channelRef.current) {
      const now = Date.now();
      
      const payload: SyncPayload = {
        currentTrack: localState.currentTrack,
        isPlaying: localState.isPlaying,
        positionMs: localState.getExactPosition(),
        timestamp: now,
        queue: localState.queue,
        currentIndex: localState.queueIndex
      };
      
      // Update local party queue for Host UI
      setPartyQueue(localState.queue);
      setPartyQueueIndex(localState.queueIndex);

      const isMajorChange = 
        prevIsPlaying.current !== localState.isPlaying || 
        prevTrackId.current !== localState.currentTrack?.videoId;

      if (isMajorChange || (now - lastSyncTime.current > 2000)) {
        channelRef.current.publish("party_events", { type: "SYNC", syncPayload: payload } as PartyEvent);
        lastSyncTime.current = now;
        prevIsPlaying.current = localState.isPlaying;
        prevTrackId.current = localState.currentTrack?.videoId;
      }
    }
  }, [
    isHost, roomCode, 
    localState.isPlaying, localState.currentTrack, localState.positionMs, 
    localState.queue, localState.queueIndex
  ]);

  // We need to properly wrap leaveRoom in useCallback to avoid dependency cycles
  const leaveRoom = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.presence.leave();
      channelRef.current.detach();
    }
    setRoomCode(null);
    setPartyPlayerState(null);
    setIsHost(false);
    setMembers([]);
    setConnectionStatus('idle');
    setMessages([]);
  }, []);

  // 3. Event Handling Setup
  const setupChannel = useCallback((channel: Ably.RealtimeChannel, amIHost: boolean) => {
    channel.subscribe("party_events", (message) => {
      // 1. Zod Security Validation
      const parsed = PartyEventSchema.safeParse(message.data);
      if (!parsed.success) {
        console.error("[Zod Validation Failed] Dropped malicious or malformed party event:", parsed.error.errors, "Raw data:", message.data);
        return;
      }
      const event = parsed.data;
      
      // NTP Handling
      if (event.type === "NTP_REQUEST" && amIHost) {
        const payload = event.ntpPayload;
        // Host replies immediately with t1 (receive) and t2 (send)
        channel.publish("party_events", {
          type: "NTP_RESPONSE",
          ntpPayload: {
            clientId: payload.clientId,
            t0: payload.t0,
            t1: Date.now(),
            t2: Date.now()
          }
        });
      }
      
      if (event.type === "NTP_RESPONSE" && !amIHost) {
        const payload = event.ntpPayload;
        if (payload.clientId === myClientId.current && payload.t1 && payload.t2) {
          const t3 = Date.now();
          const measurement = createMeasurement(payload.t0, payload.t1, payload.t2, t3);
          
          ntpMeasurementsRef.current.push(measurement);
          
          // Keep only the last 10 measurements
          if (ntpMeasurementsRef.current.length > 10) {
            ntpMeasurementsRef.current.shift();
          }
          
          const estimate = calculateOffsetEstimate(ntpMeasurementsRef.current);
          clockOffsetRef.current = estimate.averageOffset;
          // console.log(`[NTP] Estimated clock offset to host: ${estimate.averageOffset}ms | RTT: ${estimate.minRTT}ms`);
        }
      }

      // GUESTS processing SYNC
      if (event.type === "SYNC" && event.syncPayload && !amIHost) {
        const p = event.syncPayload;
        // NTP-adjusted latency calculation
        const estimatedHostTimeNow = Date.now() + clockOffsetRef.current;
        const timeElapsedSinceHostSent = estimatedHostTimeNow - p.timestamp;
        
        setPartyQueue(p.queue);
        setPartyQueueIndex(p.currentIndex);
        
        setPartyPlayerState({
          ...p,
          positionMs: p.positionMs + timeElapsedSinceHostSent
        });
      }
      
      // ALL processing CHAT
      if (event.type === "CHAT" && event.chatMessage) {
        setMessages(prev => [...prev, event.chatMessage!]);
      }
      
      // HOST processing COMMANDS
      if (event.type === "COMMAND" && event.commandPayload && amIHost) {
        const { action, track } = event.commandPayload;
        if (permissions.allowGuestAdditions) {
          const latestState = localStateRef.current;
          if (action === "ADD_TRACK") latestState.addToQueue(track);
          else if (action === "PLAY_NEXT") latestState.insertNext(track);
          else if (action === "PLAY_NOW") {
            latestState.setCurrentTrack(track);
            latestState.setQueue([track, ...latestState.queue], 0);
          }
        }
      }

      // GUEST processing QUEUE_REORDER
      if (event.type === "QUEUE_REORDER" && event.queuePayload && !amIHost) {
        setPartyQueue(event.queuePayload.queue);
        setPartyQueueIndex(event.queuePayload.currentIndex);
      }
      
      // GUESTS processing ADMIN Actions
      if (event.type === "ADMIN" && event.adminPayload && !amIHost) {
        const { action, targetClientId } = event.adminPayload;
        if (targetClientId === myClientId.current) {
          if (action === "KICK") {
            alert("You have been kicked from the party.");
            leaveRoom();
          }
        }
      }
    });

    channel.presence.subscribe('enter', updateMembers);
    channel.presence.subscribe('leave', updateMembers);
    channel.presence.subscribe('update', updateMembers);
    channel.presence.subscribe('present', updateMembers);
    
    async function updateMembers() {
      if (channel.state !== 'attached') return;
      try {
        const membersList = await channel.presence.get();
        const parsedMembers = membersList.map(m => ({
          clientId: m.clientId,
          profile: m.data as PartyProfile,
          isHost: m.data?.isHost || false,
          joinedAt: m.timestamp
        }));
        setMembers(parsedMembers);
      } catch (err) {
        console.error("Presence get error:", err);
      }
    }
    
    // Call it immediately to populate initial list
    updateMembers();
  }, [permissions, leaveRoom]);

  const connectAbly = useCallback(async (code: string, asHost: boolean, forceProfile?: PartyProfile) => {
    const activeProfile = forceProfile || profile;
    if (!activeProfile) return false;
    
    // Pass clientId explicitly and prevent browser caching
    const ably = new Ably.Realtime({ 
      authUrl: `/api/party/token?clientId=${myClientId.current}&t=${Date.now()}`, 
      clientId: myClientId.current 
    });
    ablyRef.current = ably;
    
    ably.connection.on('connecting', () => setConnectionStatus('connecting'));
    ably.connection.on('connected', () => setConnectionStatus('connected'));
    ably.connection.on('failed', () => setConnectionStatus('error'));
    ably.connection.on('disconnected', () => setConnectionStatus('error'));

    const channel = ably.channels.get(`party:${code}`);
    channelRef.current = channel;
    
    setIsHost(asHost);
    setRoomCode(code);
    setMessages([]);
    setupChannel(channel, asHost);
    
    // Explicitly attach before entering presence to avoid race conditions
    channel.attach().then(() => {
      channel.presence.enter({ ...activeProfile, isHost: asHost });
      
      if (!asHost) {
        // Run initial NTP probes to establish clock offset
        let pings = 0;
        const interval = setInterval(() => {
          if (pings >= 5) {
            clearInterval(interval);
            return;
          }
          channel.publish("party_events", {
            type: "NTP_REQUEST",
            ntpPayload: {
              clientId: myClientId.current,
              t0: Date.now()
            }
          });
          pings++;
        }, 300);
      }
    }).catch(err => console.error("Attach error:", err));
    return true;
  }, [profile, setupChannel]);

  const createRoom = useCallback((forceProfile?: PartyProfile) => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    connectAbly(code, true, forceProfile);
  }, [connectAbly]);

  const joinRoom = useCallback(async (code: string, forceProfile?: PartyProfile) => {
    return connectAbly(code.toUpperCase(), false, forceProfile);
  }, [connectAbly]);



  const sendMessage = useCallback((text: string) => {
    if (!channelRef.current || !profile) return;
    const msg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      senderId: myClientId.current,
      senderName: profile.name,
      timestamp: Date.now(),
    };
    channelRef.current.publish("party_events", { type: "CHAT", chatMessage: msg } as PartyEvent);
  }, [profile]);

  const requestAddTrack = useCallback((track: Track, action: "ADD_TRACK" | "PLAY_NEXT" | "PLAY_NOW") => {
    if (isHost) {
      if (action === "ADD_TRACK") localState.addToQueue(track);
      else if (action === "PLAY_NEXT") localState.insertNext(track);
      else if (action === "PLAY_NOW") {
        localState.setQueue([track, ...localState.queue], 0);
      }
    } else if (channelRef.current && permissions.allowGuestAdditions) {
      channelRef.current.publish("party_events", {
        type: "COMMAND",
        commandPayload: { action, track, senderId: myClientId.current }
      } as PartyEvent);
    }
  }, [isHost, localState, permissions.allowGuestAdditions]);

  const toggleGuestAdditions = useCallback((allow: boolean) => {
    if (isHost) setPermissions({ allowGuestAdditions: allow });
  }, [isHost]);

  const kickUser = useCallback((clientId: string) => {
    if (isHost && channelRef.current) {
      channelRef.current.publish("party_events", {
        type: "ADMIN",
        adminPayload: { action: "KICK", targetClientId: clientId }
      } as PartyEvent);
    }
  }, [isHost]);

  const broadcastQueueReorder = useCallback((newQueue: Track[], newIndex: number) => {
    if (isHost && channelRef.current) {
      channelRef.current.publish("party_events", {
        type: "QUEUE_REORDER",
        queuePayload: {
          queue: newQueue,
          currentIndex: newIndex
        }
      });
      // Also update local host state immediately without waiting for player loop
      localState.setQueue(newQueue, newIndex);
    }
  }, [isHost, localState]);

  return {
    isHost,
    roomCode,
    members,
    permissions,
    partyQueue,
    partyQueueIndex,
    partyPlayerState,
    messages,
    connectionStatus,
    profile,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    requestAddTrack,
    broadcastQueueReorder,
    toggleGuestAdditions,
    kickUser,
    saveProfile
  };
}
