"use client";

import styled, { keyframes } from "styled-components";
import { Home, Compass, Library, Radio, Settings, Clock, Menu } from "lucide-react";
import { useState } from "react";

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const SidebarContainer = styled.nav<{ $collapsed: boolean }>`
  width: ${({ $collapsed }) => ($collapsed ? "80px" : "230px")};
  min-width: ${({ $collapsed }) => ($collapsed ? "80px" : "230px")};
  background: var(--bg);
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  transition: width 0.3s cubic-bezier(0.2, 0, 0, 1), min-width 0.3s cubic-bezier(0.2, 0, 0, 1);
  overflow: hidden;

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

const Logo = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.cream};
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-left: 1rem;
  
  span {
    opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
    max-width: ${({ $collapsed }) => ($collapsed ? "0px" : "150px")};
    margin-left: ${({ $collapsed }) => ($collapsed ? "0" : "0.6rem")};
    visibility: ${({ $collapsed }) => ($collapsed ? "hidden" : "visible")};
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
    white-space: nowrap;
  }

  svg {
    color: var(--accent);
    flex-shrink: 0;
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

const NavItem = styled.li<{ $active?: boolean; $collapsed: boolean }>`
  display: flex;
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
    opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
    max-width: ${({ $collapsed }) => ($collapsed ? "0px" : "150px")};
    margin-left: ${({ $collapsed }) => ($collapsed ? "0" : "1rem")};
    visibility: ${({ $collapsed }) => ($collapsed ? "hidden" : "visible")};
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  }
`;

const RoomBadge = styled.div<{ $collapsed: boolean }>`
  margin-left: auto;
  background: var(--accent);
  color: #000;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: var(--radius);
  animation: ${pulse} 2s infinite;
  
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  max-width: ${({ $collapsed }) => ($collapsed ? "0px" : "50px")};
  visibility: ${({ $collapsed }) => ($collapsed ? "hidden" : "visible")};
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
`;

interface SidebarProps {
  activeView: string;
  setActiveView: (v: string) => void;
  roomCode?: string | null;
}

export function Sidebar({ activeView, setActiveView, roomCode }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContainer $collapsed={isCollapsed}>
      <HeaderSection>
        <MenuButton onClick={() => setIsCollapsed(!isCollapsed)}>
          <Menu size={24} />
        </MenuButton>
        {!isCollapsed && (
          <Logo $collapsed={isCollapsed}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
              <path d="M12 2 C12 2 14 8 18 12 C14 16 12 22 12 22" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            <span>Ventify</span>
          </Logo>
        )}
      </HeaderSection>

      <NavSection>
        <NavList>
          <NavItem
            $active={activeView === "HOME"}
            $collapsed={isCollapsed}
            onClick={() => setActiveView("HOME")}
          >
            <Home />
            <span>Home</span>
          </NavItem>
          <NavItem
            $active={activeView === "EXPLORE"}
            $collapsed={isCollapsed}
            onClick={() => setActiveView("EXPLORE")}
          >
            <Compass />
            <span>Explore</span>
          </NavItem>
          <NavItem
            $active={activeView === "LIBRARY"}
            $collapsed={isCollapsed}
            onClick={() => setActiveView("LIBRARY")}
          >
            <Library />
            <span>Library</span>
          </NavItem>
          <NavItem
            $active={activeView === "RECENT"}
            $collapsed={isCollapsed}
            onClick={() => setActiveView("RECENT")}
          >
            <Clock />
            <span>Recent</span>
          </NavItem>
          <NavItem
            $active={activeView === "PARTIES"}
            $collapsed={isCollapsed}
            onClick={() => setActiveView("PARTIES")}
          >
            <Radio />
            <span>Parties</span>
            {roomCode && <RoomBadge $collapsed={isCollapsed}>LIVE</RoomBadge>}
          </NavItem>
          <div style={{ height: '2rem' }} />
          <NavItem
            $active={activeView === "SETTINGS"}
            $collapsed={isCollapsed}
            onClick={() => setActiveView("SETTINGS")}
          >
            <Settings />
            <span>Settings</span>
          </NavItem>
        </NavList>
      </NavSection>
    </SidebarContainer>
  );
}
