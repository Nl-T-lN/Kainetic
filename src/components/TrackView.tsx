"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import type { Track } from "@/types/music";
import { Play, MoreHorizontal, Share2 } from "lucide-react";
import { TrackList } from "./TrackList";
import { usePlayer } from "@/contexts/PlayerContext";

const ViewWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  margin-top: -1.25rem;
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
  padding-left: 1rem;
  padding-right: 1rem;

  @media (min-width: 900px) {
    flex-direction: row;
    align-items: flex-start;
    padding-left: 1.75rem;
    padding-right: 1.75rem;
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

const TrackMeta = styled.div`
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
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.05);
  }
`;

const RightPane = styled.div`
  flex-grow: 1;
  width: 100%;
  min-width: 0;
`;

const LoadingSpinner = styled.div`
  width: 100%;
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1.1rem;
  font-weight: 500;
  
  &::after {
    content: '';
    width: 24px;
    height: 24px;
    margin-left: 12px;
    border: 2px solid ${({ theme }) => theme.colors.muted};
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.cream};
  margin-bottom: 1.5rem;
`;

export interface TrackViewProps {
  trackId: string;
}

export function TrackView({ trackId }: TrackViewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { onPlay, onPlayNext, onAddToQueue, onStartRadio } = usePlayer();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    fetch(`/api/track?id=${trackId}`)
      .then(res => res.json())
      .then(result => {
        if (!mounted) return;
        if (!result.error) {
          setData(result);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [trackId]);

  if (loading) {
    return <LoadingSpinner>Loading Track</LoadingSpinner>;
  }

  if (!data) {
    return (
      <ViewWrapper>
        <ContentContainer style={{ justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <h2 style={{ color: '#fff' }}>Track not found</h2>
        </ContentContainer>
      </ViewWrapper>
    );
  }

  const handlePlay = () => {
    const mainTrack = {
      videoId: data.id,
      title: data.title,
      artist: data.artist,
      thumbnailUrl: data.thumbnailUrl,
      durationMs: data.durationMs,
    };
    onPlay(mainTrack, data.relatedTracks || []);
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: data.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <ViewWrapper>
      <BackgroundBlur $bgImg={data.thumbnailUrl} />
      
      <ContentContainer>
        <LeftPane>
          <CoverImage src={data.thumbnailUrl} alt={data.title} crossOrigin="anonymous" />
          
          <TrackMeta>
            <h1>{data.title}</h1>
            <div className="subtitle">{data.artist}</div>
            <div className="stats">
              {formatDuration(data.durationMs)} • {data.viewCount?.toLocaleString() || "0"} views
            </div>
            {data.tags && data.tags.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {data.tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', color: '#fff' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </TrackMeta>

          <ActionsRow>
            <PlayFab onClick={handlePlay}>
              <Play fill="currentColor" size={28} style={{ marginLeft: '4px' }} />
            </PlayFab>
            <IconButton onClick={handleShare}>
              <Share2 size={20} />
            </IconButton>
            <IconButton>
              <MoreHorizontal size={20} />
            </IconButton>
          </ActionsRow>
        </LeftPane>

        <RightPane>
          {data.relatedTracks && data.relatedTracks.length > 0 && (
            <>
              <SectionTitle>Up Next</SectionTitle>
              <TrackList 
                tracks={data.relatedTracks} 
                onTrackSelect={(track) => onPlay(track, data.relatedTracks)}
                onPlayNext={onPlayNext}
                onAddToQueue={onAddToQueue}
                onStartRadio={onStartRadio}
              />
            </>
          )}
        </RightPane>
      </ContentContainer>
    </ViewWrapper>
  );
}
