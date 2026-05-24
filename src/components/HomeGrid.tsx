"use client";

import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import type { Track } from "@/types/music";
import { Play } from "lucide-react";

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.15; }
`;

const Container = styled.div`
  padding-bottom: 2rem;
`;

const RecommendedContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2.5rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const RecommendedTrack = styled.div<{ $index: number }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius);
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
  animation: ${slideUpFade} 0.4s ease-out forwards;
  animation-delay: ${({ $index }) => `${$index * 0.05}s`};

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
    
    .play-btn {
      opacity: 1;
      transform: scale(1);
    }
  }

  img {
    width: 64px;
    height: 64px;
    border-radius: calc(var(--radius) * 0.75);
    object-fit: cover;
  }

  .info {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
    padding-right: 0.5rem;

    .title {
      font-weight: 700;
      font-size: 0.95rem;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 0.1rem;
    }

    .artist {
      font-size: 0.8rem;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

const RecPlayButton = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);

  svg {
    margin-left: 2px;
  }
`;

const ShelfContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 1.5rem;
  padding: 0.5rem 0 2rem;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Card = styled.div<{ $index: number }>`
  flex: 0 0 auto;
  width: 200px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius);
  padding: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  opacity: 0;
  animation: ${slideUpFade} 0.4s ease-out forwards;
  animation-delay: ${({ $index }) => `${0.05 + $index * 0.03}s`};

  &:hover {
    background: rgba(255, 255, 255, 0.06);

    .play-overlay {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 600px) {
    width: 150px;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  margin-bottom: 1rem;
  position: relative;
  border-radius: calc(var(--radius) * 0.9);
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlayOverlay = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.2s ease;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);

  &:hover {
    transform: scale(1.08) translateY(0);
    filter: brightness(1.1);
  }

  svg {
    margin-left: 3px;
  }
`;

const Title = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Subtitle = styled.p`
  font-size: 0.85rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 1.25rem;
  color: #fff;
  letter-spacing: -0.5px;
`;

const SkeletonCard = styled.div<{ $index: number }>`
  flex: 0 0 auto;
  width: 200px;
  border-radius: var(--radius);
  padding: 1rem;
  opacity: 0;
  animation: ${slideUpFade} 0.4s ease-out forwards;
  animation-delay: ${({ $index }) => `${0.05 + $index * 0.03}s`};
`;

const SkeletonImage = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: calc(var(--radius) * 0.9);
  background: rgba(255, 255, 255, 0.06);
  margin-bottom: 1rem;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonLine = styled.div<{ $width?: string }>`
  height: 14px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.06);
  width: ${({ $width }) => $width || "80%"};
  margin-bottom: 0.5rem;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

interface HomeGridProps {
  onPlay: (track: Track) => void;
}

import { useRecentTracks } from "@/hooks/useRecentTracks";

export function HomeGrid({ onPlay }: HomeGridProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { recentTracks } = useRecentTracks();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent("Top Pop Hits 2024")}`
        );
        if (res.ok) {
          const data = await res.json();
          setTracks(data.tracks || []);
        }
      } catch (error) {
        console.error("Error fetching home tracks", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <Container>
        <SectionTitle>{getGreeting()}</SectionTitle>
        <ShelfContainer>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} $index={i}>
              <SkeletonImage />
              <SkeletonLine $width="85%" />
              <SkeletonLine $width="60%" />
            </SkeletonCard>
          ))}
        </ShelfContainer>
      </Container>
    );
  }

  const hits = tracks.slice(0, 10);
  const recommended = tracks.slice(10);

  return (
    <Container>
      <SectionTitle>{getGreeting()}</SectionTitle>
      
      {recentTracks.length > 0 && (
        <>
          <SectionTitle style={{ fontSize: "1.4rem", marginTop: "1rem" }}>Recently Played</SectionTitle>
          <ShelfContainer>
            {recentTracks.map((track, index) => (
              <Card key={`recent-${track.videoId}`} $index={index} onClick={() => onPlay(track)}>
                <ImageContainer>
                  <img src={track.thumbnailUrl} alt={track.title} loading="lazy" />
                  <PlayOverlay className="play-overlay">
                    <Play fill="currentColor" size={24} />
                  </PlayOverlay>
                </ImageContainer>
                <Title>{track.title}</Title>
                <Subtitle>
                  {track.channelTitle || track.artist || "Artist"}
                </Subtitle>
              </Card>
            ))}
          </ShelfContainer>
        </>
      )}

      {hits.length > 0 && (
        <>
          <SectionTitle style={{ fontSize: "1.4rem", marginTop: "1rem" }}>Hits of the Week</SectionTitle>
          <ShelfContainer>
            {hits.map((track, index) => (
              <Card key={`hit-${track.videoId}`} $index={index} onClick={() => onPlay(track)}>
                <ImageContainer>
                  <img src={track.thumbnailUrl} alt={track.title} loading="lazy" />
                  <PlayOverlay className="play-overlay">
                    <Play fill="currentColor" size={24} />
                  </PlayOverlay>
                </ImageContainer>
                <Title>{track.title}</Title>
                <Subtitle>
                  {track.channelTitle || track.artist || "Artist"}
                </Subtitle>
              </Card>
            ))}
          </ShelfContainer>
        </>
      )}

      {recommended.length > 0 && (
        <>
          <SectionTitle style={{ fontSize: "1.4rem", marginTop: "1rem" }}>Recommended for You</SectionTitle>
          <ShelfContainer>
            {recommended.map((track, index) => (
              <Card key={`rec-${track.videoId}`} $index={index} onClick={() => onPlay(track)}>
                <ImageContainer>
                  <img src={track.thumbnailUrl} alt={track.title} loading="lazy" />
                  <PlayOverlay className="play-overlay">
                    <Play fill="currentColor" size={24} />
                  </PlayOverlay>
                </ImageContainer>
                <Title>{track.title}</Title>
                <Subtitle>
                  {track.channelTitle || track.artist || "Artist"}
                </Subtitle>
              </Card>
            ))}
          </ShelfContainer>
        </>
      )}
    </Container>
  );
}

