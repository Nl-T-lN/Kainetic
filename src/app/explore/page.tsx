"use client";

import styled from "styled-components";
import { useEffect, useState } from "react";
import MusicMap from "@/components/explore/MusicMap";
import GenreGrid from "@/components/explore/GenreGrid";
import { TrackList } from "@/components/TrackList";
import { AlbumGrid } from "@/components/AlbumGrid";
import { Compass, Loader2 } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Track } from "@/types/music";

import { useRouter } from "next/navigation";



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

const MoodContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding-bottom: 12px;
  
  /* Hide scrollbar */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const MoodButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 10px 20px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.02);
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

export default function ExplorePage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { onPlay, currentTrack } = usePlayer();

  useEffect(() => {
    fetch("/api/explore")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleTrackSelect = (track: Track) => {
    onPlay(track);
  };

  return (
    <Container>


      {loading && (
        <LoadingContainer>
          <Loader2 size={32} />
          <span>Discovering music...</span>
        </LoadingContainer>
      )}

      {data?.moods && data.moods.length > 0 && (
        <Section>
          <SectionHeader>
            <h3>Mood</h3>
          </SectionHeader>
          <MoodContainer>
            {data.moods.map((mood: any, idx: number) => (
              <MoodButton 
                key={idx}
                onClick={() => router.push(`/genre/${mood.params}?title=${encodeURIComponent(mood.title)}`)}
              >
                {mood.title}
              </MoodButton>
            ))}
          </MoodContainer>
        </Section>
      )}

      <Section>
        <GenreGrid />
      </Section>

      {data && data.sections && data.sections.map((section: any, idx: number) => {
        const isAlbumSection = section.items[0]?.type === "MusicTwoRowItem";
        
        return (
          <Section key={idx}>
            <SectionHeader>{section.title}</SectionHeader>
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

      <Section>
        <MusicMap />
      </Section>
    </Container>
  );
}
