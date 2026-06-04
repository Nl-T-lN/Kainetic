"use client";

import styled from "styled-components";
import { useEffect, useState, use } from "react";
import { TrackList } from "@/components/TrackList";
import { AlbumGrid } from "@/components/AlbumGrid";
import { Loader2, ArrowLeft } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Track } from "@/types/music";
import { useRouter, useSearchParams } from "next/navigation";

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 1rem;
  padding-top: 1rem;
  gap: 16px;
`;

const Header = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
`;

const Container = styled.div`
  padding: 0 2rem 4rem 2rem;
  max-width: 1600px;
  margin: 0;
  text-align: left;
`;

const Section = styled.div`
  margin-bottom: 4rem;
  text-align: left;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;

  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: rgba(255, 255, 255, 0.5);
  gap: 1rem;

  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export default function GenrePage({ params }: { params: Promise<{ params: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const title = searchParams.get("title") || "Genre";
  const unwrappedParams = use(params);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { onPlay, currentTrack } = usePlayer();

  useEffect(() => {
    fetch(`/api/genre?params=${unwrappedParams.params}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [unwrappedParams.params]);

  const handleTrackSelect = (track: Track) => {
    onPlay(track);
  };

  return (
    <Container>
      <HeaderRow>
        <BackButton onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </BackButton>
        <Header>{title}</Header>
      </HeaderRow>

      {loading && (
        <LoadingContainer>
          <Loader2 size={32} />
          <span>Loading {title}...</span>
        </LoadingContainer>
      )}

      {data && data.sections && data.sections.map((section: any, idx: number) => {
        const isAlbumSection = section.items[0]?.type === "MusicTwoRowItem";
        
        return (
          <Section key={idx}>
            <SectionHeader>
              <h3>{section.title}</h3>
            </SectionHeader>
            {isAlbumSection ? (
              <AlbumGrid items={section.items} />
            ) : (
              <TrackList 
                tracks={section.items.map((item: any) => ({
                  videoId: item.id,
                  title: item.title,
                  artist: item.subtitle || "Unknown Artist",
                  thumbnailUrl: item.thumbnailUrl,
                  durationMs: 0
                }))}
                currentTrackId={currentTrack?.videoId}
                onTrackSelect={handleTrackSelect}
              />
            )}
          </Section>
        );
      })}
    </Container>
  );
}
