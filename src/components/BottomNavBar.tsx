"use client";

import styled from "styled-components";
import { Home, Compass, Library, Radio, Clock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavBarContainer = styled.nav`
  display: none;
  
  @media (max-width: 800px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 65px;
    background: color-mix(in srgb, var(--bg) 90%, transparent);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    z-index: 999;
    padding-bottom: env(safe-area-inset-bottom);
    justify-content: space-around;
    align-items: center;
  }
`;

const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 70px;
  height: 100%;
  color: ${({ $active }) => ($active ? "var(--accent)" : "rgba(255, 255, 255, 0.5)")};
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  svg {
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform: ${({ $active }) => ($active ? "scale(1.15)" : "scale(1)")};
  }

  span {
    font-size: 0.65rem;
    font-weight: ${({ $active }) => ($active ? 700 : 500)};
    letter-spacing: 0.3px;
  }

  &:active {
    svg {
      transform: scale(0.85);
    }
  }
`;

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <NavBarContainer>
      <NavItem href="/" $active={pathname === "/"}>
        <Home size={22} strokeWidth={pathname === "/" ? 3 : 2.5} />
        <span>Home</span>
      </NavItem>
      <NavItem href="/explore" $active={pathname.startsWith("/explore")}>
        <Compass size={22} strokeWidth={pathname.startsWith("/explore") ? 3 : 2.5} />
        <span>Explore</span>
      </NavItem>
      <NavItem href="/library" $active={pathname.startsWith("/library")}>
        <Library size={22} strokeWidth={pathname.startsWith("/library") ? 3 : 2.5} />
        <span>Library</span>
      </NavItem>
      <NavItem href="/recent" $active={pathname.startsWith("/recent")}>
        <Clock size={22} strokeWidth={pathname.startsWith("/recent") ? 3 : 2.5} />
        <span>Recent</span>
      </NavItem>
      <NavItem href="/parties" $active={pathname.startsWith("/parties")}>
        <Radio size={22} strokeWidth={pathname.startsWith("/parties") ? 3 : 2.5} />
        <span>PlaySync</span>
      </NavItem>
    </NavBarContainer>
  );
}
