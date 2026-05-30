"use client";

import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import type { Track } from "@/types/music";
import { Play, Heart, RefreshCw, Radio } from "lucide-react";
import Link from "next/link";

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.15; }
`;

const Container = styled.div`
  padding-bottom: 2rem;
`;

const RecommendedContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  max-height: 340px; /* Force it to wrap into columns of 4 items */
  overflow-x: auto;
  gap: 1rem;
  margin-bottom: 2.5rem;
  padding-bottom: 1rem;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const RecommendedTrack = styled.div<{ $index: number }>`
  flex: 0 0 auto;
  width: 400px;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius);
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
  animation: ${slideUpFade} 0.4s ease-out forwards;
  animation-delay: ${({ $index }) => `${$index * 0.05}s`};

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
    
    .play-btn {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (max-width: 800px) {
    width: 85vw;
    scroll-snap-align: center;
  }

  img {
    width: 64px;
    height: 64px;
    border-radius: calc(var(--radius) * 0.75);
    object-fit: cover;
    pointer-events: none;
  }

  .info {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
    padding-right: 0.5rem;

    .title {
      font-weight: 700;
      font-size: 0.95rem;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 0.1rem;
    }

    .artist {
      font-size: 0.8rem;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--muted);
    font-size: 0.85rem;

    .heart {
      opacity: 0;
      transition: all 0.2s;
    }

    .context-menu-btn {
      opacity: 0;
      transition: all 0.2s;
    }
    
    &:hover .heart {
      opacity: 1;
      color: var(--accent);
    }
  }

  &:hover .meta .heart,
  &:hover .meta .context-menu-btn {
    opacity: 1;
  }
`;

const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  margin-top: 1rem;
`;

const SectionTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  h2 {
    font-size: 1.75rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.5px;
    margin: 0;
  }
`;

const PillButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 1);
  color: #000;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: var(--radius);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
    background: #e0e0e0;
  }
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--muted);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ArtistCircle = styled.div<{ $index: number }>`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 140px;
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

  @media (max-width: 800px) {
    width: 110px;
    scroll-snap-align: start;
    
    img {
      width: 110px;
      height: 110px;
    }
  }

  img {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transition: all 0.2s;
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

const PlaceholderText = styled.div`
  color: var(--muted);
  font-size: 0.9rem;
  padding: 1rem 0;
`;

const RecPlayButton = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);

  svg {
    margin-left: 2px;
  }
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

  @media (max-width: 800px) {
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: 1rem;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.5rem;
  padding: 0.5rem 0 2rem;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
`;

const Card = styled.div<{ $index: number }>`
  flex: 0 0 auto;
  width: 200px;
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
    width: 140px;
    padding: 0.5rem;
    scroll-snap-align: start;
  }

  .context-menu-btn {
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover {
    transform: translateY(-8px);
    background: rgba(255, 255, 255, 0.06);
    .play-overlay {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    .context-menu-btn {
      opacity: 1;
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

  @media (max-width: 600px) {
    width: 150px;
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

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 1.25rem;
  color: #fff;
  letter-spacing: -0.5px;
`;

const SkeletonCard = styled.div<{ $index: number }>`
  flex: 0 0 auto;
  width: 200px;
  border-radius: var(--radius);
  padding: 1rem;
  opacity: 0;
  animation: ${slideUpFade} 0.4s ease-out forwards;
  animation-delay: ${({ $index }) => `${0.05 + $index * 0.03}s`};
`;

const SkeletonImage = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: calc(var(--radius) * 0.9);
  background: rgba(255, 255, 255, 0.06);
  margin-bottom: 1rem;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonLine = styled.div<{ $width?: string }>`
  height: 14px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.06);
  width: ${({ $width }) => $width || "80%"};
  margin-bottom: 0.5rem;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

import { useRecentTracks } from "@/hooks/useRecentTracks";
import { TrackContextMenu } from "./TrackContextMenu";
import { MoreVertical } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useRouter } from "next/navigation";

export function HomeGrid() {
  const { onPlay, onPlayNext, onAddToQueue, onStartRadio } = usePlayer();
  const router = useRouter();
  const [menuTrack, setMenuTrack] = useState<{ track: Track, x: number, y: number } | null>(null);

  const handleContextMenuClick = (e: React.MouseEvent, track: Track) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuTrack({ track, x: rect.right - 240, y: rect.bottom });
  };
  const [tracks, setTracks] = useState<Track[]>([]);
  const [hitlists, setHitlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { recentTracks } = useRecentTracks();

  useEffect(() => {
    const fetchHomeData = async () => {
      const { getHomeCache, setHomeCache } = await import('@/lib/cache');
      const cached = getHomeCache();
      
      // If we have cache, use it immediately
      if (cached.tracks && cached.hitlists) {
        setTracks(cached.tracks);
        setHitlists(cached.hitlists);
        setLoading(false);
        return;
      }
      try {
        let recentArtistsStr = "";
        try {
          const stored = localStorage.getItem('ventify-recent-tracks');
          if (stored) {
            const tracks = JSON.parse(stored);
            const artists = Array.from(new Set(tracks.map((t: any) => t.channelTitle || t.artist).filter(Boolean))).slice(0, 2);
            if (artists.length > 0) recentArtistsStr = (artists as string[]).join(',');
          }
        } catch (e) { }

        const hitlistUrl = recentArtistsStr ? `/api/home/hitlist?artists=${encodeURIComponent(recentArtistsStr)}` : `/api/home/hitlist`;

        const [searchRes, hitlistRes] = await Promise.all([
          fetch(`/api/search?q=${encodeURIComponent("Top Pop Hits 2024")}`),
          fetch(hitlistUrl)
        ]);

        let finalTracks: Track[] = [];
        let finalHitlists: any[] = [];

        if (searchRes.ok) {
          const data = await searchRes.json();
          finalTracks = data.tracks || [];
          setTracks(finalTracks);
        }

        if (hitlistRes.ok) {
          const data = await hitlistRes.json();
          finalHitlists = data.hitlists || [];
          setHitlists(finalHitlists);
        }
        
        setHomeCache(finalTracks, finalHitlists);
      } catch (error) {
        console.error("Error fetching home data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <Container>
        <SectionTitle>{getGreeting()}</SectionTitle>
        <ShelfContainer>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} $index={i}>
              <SkeletonImage />
              <SkeletonLine $width="85%" />
              <SkeletonLine $width="60%" />
            </SkeletonCard>
          ))}
        </ShelfContainer>
      </Container>
    );
  }

  const hits = tracks.slice(0, 15);
  const recommended = tracks.slice(15);

  return (
    <Container>
      <SectionTitle>{getGreeting()}</SectionTitle>

      {recentTracks.length > 0 && (
        <>
          <SectionHeaderRow>
            <SectionTitleGroup>
              <h2>Jam Again</h2>
            </SectionTitleGroup>
          </SectionHeaderRow>
          <ShelfContainer>
            {recentTracks.map((track, index) => (
              <Card key={`recent-${track.videoId}`} $index={index} onClick={() => onPlay(track)} onContextMenu={(e) => handleContextMenuClick(e, track)}>
                <ImageContainer className="image-container">
                  <img src={track.thumbnailUrl} alt={track.title} loading="lazy" />
                  <PlayOverlay className="play-overlay">
                    <Play fill="currentColor" size={24} />
                  </PlayOverlay>
                  <button
                    onClick={(e) => handleContextMenuClick(e, track)}
                    className="context-menu-btn"
                    style={{
                      position: 'absolute', top: '8px', right: '8px',
                      background: 'rgba(0,0,0,0.5)', borderRadius: '50%', border: 'none',
                      color: 'rgba(255,255,255,0.9)', cursor: 'pointer', padding: '6px',
                      display: 'flex', zIndex: 10, backdropFilter: 'blur(4px)'
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>
                </ImageContainer>
                <Title>{track.title}</Title>
                <Subtitle
                  onClick={(e) => {
                    e.stopPropagation();
                    if (track.artistId) {
                      router.push('/artist/' + track.artistId);
                    } else if (track.artist || track.channelTitle) {
                      router.push('/search?q=' + encodeURIComponent(track.artist || track.channelTitle || ""));
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  {track.channelTitle || track.artist || "Artist"}
                </Subtitle>
              </Card>
            ))}
          </ShelfContainer>
        </>
      )}

      {hits.length > 0 && (
        <>
          <SectionHeaderRow>
            <SectionTitleGroup>
              <h2>Recommendations</h2>
            </SectionTitleGroup>
            <IconButton><RefreshCw size={16} /></IconButton>
          </SectionHeaderRow>
          <RecommendedContainer>
            {hits.map((track, index) => (
              <RecommendedTrack key={`hit-${track.videoId}`} $index={index} onClick={() => onPlay(track)} onContextMenu={(e) => handleContextMenuClick(e, track)}>
                <img src={track.thumbnailUrl} alt={track.title} loading="lazy" />
                <div className="info">
                  <div className="title">{track.title}</div>
                  <div 
                    className="artist"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (track.artistId) {
                        router.push('/artist/' + track.artistId);
                      } else if (track.artist || track.channelTitle) {
                        router.push('/search?q=' + encodeURIComponent(track.artist || track.channelTitle || ""));
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    {track.channelTitle || track.artist || "Artist"}
                  </div>
                </div>
                <div className="meta">
                  <span>{track.durationMs ? `${Math.floor(track.durationMs / 60000)}:${String(Math.floor((track.durationMs % 60000) / 1000)).padStart(2, '0')}` : "3:45"}</span>
                  <button
                    className="context-menu-btn"
                    onClick={(e) => handleContextMenuClick(e, track)}
                    style={{
                      background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer', padding: '0px', display: 'flex', marginLeft: '12px'
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </RecommendedTrack>
            ))}
          </RecommendedContainer>
        </>
      )}

      {hitlists.map((hitlist, idx) => (
        <div key={`hitlist-${idx}`}>
          <SectionHeaderRow>
            <SectionTitleGroup>
              <h2>{hitlist.title}</h2>
            </SectionTitleGroup>
            <IconButton><RefreshCw size={16} /></IconButton>
          </SectionHeaderRow>
          <ShelfContainer>
            {hitlist.items.map((item: any, i: number) => (
              <Card
                key={`hl-${item.id}-${i}`}
                $index={i}
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
                <Subtitle>{item.subtitle}</Subtitle>
              </Card>
            ))}
          </ShelfContainer>
        </div>
      ))}

      {recommended.length > 0 && (
        <>
          <SectionHeaderRow>
            <SectionTitleGroup>
              <h2>Recommended Artists</h2>
            </SectionTitleGroup>
            <IconButton><RefreshCw size={16} /></IconButton>
          </SectionHeaderRow>
          <ShelfContainer>
            {recommended.slice(0, 8).map((track, index) => (
              <ArtistCircle
                key={`artist-${track.videoId}`}
                $index={index}
                onClick={() => {
                  if (track.artistId) {
                    router.push('/artist/' + track.artistId);
                  }
                }}
              >
                <img src={track.thumbnailUrl} alt={track.channelTitle} loading="lazy" />
                <span>{track.channelTitle || track.artist || "Artist"}</span>
              </ArtistCircle>
            ))}
          </ShelfContainer>
        </>
      )}

      {menuTrack && (
        <TrackContextMenu
          track={menuTrack.track}
          x={menuTrack.x}
          y={menuTrack.y}
          onClose={() => setMenuTrack(null)}
          onPlayNext={onPlayNext}
          onAddToQueue={onAddToQueue}
          onStartRadio={onStartRadio}
        />
      )}
    </Container>
  );
}
