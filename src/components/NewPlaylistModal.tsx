"use client";

import styled, { keyframes } from "styled-components";
import { useState, useEffect } from "react";
import { Search, Plus, X, Music, Check } from "lucide-react";
import type { Track } from "@/types/music";
import { useSearch } from "@/hooks/useSearch";

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
  max-width: 500px;
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
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--muted);
  }
`;

const TextInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;

  &:focus {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--accent);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
  }

  input {
    padding-left: 2.75rem;
  }
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 250px;
  overflow-y: auto;
  border-radius: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const TrackItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const TrackThumb = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 4px;
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

const TrackInfo = styled.div`
  flex: 1;
  min-width: 0;

  .title {
    color: #fff;
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .artist {
    color: var(--muted);
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const AddButton = styled.button<{ $added?: boolean }>`
  background: ${({ $added }) => $added ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${({ $added }) => $added ? '#fff' : 'var(--muted)'};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $added }) => $added ? 'rgba(255, 255, 255, 0.15)' : 'var(--accent)'};
    color: ${({ $added }) => $added ? '#fff' : '#000'};
    border-color: transparent;
  }
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 99px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ $primary }) => $primary ? `
    background: var(--accent);
    color: #000;
    border: none;
    
    &:hover:not(:disabled) {
      filter: brightness(1.1);
      transform: scale(1.02);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  ` : `
    background: transparent;
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`;

interface NewPlaylistModalProps {
  onClose: () => void;
  onSave: (name: string, tracks: Track[]) => void;
}

export function NewPlaylistModal({ onClose, onSave }: NewPlaylistModalProps) {
  const [name, setName] = useState("");
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const { search, tracks, isLoading, query } = useSearch();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleToggleTrack = (track: Track) => {
    setSelectedTracks(prev => {
      const exists = prev.some(t => t.videoId === track.videoId);
      if (exists) {
        return prev.filter(t => t.videoId !== track.videoId);
      }
      return [...prev, track];
    });
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), selectedTracks);
  };

  return (
    <Overlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalCard>
        <ModalHeader>
          <h3>Create Playlist</h3>
          <button onClick={onClose}><X size={20} /></button>
        </ModalHeader>

        <ModalBody>
          <InputGroup>
            <label>Name</label>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </InputGroup>

          <InputGroup>
            <label>Add Songs</label>
            <SearchContainer>
              <Search size={18} />
              <TextInput
                placeholder="Search for songs to add..."
                onChange={(e) => search(e.target.value)}
              />
            </SearchContainer>
          </InputGroup>

          {/* Show search results or selected tracks if query is empty */}
          <ResultsList>
            {query.trim() && isLoading && (
              <div style={{ color: "var(--muted)", textAlign: "center", padding: "1rem" }}>
                Searching...
              </div>
            )}

            {query.trim() && !isLoading && tracks.length === 0 && (
              <div style={{ color: "var(--muted)", textAlign: "center", padding: "1rem" }}>
                No songs found.
              </div>
            )}

            {(query.trim() ? tracks : selectedTracks).map((track) => {
              const isAdded = selectedTracks.some(t => t.videoId === track.videoId);

              return (
                <TrackItem key={track.videoId}>
                  <TrackThumb>
                    {track.thumbnailUrl ? (
                      <img src={track.thumbnailUrl} alt={track.title} />
                    ) : (
                      <Music size={20} color="var(--muted)" />
                    )}
                  </TrackThumb>
                  <TrackInfo>
                    <div className="title">{track.title}</div>
                    <div className="artist">{track.channelTitle || "Unknown Artist"}</div>
                  </TrackInfo>
                  <AddButton
                    onClick={() => handleToggleTrack(track)}
                    $added={isAdded}
                    title={isAdded ? "Remove from playlist" : "Add to playlist"}
                  >
                    {isAdded ? <Check size={16} /> : <Plus size={16} />}
                  </AddButton>
                </TrackItem>
              );
            })}

            {!query.trim() && selectedTracks.length === 0 && (
              <div style={{ color: "var(--muted)", textAlign: "center", padding: "1rem", fontSize: "0.9rem" }}>
                Search for songs above to add them to your new playlist.
              </div>
            )}
          </ResultsList>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            $primary
            disabled={!name.trim()}
            onClick={handleSave}
          >
            Create {selectedTracks.length > 0 && `(${selectedTracks.length})`}
          </Button>
        </ModalFooter>
      </ModalCard>
    </Overlay>
  );
}
