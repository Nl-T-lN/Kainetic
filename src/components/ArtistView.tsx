import { useEffect, useState } from "react";
import styled from "styled-components";
import type { Track } from "@/types/music";
import { TrackList } from "./TrackList";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";

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

const Card = styled.div`
  flex: 0 0 auto;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  background: transparent;
  border-radius: calc(var(--radius) * 0.8);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

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
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  
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
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
`;

const PlayOverlay = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 48px;
  height: 48px;
  background: var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  opacity: 0;
  transform: translateY(12px) scale(0.9);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  z-index: 2;

  &:hover {
    transform: translateY(0) scale(1.08) !important;
    filter: brightness(1.1);
  }

  svg {
    margin-left: 3px;
  }
`;

const CardTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardSubtitle = styled.p`
  font-size: 0.85rem;
  color: var(--muted);
  margin: 0;
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
                <ImageContainer className="image-container">
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
                <ImageContainer className="image-container">
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
