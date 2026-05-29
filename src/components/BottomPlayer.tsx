"use client";

import { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  ChevronDown,
  Users,
  ListMusic,
} from "lucide-react";
import type { Track } from "@/types/music";
import { ProgressBar } from "./ProgressBar";
import { useRouter } from 'next/navigation';
import { useLyrics } from "@/hooks/useLyrics";

/* ── Animations ── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const livePulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const BottomBar = styled.div<{ $isExpanded: boolean }>`
  position: fixed;
  bottom: ${({ $isExpanded }) => ($isExpanded ? "0" : "15px")};
  left: ${({ $isExpanded }) => ($isExpanded ? "0" : "calc(var(--sidebar-width, 240px) + 15px)")};
  right: ${({ $isExpanded }) => ($isExpanded ? "0" : "15px")};
  width: ${({ $isExpanded }) => ($isExpanded ? "100%" : "calc(100% - var(--sidebar-width, 240px) - 30px)")};
  height: ${({ $isExpanded }) => ($isExpanded ? "100vh" : "86px")};
  background: ${({ $isExpanded }) =>
    $isExpanded
      ? "var(--bg)"
      : "color-mix(in srgb, var(--bg) 85%, transparent)"};
  backdrop-filter: blur(20px);
  border-radius: ${({ $isExpanded }) => ($isExpanded ? "0" : "var(--radius)")};
  border: ${({ $isExpanded }) =>
    $isExpanded ? "none" : "1px solid rgba(255, 255, 255, 0.1)"};
  box-shadow: ${({ $isExpanded }) =>
    $isExpanded ? "none" : "0 20px 40px rgba(0,0,0,0.4)"};
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
`;

/* ── Mini Player ── */
const MiniPlayerContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem;
  flex-shrink: 0;
  position: relative;
`;

const TrackInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 30%;
  min-width: 180px;
  cursor: pointer;

  img.mini-thumb {
    width: 64px;
    height: 64px;
    min-width: 64px;
    min-height: 64px;
    flex-shrink: 0;
    border-radius: calc(var(--radius) * 0.6);
    object-fit: cover;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    pointer-events: none;
  }
`;

const TrackText = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .title {
    color: #fff;
    font-weight: 600;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .artist {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ControlsContainer = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: ${({ $isExpanded }) => ($isExpanded ? "100%" : "40%")};
  max-width: ${({ $isExpanded }) => ($isExpanded ? "600px" : "560px")};
`;

const ButtonsRow = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ $isExpanded }) => ($isExpanded ? "2rem" : "1.5rem")};
  margin-bottom: ${({ $isExpanded }) => ($isExpanded ? "0" : "0")};

  button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    padding: 4px;

    &:hover {
      color: #fff;
      transform: scale(1.1);
    }

    &.play-btn {
      background: var(--accent);
      color: #000;
      width: 44px;
      height: 44px;
      border-radius: 50%;

      &:hover {
        transform: scale(1.05);
        background: var(--accent);
        opacity: 0.9;
      }
    }
  }
`;

const ExtraControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  width: 30%;
`;

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.5);

  svg {
    cursor: pointer;
    &:hover { color: #fff; }
  }
`;

const VolumeSlider = styled.div`
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  cursor: pointer;
  position: relative;

  &:hover .vol-fill {
    background: var(--accent);
  }
`;

const VolumeFill = styled.div`
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 2px;
  transition: width 0.1s linear;
`;

/* ── Expanded View ── */
const BackgroundBlur = styled.div<{ $imageUrl?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: ${({ $imageUrl }) => ($imageUrl ? `url(${$imageUrl})` : "none")};
  background-size: cover;
  background-position: center;
  filter: blur(80px) saturate(160%) brightness(0.35);
  transform: scale(1.2);
  z-index: -1;
  transition: background-image 1s ease;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(var(--bg-rgb), 0.6);
  }
`;

const ExpandedWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  position: relative;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  z-index: 10;
  transition: all 0.2s;
  backdrop-filter: blur(20px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const ExpandedContent = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex: 1;
  gap: 5rem;
  align-items: center;
  animation: ${fadeIn} 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  min-height: 0;

  @media (max-width: 1000px) {
    flex-direction: column;
    justify-content: flex-start;
    gap: 2rem;
    overflow-y: auto;
    padding-top: 2rem;
  }
`;

const ExpandedLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;

  @media (max-width: 1000px) {
    align-items: center;
  }
`;

const ArtworkContainer = styled.div<{ $isPlaying: boolean }>`
  width: 100%;
  max-width: 480px;
  aspect-ratio: 1;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
  transform: scale(${({ $isPlaying }) => ($isPlaying ? 1 : 0.92)});

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }

  @media (max-width: 1000px) {
    max-width: 320px;
  }
`;

const TrackDetails = styled.div`
  margin-top: 3rem;
  text-align: left;
  width: 100%;

  .title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #fff;
    margin-bottom: 0.75rem;
    line-height: 1.1;
    letter-spacing: -1px;
  }

  .artist {
    font-size: 1.5rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
  }

  @media (max-width: 1000px) {
    text-align: center;
    margin-top: 1.5rem;
    .title { font-size: 1.75rem; }
    .artist { font-size: 1.15rem; }
  }
