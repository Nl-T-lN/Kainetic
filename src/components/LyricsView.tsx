"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import styled from "styled-components";
import type { ParsedLyricLine } from "@/utils/lyricsParser";
import { usePlayer } from "@/contexts/PlayerContext";

const LyricsContainer = styled.div`
  flex: 1;
  position: relative;
  overflow-y: auto;
  padding: 40vh 0;
  mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
  display: flex;
  flex-direction: column;

  /* Hide scrollbar */
  &::-webkit-scrollbar {
    display: none;
  }
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

const LyricLineEl = styled.p<{ 
  $status: 'past' | 'active' | 'future'; 
  $distance: number; 
  $isScrolling?: boolean; 
  $isGap?: boolean;
}>`
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: ${({ $isGap }) => ($isGap ? "2.25rem" : "2.5rem")};
  font-weight: 800;
  margin: 0;
  padding-bottom: ${({ $isGap }) => $isGap ? "4rem" : "2.5rem"};
  line-height: 1.25;
  cursor: pointer;
  letter-spacing: ${({ $isGap }) => $isGap ? "0.2em" : "-0.02em"};
  transform-origin: left center;
  display: flex;
  flex-flow: row wrap;
  align-items: start;
  
  /* Blurring and scale based on active status */
  filter: ${({ $status }) => 
    $status === 'active' ? "blur(0)" : "blur(1.5px)"};
  transform: ${({ $status }) => ($status === 'active' ? "scale(1.02)" : "scale(1)")};
  
  transition: filter 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;

  opacity: ${({ $status }) => 
    $status === 'active' ? "1" : "0.4"};

  &:hover {
    filter: blur(0);
    opacity: 1;
    transition: all 0.3s ease;
  }

  @media (max-width: 1000px) {
    font-size: 1.75rem;
    padding-bottom: 2rem;
  }
`;

const LyricWordEl = styled.span<{
  $status: 'past' | 'active' | 'future';
  $durationMs: number;
  $hasTrailingSpace: boolean;
  $syncType: 'word' | 'line' | 'unsynced';
}>`
  white-space: pre-wrap;
  display: inline-block;
  transform-origin: left center;
  padding: 0 0.1em;
  margin: 0 -0.1em;
  
  margin-right: ${({ $hasTrailingSpace }) => ($hasTrailingSpace ? "0.15em" : "-0.1em")};

  /* The sweeping linear-gradient trick */
  background-image: linear-gradient(to right, #ffffff 50%, rgba(255, 255, 255, 0.25) 50%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  background-position: ${({ $status }) => {
    if ($status === 'past') return '0 0'; 
    if ($status === 'active') return '0 0'; 
    return '100% 0';
  }};

  ${({ $status, $durationMs, $syncType }) => $status === 'active' && `
    transition: ${$syncType === 'word' ? `background-position ${$durationMs}ms linear,` : 'background-position 0.2s ease,'} filter 0.3s ease;
  `}
  
  ${({ $status }) => $status === 'past' && `
    transition: background-position 0.2s ease;
  `}

  /* Active glow and wobble */
  transform: ${({ $status }) => ($status === 'active' ? "translateY(-1px) scale(1.02)" : "translateY(0) scale(1)")};
  filter: ${({ $status }) => ($status === 'active' ? "drop-shadow(0 0 8px rgba(255,255,255,0.4))" : "none")};
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
  lyrics: ParsedLyricLine[];
  plainLyrics: string | null;
  isLoading: boolean;
  positionMs: number;
  onSeek: (ms: number) => void;
  isExpanded: boolean;
}

export function LyricsView({ lyrics, plainLyrics, isLoading, positionMs: globalPositionMs, onSeek, isExpanded }: LyricsViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [userIsScrolling, setUserIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { playerRef } = usePlayer();
  const [positionMs, setPositionMs] = useState(globalPositionMs);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      if (playerRef?.current?.getCurrentTime) {
        setPositionMs(playerRef.current.getCurrentTime() * 1000);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [playerRef]);

  const processedLyrics = useMemo(() => {
    if (!lyrics) return [];
    const result: (ParsedLyricLine & { isGap?: boolean })[] = [];
    
    for (let i = 0; i < lyrics.length; i++) {
      const current = lyrics[i];
      const next = lyrics[i + 1];
      
      if (next && next.startTimeMs - current.startTimeMs > 15000) {
        result.push({ ...current, isGap: false });
        result.push({
          text: "...",
          startTimeMs: current.startTimeMs + current.durationMs,
          durationMs: next.startTimeMs - (current.startTimeMs + current.durationMs),
          words: [{ text: "...", startTimeMs: current.startTimeMs + current.durationMs, durationMs: next.startTimeMs - (current.startTimeMs + current.durationMs), hasTrailingSpace: false }],
          isBackground: false,
          syncType: 'line',
          isGap: true,
        });
      } else {
        result.push({ ...current, isGap: false });
      }
    }
    return result;
  }, [lyrics]);

  const activeLyricIndex = processedLyrics.findIndex((line, index) => {
    const nextLine = processedLyrics[index + 1];
    return nextLine ? positionMs >= line.startTimeMs && positionMs < nextLine.startTimeMs : positionMs >= line.startTimeMs;
  });

  const handleUserScroll = () => {
    setUserIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    
    scrollTimeoutRef.current = setTimeout(() => {
      setUserIsScrolling(false);
    }, 3000);
  };

  useEffect(() => {
    if (!isExpanded || !scrollRef.current || activeLyricIndex < 0 || userIsScrolling) return;
    
    const container = scrollRef.current;
    const child = container.children[activeLyricIndex] as HTMLElement;
    if (!child) return;
    
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
        {processedLyrics.map((line, idx) => {
          let status: 'past' | 'active' | 'future' = 'future';
          if (idx < activeLyricIndex) status = 'past';
          if (idx === activeLyricIndex) status = 'active';

          // If a line has no words (rare fallback or line sync), wrap its whole text as a single word
          const wordsToRender = line.words && line.words.length > 0 
            ? line.words 
            : [{ text: line.text, startTimeMs: line.startTimeMs, durationMs: line.durationMs, hasTrailingSpace: false }];

          return (
            <LyricLineEl 
              key={idx} 
              $status={status}
              $distance={Math.abs(idx - activeLyricIndex)}
              $isScrolling={userIsScrolling}
              $isGap={line.isGap}
              onClick={() => {
                onSeek(line.startTimeMs);
                setUserIsScrolling(false);
              }}
            >
              {wordsToRender.map((word, wIdx) => {
                let wordStatus: 'past' | 'active' | 'future' = 'future';
                
                if (status === 'past') wordStatus = 'past';
                else if (status === 'active') {
                  if (line.syncType === 'line') {
                    wordStatus = 'active'; // Entire line is active at once
                  } else {
                    if (positionMs >= word.startTimeMs + word.durationMs) {
                      wordStatus = 'past';
                    } else if (positionMs >= word.startTimeMs) {
                      wordStatus = 'active';
                    } else {
                      wordStatus = 'future';
                    }
                  }
                }

                return (
                  <LyricWordEl
                    key={wIdx}
                    $status={wordStatus}
                    $durationMs={word.durationMs}
                    $hasTrailingSpace={word.hasTrailingSpace}
                    $syncType={line.syncType}
                  >
                    {word.text}
                  </LyricWordEl>
                );
              })}
            </LyricLineEl>
          );
        })}
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

