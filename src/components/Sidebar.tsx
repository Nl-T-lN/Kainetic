"use client";

import styled, { keyframes } from "styled-components";
import { Home, Compass, Library, Radio, Settings, Clock, Menu, Disc3 } from "lucide-react";
import { useState } from "react";

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const SidebarContainer = styled.nav`
  width: 230px;
  min-width: 230px;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  transition: width 0.3s cubic-bezier(0.2, 0, 0, 1), min-width 0.3s cubic-bezier(0.2, 0, 0, 1);
  overflow: hidden;

  &.collapsed {
    width: 80px;
    min-width: 80px;
  }

  @media (max-width: 800px) {
    display: none;
  }
`;

const HeaderSection = styled.div`
  padding: 1.25rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
`;

const MenuButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.cream};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.cream};
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-left: 1rem;
  cursor: pointer;
  user-select: none;
  
  span {
    opacity: 1;
    max-width: 150px;
    margin-left: 0.6rem;
    visibility: visible;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
    white-space: nowrap;
  }

  .collapsed & span {
    opacity: 0;
    max-width: 0px;
    margin-left: 0;
    visibility: hidden;
  }

  svg {
    color: var(--accent);
    flex-shrink: 0;
  }
`;

const NavSection = styled.div`
  padding: 0 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  text-decoration: none;
  align-items: center;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.cream : theme.colors.muted};
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  font-size: 0.95rem;
  padding: 0.75rem 17px;
  justify-content: flex-start;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  background: ${({ $active }) =>
    $active ? "rgba(255, 255, 255, 0.1)" : "transparent"};
  border-left: none;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.cream};
    background: ${({ $active }) => 
      $active ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.05)"};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    color: inherit;
  }
  
  span {
    opacity: 1;
    max-width: 150px;
    margin-left: 1rem;
    visibility: visible;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  }

  .collapsed & span {
    opacity: 0;
    max-width: 0px;
    margin-left: 0;
    visibility: hidden;
  }
`;

const RoomBadge = styled.div`
  margin-left: auto;
  background: var(--accent);
  color: #000;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: var(--radius);
  animation: ${pulse} 2s infinite;
  
  opacity: 1;
  max-width: 50px;
  visibility: visible;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);

  .collapsed & {
    opacity: 0;
    max-width: 0px;
    visibility: hidden;
  }
`;

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  roomCode?: string | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ roomCode, isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  
  return (
    <SidebarContainer className={isCollapsed ? "collapsed" : ""}>
      <HeaderSection>
        <MenuButton onClick={onToggleCollapse}>
          <Menu size={24} />
        </MenuButton>
        <Link href="/">
          <Logo style={{ cursor: 'pointer' }}>
            <Disc3 size={28} strokeWidth={2.5} />
            <span>Ventify</span>
          </Logo>
        </Link>
      </HeaderSection>

      <NavSection>
        <NavList>
          <NavItem href="/" $active={pathname === "/"}>
            <Home />
            <span>Home</span>
          </NavItem>
          <NavItem href="/explore" $active={pathname.startsWith("/explore")}>
            <Compass />
            <span>Explore</span>
          </NavItem>
          <NavItem href="/library" $active={pathname.startsWith("/library")}>
            <Library />
            <span>Library</span>
          </NavItem>
          <NavItem href="/recent" $active={pathname.startsWith("/recent")}>
            <Clock />
            <span>Recent</span>
          </NavItem>
          <NavItem href="/parties" $active={pathname.startsWith("/parties")}>
            <Radio />
            <span>Play Sync</span>
            {roomCode && <RoomBadge>LIVE</RoomBadge>}
          </NavItem>
          <NavItem href="/settings" $active={pathname.startsWith("/settings")}>
            <Settings />
            <span>Settings</span>
          </NavItem>
        </NavList>
      </NavSection>
    </SidebarContainer>
  );
}
