"use client";

import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Play, Heart, Share2, Check } from "lucide-react";
import { useSavedPlaylists } from "@/hooks/useSavedPlaylists";

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

export interface PlaylistContextMenuProps {
  item: {
    playlistId: string;
    title: string;
    author: string;
    thumbnailUrl?: string;
    type: string;
  };
  x: number;
  y: number;
  onClose: () => void;
  onPlay?: () => void;
}

export function PlaylistContextMenu({ 
  item, 
  x, 
  y, 
  onClose,
  onPlay
}: PlaylistContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { toggleSave, isSaved } = useSavedPlaylists();
  const saved = isSaved(item.playlistId);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 10);
    
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  const adjustY = y > window.innerHeight - 200 ? y - 200 : y;
  const alignRight = x > window.innerWidth - 260;

  return (
    <MenuContainer ref={menuRef} $x={x} $y={adjustY} $alignRight={alignRight}>
      {onPlay && (
        <>
          <MenuItem onClick={() => { onPlay(); onClose(); }}>
            <Play size={18} /> Play {item.type}
          </MenuItem>
          <Divider />
        </>
      )}
      
      <MenuItem onClick={(e) => { 
        e.stopPropagation();
        toggleSave(item); 
        setTimeout(() => onClose(), 800);
      }}>
        <Heart size={18} fill={saved ? "#fff" : "none"} style={{ transition: 'all 0.3s ease', transform: saved ? 'scale(1.1)' : 'scale(1)' }} /> 
        {saved ? "Remove from library" : "Save to library"}
      </MenuItem>
      
      <Divider />
      
      <MenuItem onClick={async (e) => {
        e.stopPropagation();
        const url = window.location.origin + '/' + item.type + '/' + item.playlistId;
        if (navigator.share) {
          try {
            await navigator.share({ title: item.title, url });
            onClose();
          } catch (err) {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => onClose(), 1000);
          }
        } else {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => onClose(), 1000);
        }
      }}>
        {copied ? <Check size={18} color="#4ade80" /> : <Share2 size={18} />}
        {copied ? "Link Copied!" : "Share"}
      </MenuItem>
    </MenuContainer>
  );
}
