"use client";

import { usePlayer } from "@/contexts/PlayerContext";
import { ListenAlong } from "@/components/ListenAlong";

export default function PartiesPage() {
  const { party } = usePlayer();

  return (
    <ListenAlong 
      roomCode={party.roomCode}
      listenerCount={party.listenerCount}
      isHost={party.isHost}
      onCreate={party.createRoom}
      onJoin={party.joinRoom}
      onLeave={party.leaveRoom}
    />
  );
}
