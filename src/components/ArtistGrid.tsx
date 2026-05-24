import styled, { keyframes } from "styled-components";

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const ArtistGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
`;

export const ArtistCircle = styled.div<{ $index: number }>`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
  animation: ${slideUpFade} 0.4s ease-out forwards;
  animation-delay: ${({ $index }) => `${0.05 + $index * 0.03}s`};

  &:hover {
    transform: translateY(-4px) scale(1.05);
    img {
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
  }

  img {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transition: all 0.2s;
    
    @media (max-width: 768px) {
      width: 120px;
      height: 120px;
    }
  }

  span {
    font-size: 0.95rem;
    font-weight: 600;
    color: #fff;
    text-align: center;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

interface ArtistGridProps {
  artists: any[];
  onArtistClick: (artistId: string) => void;
}

export function ArtistGrid({ artists, onArtistClick }: ArtistGridProps) {
  if (!artists || artists.length === 0) return null;

  return (
    <ArtistGridContainer>
      {artists.map((artist, index) => (
        <ArtistCircle 
          key={`artist-${artist.id}-${index}`} 
          $index={index}
          onClick={() => {
            if (artist.id) {
              onArtistClick(artist.id);
            }
          }}
        >
          <img src={artist.thumbnailUrl || '/placeholder-artist.jpg'} alt={artist.name} loading="lazy" />
          <span>{artist.name}</span>
        </ArtistCircle>
      ))}
    </ArtistGridContainer>
  );
}
