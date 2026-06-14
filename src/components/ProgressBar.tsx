"use client";

import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { usePlayerStore } from "@/store/playerStore";

const ProgressWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TrackLine = styled.div`
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: height 0.2s ease;

  &:hover {
    height: 6px;

    .fill {
      background: #fff;
    }
    .thumb {
      opacity: 1;
      width: 12px;
      height: 12px;
    }
  }
`;

const Fill = styled.div`
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  transition: background 0.2s ease;
  position: relative;
`;

const Thumb = styled.div`
  width: 0;
  height: 0;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 2;
`;

const TimeDisplay = styled.div`
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  min-width: 40px;
  font-variant-numeric: tabular-nums;
`;

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface ProgressBarProps {
  onSeek: (ms: number) => void;
}

export function ProgressBar({
  onSeek,
}: ProgressBarProps) {
  const positionMs = usePlayerStore(s => s.positionMs);
  const durationMs = usePlayerStore(s => s.durationMs);
  const setPositionMs = usePlayerStore(s => s.setPositionMs);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragPct, setDragPct] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRectRef = useRef<{ left: number, width: number } | null>(null);

  const displayMs = isDragging ? dragPct * durationMs : positionMs;
  const fillPct = durationMs > 0 ? (displayMs / durationMs) * 100 : 0;
  const clampedPct = Math.min(100, Math.max(0, fillPct));

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (durationMs <= 0) return;
    if (trackRef.current) {
      dragRectRef.current = trackRef.current.getBoundingClientRect();
    }
    setIsDragging(true);
    updateDragPosition(e.clientX);
  };

  const updateDragPosition = (clientX: number) => {
    const rect = dragRectRef.current;
    if (!rect) return;
    const clickX = clientX - rect.left;
    const clickPct = Math.min(1, Math.max(0, clickX / rect.width));
    setDragPct(clickPct);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      updateDragPosition(e.clientX);
    };

    const handlePointerUp = (e: PointerEvent) => {
      setIsDragging(false);
      
      const rect = dragRectRef.current;
      if (!rect) return;
      
      const clickX = e.clientX - rect.left;
      const finalPct = Math.min(1, Math.max(0, clickX / rect.width));
      const targetMs = finalPct * durationMs;
      
      setPositionMs(targetMs);
      onSeek(targetMs);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, durationMs, onSeek, setPositionMs]);

  return (
    <ProgressWrapper>
      <TimeDisplay style={{ textAlign: "right" }}>
        {formatTime(displayMs)}
      </TimeDisplay>
      <TrackLine 
        ref={trackRef}
        onPointerDown={handlePointerDown}
      >
        <Fill className="fill" style={{ width: `${clampedPct}%` }} />
        <Thumb className="thumb" style={{ left: `${clampedPct}%` }} />
      </TrackLine>
      <TimeDisplay>{formatTime(durationMs)}</TimeDisplay>
    </ProgressWrapper>
  );
}
