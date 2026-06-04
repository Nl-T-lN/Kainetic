"use client";

import styled from "styled-components";
import { useRouter } from "next/navigation";

const TitleContainer = styled.div`
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  padding: 0;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
`;

const Card = styled.button<{ $color: string }>`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  background: ${({ $color }) => $color};
  overflow: hidden;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
`;

const CardTitle = styled.span`
  position: absolute;
  top: 16px;
  left: 16px;
  font-size: 1.2rem;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  word-wrap: break-word;
  max-width: 80%;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  
  @media (max-width: 768px) {
    font-size: 1rem;
    top: 12px;
    left: 12px;
  }
`;

const DecorativeCircle = styled.div`
  position: absolute;
  bottom: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(-15deg);
`;

interface Genre {
  title: string;
  query?: string;
  params?: string;
  color: string;
}

// Vibrant colors mimicking Spotify/Apple Music genre cards
const GENRES: Genre[] = [
  { title: "Pop", params: "ggMPOg1uX1lLQkxHbHhWQUUy", color: "linear-gradient(135deg, #ff4b4b, #e60000)" },
  { title: "Hip-Hop", params: "ggMPOg1uX0M2dmRieXNxTW1s", color: "linear-gradient(135deg, #ff9900, #cc7a00)" },
  { title: "Indie", params: "ggMPOg1uX21NWWpBbU01SDgy", color: "linear-gradient(135deg, #33ff99, #00cc66)" },
  { title: "R&B", query: "R&B Music", color: "linear-gradient(135deg, #cc33ff, #9900cc)" },
  { title: "Electronic", params: "ggMPOg1uX1NPTld3SDN3WGs4", color: "linear-gradient(135deg, #ff33cc, #cc0099)" },
  { title: "Rock", params: "ggMPOg1uXzJKTm5jUEZ5Uzlu", color: "linear-gradient(135deg, #33ccff, #0099cc)" },
  { title: "Lo-Fi", query: "LoFi beats", color: "linear-gradient(135deg, #6699ff, #3366cc)" },
  { title: "Jazz", params: "ggMPOg1uX3lPcDFRaE9wM1BS", color: "linear-gradient(135deg, #ffcc00, #cca300)" },
  { title: "Workout", params: "ggMPOg1uX09LWkhnTjRGRUJh", color: "linear-gradient(135deg, #4d4dff, #0000e6)" },
  { title: "Chill", params: "ggMPOg1uX1JOQWZFeDByc2Jm", color: "linear-gradient(135deg, #00e6e6, #00b3b3)" },
  { title: "Party", params: "ggMPOg1uX0pmQ0s2V0JRclZs", color: "linear-gradient(135deg, #ff0066, #cc0052)" },
  { title: "Focus", params: "ggMPOg1uX0NvNGNhWThMYWRh", color: "linear-gradient(135deg, #4da6ff, #0080ff)" },
];

export default function GenreGrid() {
  const router = useRouter();

  return (
    <div>
      <TitleContainer>
        <h3>Browse all</h3>
      </TitleContainer>
      <Grid>
        {GENRES.map((g) => (
          <Card 
            key={g.title} 
            $color={g.color}
            onClick={() => {
              if (g.params) {
                 router.push(`/genre/${g.params}?title=${encodeURIComponent(g.title)}`);
              } else {
                 router.push(`/search?q=${encodeURIComponent(g.query || g.title)}`);
              }
            }}
          >
            <CardTitle>{g.title}</CardTitle>
            <DecorativeCircle />
          </Card>
        ))}
      </Grid>
    </div>
  );
}
