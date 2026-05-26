"use client";

import { useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { Play, Plus, ListPlus, Heart, Download, User, Mic2, Share2, Disc } from "lucide-react";
import type { Track } from "@/types/music";
import { useLikedTracks } from "@/hooks/useLikedTracks";
import { useRouter } from "next/navigation";

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const MenuContainer = styled.div<{ $x: number; $y: number; $alignRight: boolean }>`
  position: fixed;
  top: ${({ $y }) => $y}px;
  ${({ $alignRight, $x }) => $alignRight ? `right: calc(100vw - ${$x}px);` : `left: ${$x}px;`}
  width: 240px;
  background: rgba(25, 25, 25, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  padding: 8px 0;
  z-index: 10000;
  animation: ${fadeIn} 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: ${({ $alignRight }) => $alignRight ? 'top right' : 'top left'};
`;

const MenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  svg {
    color: rgba(255, 255, 255, 0.5);
    transition: color 0.15s;
  }

  &:hover svg {
    color: #fff;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 6px 0;
`;

export interface TrackContextMenuProps {
  track: Track;
  x: number;
  y: number;
  onClose: () => void;
  onPlayNext?: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
  onStartRadio?: (track: Track) => void;
}

export function TrackContextMenu({ 
  track, 
  x, 
  y, 
  onClose,
  onPlayNext,
  onAddToQueue,
  onStartRadio
}: TrackContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { toggleLike, isLiked } = useLikedTracks();
  const router = useRouter();
  const liked = isLiked(track.videoId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    // Slight delay to prevent immediate close if triggered by a click
    setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 10);
    
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  // Prevent menu from going off-screen bottom or overlapping the bottom player
  const adjustY = y > window.innerHeight - 420 ? y - 420 : y;
  
  // Decide if we should align to the right side of the cursor
  const alignRight = x > window.innerWidth - 260;

  return (
    <MenuContainer ref={menuRef} $x={x} $y={adjustY} $alignRight={alignRight}>
      <MenuItem onClick={() => { onStartRadio?.(track); onClose(); }}>
        <Mic2 size={18} /> Start mix
      </MenuItem>
      
      <Divider />
      
      <MenuItem onClick={() => { onPlayNext?.(track); onClose(); }}>
        <Play size={18} /> Play next
      </MenuItem>
      
      <MenuItem onClick={() => { onAddToQueue?.(track); onClose(); }}>
        <ListPlus size={18} /> Add to queue
      </MenuItem>
      
      <MenuItem onClick={() => { toggleLike(track); onClose(); }}>
        <Heart size={18} fill={liked ? "#fff" : "none"} /> 
        {liked ? "Remove from library" : "Save to library"}
      </MenuItem>
      
      <Divider />
      
      <MenuItem onClick={() => onClose()}>
        <Download size={18} /> Download
      </MenuItem>
      
      <MenuItem onClick={() => onClose()}>
        <Plus size={18} /> Save to playlist
      </MenuItem>
      
      <Divider />
      
      <MenuItem onClick={() => {
        onClose();
        if ((track as any).albumId) {
          router.push('/album/' + (track as any).albumId);
        } else if (track.album) {
          // If we only have the name, we might not be able to link properly,
          // but we can try to search or just disable this option. For now, doing nothing.
        }
      }}>
        <Disc size={18} /> Go to album
      </MenuItem>
      
      <MenuItem onClick={() => {
        onClose();
        if (track.artistId) {
          router.push('/artist/' + track.artistId);
        }
      }}>
        <User size={18} /> Go to artist
      </MenuItem>
      
      <MenuItem onClick={() => onClose()}>
        <Share2 size={18} /> Share
      </MenuItem>
    </MenuContainer>
  );
}
