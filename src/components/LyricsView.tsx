"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import styled from "styled-components";

const LyricsContainer = styled.div`
  flex: 1;
  position: relative;
  overflow-y: auto;
  padding: 40vh 0;
  mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
  display: flex;
  flex-direction: column;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;
  scrollbar-width: none;

  @media (max-width: 1000px) {
    width: 100%;
    min-height: 80vh;
    padding: 20vh 0;
    mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
  }
`;

const LyricLine = styled.p<{ $active?: boolean; $distance: number; $isScrolling?: boolean; $isGap?: boolean }>`
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: ${({ $isGap }) => ($isGap ? "2.25rem" : "2.5rem")};
  font-weight: ${({ $active }) => ($active ? "800" : "700")};
  color: ${({ $active }) => $active ? "#ffffff" : "rgba(255, 255, 255, 0.45)"};
  margin: 0;
  padding-bottom: ${({ $isGap }) => $isGap ? "4rem" : "2.5rem"};
  transition: opacity 0.4s ease, filter 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), color 0.4s ease;
  line-height: 1.25;
  cursor: pointer;
  filter: ${({ $active, $distance, $isScrolling }) => 
    $active || $isScrolling ? "blur(0)" : `blur(${Math.min($distance * 1.5, 6)}px)`};
  opacity: ${({ $active, $distance, $isScrolling }) => 
    $active ? "1" : ($isScrolling ? "0.8" : Math.max(0.15, 0.5 - ($distance * 0.1)))};
  letter-spacing: ${({ $isGap }) => $isGap ? "0.2em" : "-0.02em"};
  transform-origin: left center;
  transform: ${({ $active }) => ($active ? "scale(1.02)" : "scale(1)")};

  &:hover {
    color: rgba(255, 255, 255, 0.95);
    filter: blur(0);
    opacity: 1;
  }

  @media (max-width: 1000px) {
    font-size: 1.75rem;
    padding-bottom: 2rem;
    text-align: left;
    transform-origin: left center;
  }
`;

const PlainLyricsText = styled.div`
  font-size: 1.75rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  white-space: pre-wrap;
  font-weight: 700;
  text-align: center;
  margin: auto 0;
  
  @media (max-width: 1000px) {
    font-size: 1.25rem;
  }
`;

const NoLyricsText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  gap: 1rem;
  margin: auto 0;

  .emoji { font-size: 3rem; }
  .title { font-size: 1.25rem; font-weight: 700; }
`;

interface LyricsViewProps {
  lyrics: { timeMs: number; text: string }[];
  plainLyrics: string | null;
  isLoading: boolean;
  positionMs: number;
  onSeek: (ms: number) => void;
  isExpanded: boolean;
}

export function LyricsView({ lyrics, plainLyrics, isLoading, positionMs, onSeek, isExpanded }: LyricsViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [userIsScrolling, setUserIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const processedLyrics = useMemo(() => {
    if (!lyrics) return [];
    const result = [];
    for (let i = 0; i < lyrics.length; i++) {
      result.push({ ...lyrics[i], isGap: false });
      if (i < lyrics.length - 1) {
        const current = lyrics[i];
        const next = lyrics[i + 1];
        if (next.timeMs - current.timeMs > 15000) { // 15 seconds gap
          result.push({
            timeMs: current.timeMs + 4000, // Show dots 4 seconds after current line
            text: "...",
            isGap: true
          });
        }
      }
    }
    return result;
  }, [lyrics]);

  const activeLyricIndex = processedLyrics.findIndex((line, index) => {
    const nextLine = processedLyrics[index + 1];
    return nextLine ? positionMs >= line.timeMs && positionMs < nextLine.timeMs : positionMs >= line.timeMs;
  });

  const handleUserScroll = () => {
    setUserIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    
    // Resume auto-scroll after 3 seconds of no interaction
    scrollTimeoutRef.current = setTimeout(() => {
      setUserIsScrolling(false);
    }, 3000);
  };

  useEffect(() => {
    if (!isExpanded || !scrollRef.current || activeLyricIndex < 0 || userIsScrolling) return;
    
    const container = scrollRef.current;
    const child = container.children[activeLyricIndex] as HTMLElement;
    if (!child) return;
    
    // Calculate perfect center
    const containerCenter = container.offsetHeight / 2;
    const childCenter = child.offsetTop + (child.offsetHeight / 2);
    const scrollPosition = childCenter - containerCenter;
    
    container.scrollTo({ top: scrollPosition, behavior: "smooth" });
  }, [activeLyricIndex, isExpanded, userIsScrolling]);

  if (isLoading) {
    return (
      <LyricsContainer>
        <NoLyricsText><div className="title">Loading lyrics...</div></NoLyricsText>
      </LyricsContainer>
    );
  }

  if (lyrics.length > 0) {
    return (
      <LyricsContainer 
        ref={scrollRef} 
        onWheel={handleUserScroll} 
        onTouchMove={handleUserScroll}
      >
        {processedLyrics.map((line, idx) => (
          <LyricLine 
            key={idx} 
            $active={idx === activeLyricIndex} 
            $distance={Math.abs(idx - activeLyricIndex)}
            $isScrolling={userIsScrolling}
            $isGap={line.isGap}
            onClick={() => {
              onSeek(line.timeMs);
              setUserIsScrolling(false);
            }}
          >
            {line.text}
          </LyricLine>
        ))}
      </LyricsContainer>
    );
  }

  if (plainLyrics) {
    return (
      <LyricsContainer>
        <PlainLyricsText>{plainLyrics}</PlainLyricsText>
      </LyricsContainer>
    );
  }

  return (
    <LyricsContainer>
      <NoLyricsText>
        <div className="emoji">🎶</div>
        <div className="title">No lyrics available</div>
      </NoLyricsText>
    </LyricsContainer>
  );
}
