import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import type { Track } from "@/types/music";
import { TrackList } from "./TrackList";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  padding-bottom: 4rem;
  animation: fadeIn 0.5s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2rem;
  padding: 2rem 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ArtistImage = styled.img`
  width: 240px;
  height: 240px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    width: 180px;
    height: 180px;
  }
`;

const ArtistInfo = styled.div`
  flex: 1;
`;

const Subtitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  margin: 0 0 1rem 0;
  line-height: 1.1;
  letter-spacing: -1px;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Stats = styled.div`
  color: var(--muted);
  font-size: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 2rem 0 1rem 0;
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

const Card = styled.div<{ $index?: number }>`
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
  animation-delay: ${({ $index = 0 }) => `${0.05 + $index * 0.03}s`};

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

const CardTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardSubtitle = styled.p`
  font-size: 0.85rem;
  color: var(--muted);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LoadingSpinner = () => {
  return (
    <Container style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem', color: 'var(--muted)' }}>
      <h2>Loading artist...</h2>
    </Container>
  );
};

interface ArtistViewProps {
  artistId: string;
}

export function ArtistView({ artistId }: ArtistViewProps) {
  const { onPlay, onPlayNext, onAddToQueue } = usePlayer();
  const router = useRouter();
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!artistId) return;
    
    setLoading(true);
    const fetchArtist = async () => {
      try {
        const res = await fetch(`/api/artist?id=${artistId}`);
        if (res.ok) {
          const data = await res.json();
          setArtist(data);
        }
      } catch (error) {
        console.error("Error fetching artist:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtist();
  }, [artistId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!artist || artist.error) {
    return <Container><SectionTitle>Artist not found</SectionTitle></Container>;
  }

  // Pick the highest resolution thumbnail or fallback
  const artistImageUrl = artist.thumbnailUrl || '/placeholder-artist.jpg';

  return (
    <Container>
      <Header>
        {artistImageUrl && <ArtistImage src={artistImageUrl} alt={artist.name} />}
        <ArtistInfo>
          <Subtitle>Artist</Subtitle>
          <Title>{artist.name}</Title>
          {artist.subscribers && <Stats>{artist.subscribers}</Stats>}
        </ArtistInfo>
      </Header>

      {artist.topTracks && artist.topTracks.length > 0 && (
        <>
          <SectionTitle>Top Songs</SectionTitle>
          <TrackList 
            tracks={artist.topTracks} 
            onTrackSelect={onPlay} 
            onPlayNext={onPlayNext}
            onAddToQueue={onAddToQueue}
          />
        </>
      )}

      {artist.albums && artist.albums.length > 0 && (
        <>
          <SectionTitle>Albums</SectionTitle>
          <ShelfContainer>
            {artist.albums.map((album: any) => (
              <Card key={album.id} onClick={() => router.push('/album/' + album.id)}>
                <ImageContainer>
                  <img src={album.thumbnailUrl || '/placeholder-artist.jpg'} alt={album.title} loading="lazy" />
                  <PlayOverlay className="play-overlay">
                    <Play fill="currentColor" size={24} />
                  </PlayOverlay>
                </ImageContainer>
                <CardTitle>{album.title}</CardTitle>
                <CardSubtitle>{album.year}</CardSubtitle>
              </Card>
            ))}
          </ShelfContainer>
        </>
      )}

      {artist.singles && artist.singles.length > 0 && (
        <>
          <SectionTitle>Singles</SectionTitle>
          <ShelfContainer>
            {artist.singles.map((single: any) => (
              <Card key={single.id} onClick={() => router.push('/album/' + single.id)}>
                <ImageContainer>
                  <img src={single.thumbnailUrl || '/placeholder-artist.jpg'} alt={single.title} loading="lazy" />
                  <PlayOverlay className="play-overlay">
                    <Play fill="currentColor" size={24} />
                  </PlayOverlay>
                </ImageContainer>
                <CardTitle>{single.title}</CardTitle>
                <CardSubtitle>{single.year}</CardSubtitle>
              </Card>
            ))}
          </ShelfContainer>
        </>
      )}
    </Container>
  );
}
