"use client";

import styled from "styled-components";
import type { Track } from "@/types/music";
import { Play } from "lucide-react";

const Container = styled.div`
  margin-top: 1.5rem;
`;

const Header = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.cream};
  margin-bottom: 1rem;
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: 0.85rem;
  overflow-x: auto;
  padding-bottom: 0.75rem;

  /* Hide scrollbar but keep functionality */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
  }
`;

const Card = styled.div`
  flex-shrink: 0;
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.6rem;
  background: transparent;
  border-radius: calc(var(--radius, 12px) * 0.8);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: translateY(-8px);
    background: rgba(255, 255, 255, 0.06);
    .play-btn {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    img {
      transform: scale(1.05);
    }
    .image-wrapper {
      box-shadow: 0 16px 32px rgba(0,0,0,0.5);
    }
    .image-wrapper::after {
      opacity: 1;
    }
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: calc(var(--radius, 12px) * 0.6);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  margin-bottom: 0.25rem;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    background: rgba(0, 0, 0, 0.4);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 1;
  }
`;

const Thumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  pointer-events: none;
`;

const PlayBtn = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  opacity: 0;
  transform: translateY(12px) scale(0.9);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: 2;

  &:hover {
    transform: translateY(0) scale(1.08) !important;
    filter: brightness(1.1);
  }

  svg {
    margin-left: 2px;
  }
`;

const Title = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.cream};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
`;

const Artist = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.mutedDim};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export function SimilarTracks({
  tracks,
  onSelect,
  isLoading,
}: {
  tracks: Track[];
  onSelect: (t: Track) => void;
  isLoading: boolean;
}) {
  if (tracks.length === 0 && !isLoading) return null;

  return (
    <Container>
      <Header>
        {isLoading ? "Finding similar tracks..." : "Up Next — AI Suggestions"}
      </Header>
      <ScrollContainer>
        {tracks.map((t) => (
          <Card key={t.videoId} onClick={() => onSelect(t)}>
            <ImageWrapper className="image-wrapper">
              <Thumb src={t.thumbnailUrl} alt={t.title} loading="lazy" />
              <PlayBtn className="play-btn">
                <Play fill="currentColor" size={18} />
              </PlayBtn>
            </ImageWrapper>
            <Title>{t.title}</Title>
            <Artist>{t.channelTitle}</Artist>
          </Card>
        ))}
      </ScrollContainer>
    </Container>
  );
}
