"use client";

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
  const fillPct = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;
  const clampedPct = Math.min(100, Math.max(0, fillPct));

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (durationMs <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPct = clickX / rect.width;
    onSeek(clickPct * durationMs);
  };

  return (
    <ProgressWrapper>
      <TimeDisplay style={{ textAlign: "right" }}>
        {formatTime(positionMs)}
      </TimeDisplay>
      <TrackLine onClick={handleSeekClick}>
        <Fill className="fill" style={{ width: `${clampedPct}%` }} />
        <Thumb className="thumb" style={{ left: `${clampedPct}%` }} />
      </TrackLine>
      <TimeDisplay>{formatTime(durationMs)}</TimeDisplay>
    </ProgressWrapper>
  );
}
