"use client";

import styled, { keyframes } from "styled-components";
import { Home, Compass, Library, Radio, Settings, Clock, Heart } from "lucide-react";

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const SidebarContainer = styled.nav`
  width: var(--sidebar-width, 240px);
  min-width: var(--sidebar-width, 240px);
  background: var(--bg);
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  transition: width 0.3s ease;

  @media (max-width: 800px) {
    display: none;
  }
`;

const LogoSection = styled.div`
  padding: 1.5rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: ${({ theme }) => theme.colors.cream};
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.5px;

  svg {
    color: var(--accent);
  }
`;

const NavSection = styled.div`
  padding: 0 0.75rem;
  flex: 1;
`;

const NavList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NavItem = styled.li<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.cream : theme.colors.muted};
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  font-size: 0.95rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;
  background: ${({ $active }) =>
    $active ? "rgba(var(--accent-rgb), 0.15)" : "transparent"};
  border-left: ${({ $active }) => 
    $active ? "3px solid var(--accent)" : "3px solid transparent"};

  &:hover {
    color: ${({ theme }) => theme.colors.cream};
    background: ${({ $active }) => 
      $active ? "rgba(var(--accent-rgb), 0.15)" : "rgba(255, 255, 255, 0.05)"};
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: ${({ $active }) => ($active ? "var(--accent)" : "inherit")};
  }
`;

const RoomBadge = styled.span`
  margin-left: auto;
  background: var(--accent);
  color: #000;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: var(--radius);
  animation: ${pulse} 2s infinite;
`;

const FooterText = styled.div`
  color: ${({ theme }) => theme.colors.mutedDim};
  font-size: 0.75rem;
  padding: 1.5rem;
  margin-top: auto;
`;

interface SidebarProps {
  activeView: string;
  setActiveView: (v: string) => void;
  roomCode?: string | null;
}

export function Sidebar({ activeView, setActiveView, roomCode }: SidebarProps) {
  return (
    <SidebarContainer>
      <LogoSection>
        <Logo>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
            <path d="M12 2 C12 2 14 8 18 12 C14 16 12 22 12 22" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
          Ventify
        </Logo>
      </LogoSection>

      <NavSection>
        <NavList>
          <NavItem
            $active={activeView === "HOME"}
            onClick={() => setActiveView("HOME")}
          >
            <Home />
            Home
          </NavItem>
          <NavItem
            $active={activeView === "EXPLORE"}
            onClick={() => setActiveView("EXPLORE")}
          >
            <Compass />
            Explore
          </NavItem>
          <NavItem
            $active={activeView === "LIBRARY"}
            onClick={() => setActiveView("LIBRARY")}
          >
            <Library />
            Library
          </NavItem>
          <NavItem
            $active={activeView === "RECENT"}
            onClick={() => setActiveView("RECENT")}
          >
            <Clock />
            Recent
          </NavItem>
          <NavItem
            $active={activeView === "PARTIES"}
            onClick={() => setActiveView("PARTIES")}
          >
            <Radio />
            Parties
            {roomCode && <RoomBadge>LIVE</RoomBadge>}
          </NavItem>
          <div style={{ height: '2rem' }} />
          <NavItem
            $active={activeView === "SETTINGS"}
            onClick={() => setActiveView("SETTINGS")}
          >
            <Settings />
            Settings
          </NavItem>
        </NavList>
      </NavSection>
    </SidebarContainer>
  );
}