`;

const ExpandedRight = styled.div`
  flex: 1.3;
  height: 80%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  min-width: 0;
  scrollbar-width: none;
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 1000px) {
    width: 100%;
    flex: none;
    height: auto;
    max-height: 500px;
    mask-image: none;
  }
`;

const LyricLine = styled.p<{ $active?: boolean; $past?: boolean }>`
  font-size: ${({ $active }) => ($active ? "2.75rem" : "2rem")};
  font-weight: 800;
  color: ${({ $active }) =>
    $active ? "var(--accent)" : "rgba(255, 255, 255, 0.3)"};
  margin-bottom: 2.25rem;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  line-height: 1.15;
  cursor: pointer;
  filter: blur(${({ $active }) => ($active ? "0" : "1.5px")});
  letter-spacing: -0.5px;
  text-shadow: ${({ $active }) => ($active ? "0 0 40px rgba(var(--accent-rgb), 0.4)" : "none")};

  &:hover {
    color: rgba(255, 255, 255, 0.8);
    filter: blur(0);
  }

  @media (max-width: 1000px) {
    font-size: ${({ $active }) => ($active ? "1.85rem" : "1.35rem")};
    margin-bottom: 1.5rem;
    text-align: center;
  }
`;

const PlainLyricsText = styled.div`
  font-size: 1.75rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
  white-space: pre-wrap;
  font-weight: 700;
  padding: 4rem 0;
  @media (max-width: 1000px) {
    font-size: 1.25rem;
    text-align: center;
  }
`;

const NoLyricsText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  gap: 1rem;

  .emoji { font-size: 3rem; }
  .title { font-size: 1.25rem; font-weight: 700; }
`;

const RoomBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(var(--accent-rgb), 0.1);
  border: 1px solid rgba(var(--accent-rgb), 0.2);
  backdrop-filter: blur(10px);
  border-radius: 9999px;
  padding: 0.35rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
`;

const LiveDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: ${livePulse} 2s ease-in-out infinite;
`;

import { useLikedTracks } from "@/hooks/useLikedTracks";

/* ── Component ── */
interface BottomPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  queue?: Track[];
  queueIndex?: number;
  onPlayPause: () => void;
  onSkip?: (direction: "forward" | "backward") => void;
  onSeek: (ms: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onToggleQueue?: () => void;
  roomCode?: string | null;
  listenerCount?: number;
  isHost?: boolean;
  isShuffle?: boolean;
  toggleShuffle?: () => void;
  isRepeat?: boolean;
  toggleRepeat?: () => void;
}

