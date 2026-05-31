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
    background: transparent;
    border: none;
    z-index: 999;
    padding-bottom: env(safe-area-inset-bottom);
    justify-content: space-around;
    align-items: center;

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 90px;
      background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,1) 100%);
      z-index: -1;
      pointer-events: none;
    }
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
  color: ${({ $active }) => ($active ? "#ffffff" : "#b3b3b3")};
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  svg {
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform: ${({ $active }) => ($active ? "scale(1.05)" : "scale(1)")};
    stroke: ${({ $active }) => ($active ? "#ffffff" : "#b3b3b3")};
  }

  &.fill-active svg {
    fill: ${({ $active }) => ($active ? "#ffffff" : "none")};
  }

  span {
    font-size: 10px;
    font-weight: ${({ $active }) => ($active ? 600 : 500)};
    letter-spacing: 0.2px;
    margin-top: 2px;
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
      <NavItem href="/" $active={pathname === "/"} className="fill-active">
        <Home size={26} strokeWidth={pathname === "/" ? 2.5 : 2} />
        <span>Home</span>
      </NavItem>
      <NavItem href="/explore" $active={pathname.startsWith("/explore")}>
        <Compass size={26} strokeWidth={pathname.startsWith("/explore") ? 2.5 : 2} />
        <span>Explore</span>
      </NavItem>
      <NavItem href="/library" $active={pathname.startsWith("/library")}>
        <Library size={26} strokeWidth={pathname.startsWith("/library") ? 2.5 : 2} />
        <span>Library</span>
      </NavItem>
      <NavItem href="/recent" $active={pathname.startsWith("/recent")}>
        <Clock size={26} strokeWidth={pathname.startsWith("/recent") ? 2.5 : 2} />
        <span>Recent</span>
      </NavItem>
      <NavItem href="/parties" $active={pathname.startsWith("/parties")}>
        <Radio size={26} strokeWidth={pathname.startsWith("/parties") ? 2.5 : 2} />
        <span>PlaySync</span>
      </NavItem>
    </NavBarContainer>
  );
}
