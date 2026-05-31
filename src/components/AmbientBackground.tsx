"use client";

import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

const BlobAnimation1 = keyframes`
  0% { transform: translate(0, 0) scale(1) rotate(0deg); }
  50% { transform: translate(15vw, 15vh) scale(1.2) rotate(180deg); }
  100% { transform: translate(0, 0) scale(1) rotate(360deg); }
`;

const BlobAnimation2 = keyframes`
  0% { transform: translate(0, 0) scale(1) rotate(0deg); }
  50% { transform: translate(-15vw, 15vh) scale(1.3) rotate(-180deg); }
  100% { transform: translate(0, 0) scale(1) rotate(-360deg); }
`;

const BlobAnimation3 = keyframes`
  0% { transform: translate(0, 0) scale(1) rotate(0deg); }
  50% { transform: translate(15vw, -15vh) scale(1.1) rotate(180deg); }
  100% { transform: translate(0, 0) scale(1) rotate(360deg); }
`;

const BlobAnimation4 = keyframes`
  0% { transform: translate(0, 0) scale(1) rotate(0deg); }
  50% { transform: translate(-15vw, -15vh) scale(1.4) rotate(-180deg); }
  100% { transform: translate(0, 0) scale(1) rotate(-360deg); }
`;

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  background-color: #000;
  pointer-events: none;
`;

const BackgroundImage = styled.div<{ $url: string }>`
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background-image: ${({ $url }) => `url(${$url})`};
  background-size: cover;
  background-position: center;
  filter: blur(70px) brightness(0.7) saturate(2.5);
  opacity: 0.8;
  z-index: 1;
`;

const Blob = styled.div<{ $color: string; $top: string; $left: string; $anim: any }>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: 80vmin;
  height: 80vmin;
  background-color: ${({ $color }) => $color};
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  mix-blend-mode: normal;
  filter: blur(60px) saturate(2);
  opacity: 0.85;
  animation: ${({ $anim }) => $anim} 25s infinite alternate ease-in-out;
  z-index: 2;
  transform-origin: center center;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);
  z-index: 3;
`;

interface AmbientBackgroundProps {
  imageUrl?: string;
}

export function AmbientBackground({ imageUrl }: AmbientBackgroundProps) {
  const [colors, setColors] = useState<string[]>(['#111', '#222', '#333', '#444']);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      
      canvas.width = 64;
      canvas.height = 64;
      ctx.drawImage(img, 0, 0, 64, 64);
      
      // Sample 4 quadrants for distinct colors
      const sampleColor = (x: number, y: number, w: number, h: number) => {
        try {
          const imgData = ctx.getImageData(x, y, w, h).data;
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < imgData.length; i += 16) {
            r += imgData[i];
            g += imgData[i+1];
            b += imgData[i+2];
            count++;
          }
          return `rgb(${Math.floor(r/count)}, ${Math.floor(g/count)}, ${Math.floor(b/count)})`;
        } catch (e) {
          return '#333';
        }
      };

      const c1 = sampleColor(0, 0, 32, 32);
      const c2 = sampleColor(32, 0, 32, 32);
      const c3 = sampleColor(0, 32, 32, 32);
      const c4 = sampleColor(32, 32, 32, 32);
      
      setColors([c1, c2, c3, c4]);
    };
  }, [imageUrl]);

  return (
    <Container>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {imageUrl && <BackgroundImage $url={imageUrl} />}
      <Blob $color={colors[0]} $top="-20%" $left="-20%" $anim={BlobAnimation1} style={{ animationDelay: '0s' }} />
      <Blob $color={colors[1]} $top="-20%" $left="40%" $anim={BlobAnimation2} style={{ animationDelay: '-5s' }} />
      <Blob $color={colors[2]} $top="40%" $left="-20%" $anim={BlobAnimation3} style={{ animationDelay: '-10s' }} />
      <Blob $color={colors[3]} $top="40%" $left="40%" $anim={BlobAnimation4} style={{ animationDelay: '-15s' }} />
      <Overlay />
    </Container>
  );
}