export function BottomPlayer({
  currentTrack,
  isPlaying,
  positionMs,
  durationMs,
  queue,
  queueIndex,
  onPlayPause,
  onSkip,
  onSeek,
  onNext,
  onPrev,
  onToggleQueue,
  roomCode,
  listenerCount = 0,
  isHost = true,
  isShuffle = false,
  toggleShuffle,
  isRepeat = false,
  toggleRepeat
}: BottomPlayerProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(70);
  const { lyrics, plainLyrics, isLoading: lyricsLoading } = useLyrics(currentTrack);
  const { toggleLike, isLiked } = useLikedTracks();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const isGuest = !!roomCode && !isHost;

  const activeLyricIndex = lyrics.findIndex((line, index) => {
    const nextLine = lyrics[index + 1];
    return nextLine ? positionMs >= line.timeMs && positionMs < nextLine.timeMs : positionMs >= line.timeMs;
  });

  useEffect(() => {
    if (!isExpanded || !scrollRef.current || activeLyricIndex < 0) return;
    const container = scrollRef.current;
    const child = container.children[activeLyricIndex] as HTMLElement;
    if (!child) return;
    const offset = child.offsetTop - container.offsetHeight / 3;
    container.scrollTo({ top: offset, behavior: "smooth" });
  }, [activeLyricIndex, isExpanded]);

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setVolume(Math.round(pct));
  };

  const renderLyrics = () => {
    if (lyricsLoading) return <NoLyricsText><div className="title">Loading lyrics...</div></NoLyricsText>;
    if (lyrics.length > 0) return lyrics.map((line, idx) => (
      <LyricLine key={idx} $active={idx === activeLyricIndex} onClick={() => onSeek(line.timeMs)}>
        {line.text}
      </LyricLine>
    ));
    if (plainLyrics) return <PlainLyricsText>{plainLyrics}</PlainLyricsText>;
    return <NoLyricsText><div className="emoji">🎶</div><div className="title">No lyrics available</div></NoLyricsText>;
  };

  return (
    <BottomBar $isExpanded={isExpanded}>
      {!isExpanded ? (
        <>
          <MiniPlayerContainer>
            <TrackInfo onClick={() => setIsExpanded(true)}>
              {currentTrack ? (
                <>
                  <img className="mini-thumb" src={currentTrack.thumbnailUrl} alt={currentTrack.title} />
                  <TrackText>
                    <div className="title">{currentTrack.title}</div>
                    <div 
                      className="artist"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentTrack.artistId) {
                          router.push('/artist/' + currentTrack.artistId);
                          setIsExpanded(false);
                        } else if (currentTrack.artist || currentTrack.channelTitle) {
                          router.push('/search?q=' + encodeURIComponent(currentTrack.artist || currentTrack.channelTitle || ""));
                          setIsExpanded(false);
                        }
                      }}
                      style={{ 
                        cursor: 'pointer',
                        pointerEvents: 'auto'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {currentTrack.channelTitle || currentTrack.artist || "Unknown Artist"}
                    </div>
                  </TrackText>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(currentTrack);
                    }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: isLiked(currentTrack.videoId) ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                      padding: '4px', display: 'flex', alignItems: 'center'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked(currentTrack.videoId) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </>
              ) : (
                <TrackText><div className="title" style={{ color: "rgba(255,255,255,0.3)" }}>No track playing</div></TrackText>
              )}
            </TrackInfo>

            <ControlsContainer $isExpanded={false}>
              <ButtonsRow $isExpanded={false}>
                <button 
                  disabled={isGuest}
                  onClick={(e) => { e.stopPropagation(); if (toggleShuffle) toggleShuffle(); }}
                  style={{ color: isShuffle ? 'var(--accent)' : 'inherit', opacity: isGuest ? 0.3 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }}
                >
                  <Shuffle size={18} fill="currentColor" />
                </button>
                <button 
                  disabled={isGuest} 
                  style={{ opacity: isGuest ? 0.3 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }} 
                  onClick={(e) => { e.stopPropagation(); if(onPrev) onPrev(); }}
                >
                  <SkipBack size={22} fill="currentColor" />
                </button>
                <button 
                  className="play-btn" 
                  disabled={isGuest} 
                  style={{ opacity: isGuest ? 0.5 : 1, cursor: isGuest ? 'not-allowed' : 'pointer', background: isGuest ? 'rgba(255,255,255,0.1)' : 'var(--accent)', color: isGuest ? '#fff' : '#000' }} 
                  onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
                >
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: "2px" }} />}
                </button>
                <button 
                  disabled={isGuest} 
                  style={{ opacity: isGuest ? 0.3 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }} 
                  onClick={(e) => { e.stopPropagation(); if(onNext) onNext(); }}
                >
                  <SkipForward size={22} fill="currentColor" />
                </button>
                <button 
                  disabled={isGuest}
                  onClick={(e) => { e.stopPropagation(); if (toggleRepeat) toggleRepeat(); }}
                  style={{ color: isRepeat ? 'var(--accent)' : 'inherit', opacity: isGuest ? 0.3 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }}
                >
                  <Repeat size={18} fill="currentColor" />
                </button>
              </ButtonsRow>
              <ProgressBar positionMs={positionMs} durationMs={durationMs} onSeek={(ms) => { if (!isGuest) onSeek(ms); }} />
            </ControlsContainer>

            <ExtraControls>
              {roomCode && <RoomBadge><LiveDot /> {roomCode}</RoomBadge>}
              <button 
                onClick={(e) => { e.stopPropagation(); if (onToggleQueue) onToggleQueue(); }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '4px', display: 'flex' }}
              >
                <ListMusic size={20} />
              </button>
              <VolumeContainer>
                {volume === 0 ? <VolumeX size={20} onClick={() => setVolume(70)} /> : <Volume2 size={20} onClick={() => setVolume(0)} />}
                <VolumeSlider onClick={handleVolumeClick}><VolumeFill className="vol-fill" style={{ width: `${volume}%` }} /></VolumeSlider>
              </VolumeContainer>
            </ExtraControls>
          </MiniPlayerContainer>
        </>
      ) : (
        <ExpandedWrapper>
          <BackgroundBlur $imageUrl={currentTrack?.thumbnailUrl} />
          <CloseButton onClick={() => setIsExpanded(false)}><ChevronDown size={28} /></CloseButton>
          
          {currentTrack && (
            <ExpandedContent>
              <ExpandedLeft>
                <ArtworkContainer $isPlaying={isPlaying}>
                  <img src={currentTrack.thumbnailUrl} alt={currentTrack.title} />
                </ArtworkContainer>
                <TrackDetails>
                  <div className="title">{currentTrack.title}</div>
                  <div 
                    className="artist"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentTrack.artistId) {
                        setIsExpanded(false);
                        router.push('/artist/' + currentTrack.artistId);
                      }
                    }}
                    style={{ 
                      cursor: (currentTrack.artistId) ? 'pointer' : 'default',
                      pointerEvents: 'auto'
                    }}
                    onMouseEnter={(e) => {
                      if (currentTrack.artistId) {
                        e.currentTarget.style.textDecoration = 'underline';
                        e.currentTarget.style.color = '#fff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    {currentTrack.channelTitle || currentTrack.artist || "Unknown Artist"}
                  </div>
                </TrackDetails>
              </ExpandedLeft>
              <ExpandedRight ref={scrollRef}>{renderLyrics()}</ExpandedRight>
            </ExpandedContent>
          )}

          <div style={{ width: "100%", maxWidth: "600px", marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10 }}>
            <ProgressBar positionMs={positionMs} durationMs={durationMs} onSeek={onSeek} />
            <div style={{ height: "2rem" }} />
            <ButtonsRow $isExpanded={true}>
              <button 
                disabled={isGuest}
                onClick={(e) => { e.stopPropagation(); if (toggleShuffle) toggleShuffle(); }}
                style={{ color: isShuffle ? 'var(--accent)' : 'inherit', opacity: isGuest ? 0.3 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }}
              >
                <Shuffle size={24} />
              </button>
              <button 
                disabled={isGuest} 
                style={{ opacity: isGuest ? 0.3 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }} 
                onClick={onPrev}
              >
                <SkipBack size={36} fill="currentColor" />
              </button>
              <button 
                className="play-btn" 
                disabled={isGuest} 
                style={{ width: "80px", height: "80px", opacity: isGuest ? 0.5 : 1, cursor: isGuest ? 'not-allowed' : 'pointer', background: isGuest ? 'rgba(255,255,255,0.1)' : 'var(--accent)', color: isGuest ? '#fff' : '#000' }} 
                onClick={onPlayPause}
              >
                {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" style={{ marginLeft: "6px" }} />}
              </button>
              <button 
                disabled={isGuest} 
                style={{ opacity: isGuest ? 0.3 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }} 
                onClick={onNext}
              >
                <SkipForward size={36} fill="currentColor" />
              </button>
              <button 
                disabled={isGuest}
                onClick={(e) => { e.stopPropagation(); if (toggleRepeat) toggleRepeat(); }}
                style={{ color: isRepeat ? 'var(--accent)' : 'inherit', opacity: isGuest ? 0.3 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }}
              >
                <Repeat size={24} />
              </button>
            </ButtonsRow>
            {roomCode && (
              <div style={{ marginTop: "2rem" }}>
                <RoomBadge><LiveDot /> {isHost ? "Hosting" : "Listening"} · {roomCode} · <Users size={16} style={{ marginLeft: "4px" }} /> {listenerCount}</RoomBadge>
              </div>
            )}
          </div>
        </ExpandedWrapper>
      )}
    </BottomBar>
  );
}
