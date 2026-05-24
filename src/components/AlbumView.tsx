"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import type { Track } from "@/types/music";
import { Play } from "lucide-react";
import { TrackList } from "./TrackList";

const AlbumContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-top: 2rem;
  color: ${({ theme }) => theme.colors.cream};
`;

const AlbumHeader = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-end;
  
  img {
    width: 250px;
    height: 250px;
    border-radius: calc(var(--radius) * 2);
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    object-fit: cover;
  }
`;

const AlbumInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -1px;
  }
  
  p {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.muted};
    margin: 0;
  }
`;

const PlayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.accent};
  color: #000;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
`;

interface AlbumViewProps {
  albumId: string;
  onPlay: (track: Track) => void;
  onPlayNext: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
}

export function AlbumView({ albumId, onPlay, onPlayNext, onAddToQueue }: AlbumViewProps) {
  const [albumData, setAlbumData] = useState<{
    title: string;
    author: string;
    thumbnailUrl: string;
    tracks: Track[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/album?id=${albumId}`);
        if (res.ok) {
          const data = await res.json();
          setAlbumData(data);
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

  if (loading) return <AlbumContainer>Loading Album...</AlbumContainer>;
  if (!albumData) return <AlbumContainer>Album not found.</AlbumContainer>;

  return (
    <AlbumContainer>
      <AlbumHeader>
        {albumData.thumbnailUrl && (
          <img src={albumData.thumbnailUrl} alt={albumData.title} />
        )}
        <AlbumInfo>
          <h1>{albumData.title}</h1>
          <p>{albumData.author}</p>
          <PlayButton onClick={() => {
            if (albumData.tracks.length > 0) {
              onPlay(albumData.tracks[0]);
            }
          }}>
            <Play fill="currentColor" size={28} style={{ marginLeft: '4px' }} />
          </PlayButton>
        </AlbumInfo>
      </AlbumHeader>
      
      <TrackList 
        tracks={albumData.tracks}
        onTrackSelect={onPlay}
        onPlayNext={onPlayNext}
        onAddToQueue={onAddToQueue}
        onStartRadio={onPlay}
      />
    </AlbumContainer>
  );
}
