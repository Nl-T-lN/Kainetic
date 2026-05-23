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
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.75rem;
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.cardBgHover};

    .play-btn {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  margin-bottom: 0.65rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const Thumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlayBtn = styled.div`
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  opacity: 0;
  transform: translateY(4px);
  transition: all ${({ theme }) => theme.transitions.normal};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);

  svg {
    margin-left: 1px;
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
            <ImageWrapper>
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
