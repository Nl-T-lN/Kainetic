"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Ably from "ably";
import type { PlayerState, Track } from "@/types/music";

export interface PartyRoom {
  currentTrack: Track | null;
  isPlaying: boolean;
  positionMs: number;
  timestamp: number;
}

export interface PartyEvent {
  type: "sync" | "chat";
  payload?: Partial<PartyRoom>;
  chatMessage?: ChatMessage;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface UsePartyRoomReturn {
  isHost: boolean;
  roomCode: string | null;
  listenerCount: number;
  partyPlayerState: PlayerState | null;
  messages: ChatMessage[];
  connectionStatus: ConnectionStatus;
  createRoom: () => void;
  joinRoom: (code: string) => void;
  leaveRoom: () => void;
  sendMessage: (text: string) => void;
}

export function usePartyRoom(localPlayerState: PlayerState): UsePartyRoomReturn {
  const [isHost, setIsHost] = useState(true);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [listenerCount, setListenerCount] = useState(0);
  const [partyPlayerState, setPartyPlayerState] = useState<PlayerState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  
  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const lastSyncTime = useRef<number>(0);

  // Clean up connection
  useEffect(() => {
    return () => {
      if (ablyRef.current) {
        ablyRef.current.close();
      }
    };
  }, []);

  // Host Broadcast Loop (Throttled to 2000ms unless major state change like play/pause/track)
  useEffect(() => {
    if (isHost && roomCode && channelRef.current) {
      const now = Date.now();
      // Throttle position updates to every 2 seconds to save Ably messages
      // Note: In a real production app, we would only broadcast when play/pause or track changes,
      // and let the client extrapolate position.
      if (now - lastSyncTime.current > 2000) {
        const payload: Partial<PartyRoom> = {
          currentTrack: localPlayerState.currentTrack,
          isPlaying: localPlayerState.isPlaying,
          positionMs: localPlayerState.positionMs,
          timestamp: now,
        };
        
        const event: PartyEvent = { type: "sync", payload };
        channelRef.current.publish("sync", event);
        lastSyncTime.current = now;
      }
    }
  }, [isHost, roomCode, localPlayerState.isPlaying, localPlayerState.currentTrack, localPlayerState.positionMs]);

  const handleConnectionState = (ably: Ably.Realtime) => {
    ably.connection.on('connecting', () => setConnectionStatus('connecting'));
    ably.connection.on('connected', () => setConnectionStatus('connected'));
    ably.connection.on('failed', () => setConnectionStatus('error'));
    ably.connection.on('disconnected', () => setConnectionStatus('error'));
  };

  const createRoom = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const ably = new Ably.Realtime({ authUrl: "/api/party/token" });
    ablyRef.current = ably;
    handleConnectionState(ably);
    
    const channel = ably.channels.get(`party:${code}`);
    channelRef.current = channel;
    
    setIsHost(true);
    setRoomCode(code);
    setMessages([]);
    
    channel.presence.enter();
    channel.presence.subscribe(async () => {
      try {
        const members = await channel.presence.get();
        if (members) setListenerCount(members.length > 0 ? members.length - 1 : 0);
      } catch (err) {
        console.error(err);
      }
    });

    // Subscribe to chat events
    channel.subscribe("chat", (message) => {
      const eventData = message.data as PartyEvent;
      if (eventData.chatMessage) {
        setMessages(prev => [...prev, eventData.chatMessage!]);
      }
    });
  }, []);

  const joinRoom = useCallback((code: string) => {
    const formattedCode = code.toUpperCase();
    
    const ably = new Ably.Realtime({ authUrl: "/api/party/token" });
    ablyRef.current = ably;
    handleConnectionState(ably);
    
    const channel = ably.channels.get(`party:${formattedCode}`);
    channelRef.current = channel;
    
    setIsHost(false);
    setRoomCode(formattedCode);
    setMessages([]);
    
    channel.presence.enter();
    
    channel.subscribe("sync", (message) => {
      const eventData = message.data as PartyEvent;
      const { payload } = eventData;
      
      if (payload) {
        const latency = Date.now() - (payload.timestamp || Date.now());
        
        setPartyPlayerState({
          currentTrack: payload.currentTrack || null,
          isPlaying: payload.isPlaying || false,
          positionMs: (payload.positionMs || 0) + latency,
          durationMs: payload.currentTrack?.durationMs || 0,
        });
      }
    });

    channel.subscribe("chat", (message) => {
      const eventData = message.data as PartyEvent;
      if (eventData.chatMessage) {
        setMessages(prev => [...prev, eventData.chatMessage!]);
      }
    });
  }, []);

  const leaveRoom = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.presence.leave();
      channelRef.current.detach();
    }
    setRoomCode(null);
    setPartyPlayerState(null);
    setIsHost(true);
    setListenerCount(0);
    setConnectionStatus('idle');
    setMessages([]);
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!channelRef.current || !roomCode) return;
    
    const chatMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      sender: isHost ? "Host" : "Listener",
      timestamp: Date.now(),
    };
    
    const event: PartyEvent = { type: "chat", chatMessage };
    channelRef.current.publish("chat", event);
  }, [isHost, roomCode]);

  return { 
    isHost, 
    roomCode, 
    listenerCount, 
    partyPlayerState, 
    messages,
    connectionStatus,
    createRoom, 
    joinRoom, 
    leaveRoom,
    sendMessage
  };
}
