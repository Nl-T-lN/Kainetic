"use client";

import { useState } from "react";
import styled from "styled-components";
import type { Track } from "@/types/music";
import { Download, FileJson, Music } from "lucide-react";

const Container = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Description = styled.p`
  color: var(--muted);
  font-size: 0.9rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const ExportBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

function generateM3U(tracks: Track[]) {
  let content = "#EXTM3U\n\n";
  tracks.forEach((track) => {
    content += `#EXTINF:${track.durationMs ? Math.round(track.durationMs / 1000) : 0},${track.channelTitle || "Unknown"} - ${track.title}\n`;
    content += `https://youtube.com/watch?v=${track.videoId}\n\n`;
  });
  return content;
}

function generateJSON(tracks: Track[]) {
  return JSON.stringify({
    format: "monochrome-playlist",
    generated: new Date().toISOString(),
    tracks: tracks.map((t, i) => ({
      position: i + 1,
      title: t.title,
      artist: t.channelTitle,
      id: t.videoId,
    }))
  }, null, 2);
}

export function PlaylistGenerator({ tracks }: { tracks: Track[] }) {
  const [isExporting, setIsExporting] = useState(false);

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportM3U = () => {
    setIsExporting(true);
    const m3u = generateM3U(tracks);
    downloadFile(m3u, "kainetic-playlist.m3u", "audio/x-mpegurl");
    setIsExporting(false);
  };

  const handleExportJSON = () => {
    setIsExporting(true);
    const json = generateJSON(tracks);
    downloadFile(json, "kainetic-playlist.json", "application/json");
    setIsExporting(false);
  };

  return (
    <Container>
      <div>
        <Title><Download size={20} /> Export Playlist</Title>
        <Description>Download your current queue or history as a playlist file (M3U or JSON).</Description>
      </div>

      <ButtonRow>
        <ExportBtn onClick={handleExportM3U} disabled={isExporting || tracks.length === 0}>
          <Music size={16} /> M3U Format
        </ExportBtn>
        <ExportBtn onClick={handleExportJSON} disabled={isExporting || tracks.length === 0}>
          <FileJson size={16} /> JSON Format
        </ExportBtn>
      </ButtonRow>
    </Container>
  );
}
