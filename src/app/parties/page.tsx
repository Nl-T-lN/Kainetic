"use client";

import { usePlayer } from "@/contexts/PlayerContext";
import { ListenAlong } from "@/components/ListenAlong";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function PartiesContent() {
  const { party } = usePlayer();
  const searchParams = useSearchParams();
  const autoJoinCode = searchParams.get("join") || null;

  useEffect(() => {
    if (autoJoinCode && party.joinRoom && !party.roomCode) {
      party.joinRoom(autoJoinCode);
    }
  }, [autoJoinCode, party]);

  return (
    <ListenAlong party={party} />
  );
}

export default function PartiesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PartiesContent />
    </Suspense>
  );
}
