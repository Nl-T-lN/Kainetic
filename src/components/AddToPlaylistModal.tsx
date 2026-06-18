"use client";

import styled, { keyframes } from "styled-components";
import { useEffect, useState } from "react";
import { X, Plus, Music, Check } from "lucide-react";
import type { Track } from "@/types/music";
import { useLibraryStore } from "@/store/libraryStore";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalCard = styled.div`
  background: var(--bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  animation: ${slideUp} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #fff;
    font-weight: 700;
  }

  button {
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }
`;

const ModalBody = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const PlaylistRow = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
  width: 100%;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const PlaylistThumb = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlaylistInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  span {
    color: #fff;
    font-size: 0.95rem;
    font-weight: 600;
  }
  
  small {
    color: var(--muted);
    font-size: 0.8rem;
  }
`;

const ActionIcon = styled.div<{ $added: boolean }>`
  color: ${({ $added }) => $added ? "var(--accent)" : "rgba(255,255,255,0.2)"};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: var(--muted);
  font-size: 0.9rem;
`;

interface AddToPlaylistModalProps {
  track: Track;
  onClose: () => void;
  onAdded: () => void;
}

export function AddToPlaylistModal({ track, onClose, onAdded }: AddToPlaylistModalProps) {
  const { playlists, addTrackToPlaylist, removeTrackFromPlaylist } = useLibraryStore();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleToggle = (playlistId: string, isAdded: boolean) => {
    if (isAdded) {
      removeTrackFromPlaylist(playlistId, track.videoId);
    } else {
      addTrackToPlaylist(playlistId, track);
      onAdded();
      // Optional: Auto close on add
      // setTimeout(() => onClose(), 500); 
    }
  };

  return (
    <Overlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalCard>
        <ModalHeader>
          <h3>Save to Playlist</h3>
          <button onClick={onClose}><X size={20} /></button>
        </ModalHeader>

        <ModalBody>
          {playlists.length === 0 ? (
            <EmptyState>
              You haven't created any playlists yet.
            </EmptyState>
          ) : (
            playlists.map((playlist) => {
              const isAdded = playlist.tracks.some(t => t.videoId === track.videoId);
              
              return (
                <PlaylistRow 
                  key={playlist.id} 
                  onClick={() => handleToggle(playlist.id, isAdded)}
                >
                  <PlaylistThumb>
                    {playlist.coverUrl ? (
                      <img src={playlist.coverUrl} alt={playlist.name} />
                    ) : (
                      <Music size={20} color="var(--muted)" />
                    )}
                  </PlaylistThumb>
                  <PlaylistInfo>
                    <span>{playlist.name}</span>
                    <small>{playlist.tracks.length} songs</small>
                  </PlaylistInfo>
                  <ActionIcon $added={isAdded}>
                    {isAdded ? <Check size={20} /> : <Plus size={20} />}
                  </ActionIcon>
                </PlaylistRow>
              );
            })
          )}
        </ModalBody>
      </ModalCard>
    </Overlay>
  );
}
