"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import type { Track } from "@/types/music";
import { Play, Shuffle, Heart, MoreHorizontal, BookmarkPlus } from "lucide-react";
import { TrackList } from "./TrackList";
import { usePlayer } from "@/contexts/PlayerContext";

const ViewWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  margin-top: -1.25rem; /* pull up to top bar */
`;

const BackgroundBlur = styled.div<{ $bgImg?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60vh;
  background-image: ${({ $bgImg }) => ($bgImg ? `url(${$bgImg})` : "none")};
  background-size: cover;
  background-position: center;
  filter: blur(100px) brightness(0.7) saturate(2);
  mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  z-index: 0;
  opacity: 0.8;
  pointer-events: none;
`;

const ContentContainer = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  padding-top: 3rem;
  gap: 3rem;

  @media (min-width: 900px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const LeftPane = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;

  @media (min-width: 900px) {
    width: 320px;
    flex-shrink: 0;
    position: sticky;
    top: 5rem;
  }
`;

const CoverImage = styled.img`
  width: 280px;
  height: 280px;
  border-radius: 8px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  object-fit: cover;
  
  @media (max-width: 900px) {
    width: 240px;
    height: 240px;
  }
`;

const AlbumMeta = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h1 {
    font-size: 2.25rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.cream};
    margin: 0;
    letter-spacing: -0.5px;
    line-height: 1.1;
  }

  .subtitle {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.muted};
    font-weight: 500;
  }

  .stats {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.mutedDim};
    margin-top: 0.25rem;
  }
  
  .description {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.muted};
    margin-top: 0.75rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const PlayFab = styled.button`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.cream};
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    background: #fff;
  }
`;

const IconButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: ${({ theme }) => theme.colors.cream};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const RightPane = styled.div`
  flex: 1;
  width: 100%;
  padding-bottom: 4rem;
`;

interface AlbumViewProps {
  albumId: string;
}

export function AlbumView({ albumId }: AlbumViewProps) {
  const { onPlay, onPlayNext, onAddToQueue } = usePlayer();
  const [albumData, setAlbumData] = useState<{
    title: string;
    author: string;
    thumbnailUrl: string;
    tracks: Track[];
    year?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/album?id=${albumId}`);
        if (res.ok) {
          const data = await res.json();
          // basic heuristic to extract year if available (often not directly in this api but we'll default)
          setAlbumData({ ...data, year: new Date().getFullYear().toString() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (albumId) {
      fetchAlbum();
    }
  }, [albumId]);

  if (loading) return <ViewWrapper><ContentContainer style={{ color: 'white', padding: '2rem' }}>Loading...</ContentContainer></ViewWrapper>;
  if (!albumData) return <ViewWrapper><ContentContainer style={{ color: 'white', padding: '2rem' }}>Album not found.</ContentContainer></ViewWrapper>;

  const totalDurationMs = albumData.tracks.reduce((acc, curr) => acc + (curr.durationMs || 0), 0);
  const durationMins = Math.floor(totalDurationMs / 60000);

  return (
    <ViewWrapper>
      {albumData.thumbnailUrl && <BackgroundBlur $bgImg={albumData.thumbnailUrl} />}

      <ContentContainer>
        <LeftPane>
          <CoverImage src={albumData.thumbnailUrl} alt={albumData.title} />

          <AlbumMeta>
            <h1>{albumData.title}</h1>
            <div className="subtitle">
              Album • {albumData.author}
            </div>
            <div className="stats">
              {albumData.tracks.length} songs • {durationMins} minutes
            </div>
          </AlbumMeta>

          <ActionsRow>
            <IconButton><BookmarkPlus size={20} /></IconButton>
            <PlayFab onClick={() => {
              if (albumData.tracks.length > 0) {
                onPlay(albumData.tracks[0], albumData.tracks);
              }
            }}>
              <Play fill="currentColor" size={28} style={{ marginLeft: '4px' }} />
            </PlayFab>
            <IconButton><MoreHorizontal size={20} /></IconButton>
          </ActionsRow>
        </LeftPane>

        <RightPane>
          <TrackList
            tracks={albumData.tracks}
            onTrackSelect={onPlay}
            onPlayNext={onPlayNext}
            onAddToQueue={onAddToQueue}
            onStartRadio={onPlay}
            isContextQueueEnabled={true}
          />
        </RightPane>
      </ContentContainer>
    </ViewWrapper>
  );
}
