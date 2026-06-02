"use client";

import styled, { keyframes } from "styled-components";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.5rem;
  padding: 0.5rem 0 2rem;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 0.5rem 0 2rem;
  }
`;

const Card = styled.div<{ $index: number }>`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  background: transparent;
  border-radius: calc(var(--radius) * 0.8);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  position: relative;
  opacity: 0;
  animation: ${slideUpFade} 0.4s ease-out forwards;
  animation-delay: ${({ $index }) => `${0.05 + $index * 0.03}s`};

  @media (max-width: 800px) {
    padding: 0.5rem;
  }

  &:hover {
    transform: translateY(-8px);
    background: rgba(255, 255, 255, 0.06);
    .play-overlay {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    img {
      transform: scale(1.05);
    }
    .image-container {
      box-shadow: 0 16px 32px rgba(0,0,0,0.5);
    }
    .image-container::after {
      opacity: 1;
    }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: calc(var(--radius) * 0.6);
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

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    pointer-events: none;
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
  transform: translateY(12px) scale(0.9);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: 2;

  &:hover {
    transform: translateY(0) scale(1.08) !important;
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

const PlaceholderText = styled.div`
  color: var(--muted);
  font-size: 0.9rem;
  padding: 1rem 0;
`;

interface AlbumGridProps {
  items: any[];
}

export function AlbumGrid({ items }: AlbumGridProps) {
  const router = useRouter();

  if (!items || items.length === 0) {
    return <PlaceholderText>No items found.</PlaceholderText>;
  }

  return (
    <GridContainer>
      {items.map((item, index) => (
        <Card 
          key={item.id || index} 
          $index={index}
          onClick={() => {
            if (item.id) {
              router.push('/album/' + item.id);
            }
          }}
        >
          <ImageContainer className="image-container">
            <img src={item.thumbnailUrl} alt={item.title} loading="lazy" />
            <PlayOverlay className="play-overlay">
              <Play fill="currentColor" size={24} />
            </PlayOverlay>
          </ImageContainer>
          <Title>{item.title}</Title>
          <Subtitle>{item.subtitle || "Album"}</Subtitle>
        </Card>
      ))}
    </GridContainer>
  );
}
