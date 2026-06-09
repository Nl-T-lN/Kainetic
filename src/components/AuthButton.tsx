"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { User as UserIcon, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LoginModal } from "./LoginModal";
import type { User } from "@supabase/supabase-js";

const ButtonContainer = styled.div`
  position: relative;
`;

const StyledButton = styled.button<{ $isLoggedIn?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ $isLoggedIn }) => ($isLoggedIn ? "rgba(255, 255, 255, 0.05)" : "var(--accent)")};
  color: ${({ $isLoggedIn }) => ($isLoggedIn ? "#fff" : "#000")};
  border: ${({ $isLoggedIn }) => ($isLoggedIn ? "1px solid rgba(255, 255, 255, 0.1)" : "none")};
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    filter: ${({ $isLoggedIn }) => ($isLoggedIn ? "brightness(1.2)" : "brightness(1.1)")};
    transform: translateY(-1px);
  }

  img {
    width: 20px;
    height: 20px;
    border-radius: 50%;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.5rem;
  min-width: 150px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.2s ease-out;
  z-index: 100;
`;

const DropdownItem = styled.button`
  background: transparent;
  border: none;
  color: #fff;
  padding: 0.75rem 1rem;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ff4444;
  }
`;

export function AuthButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    // Reload to clear state
    window.location.reload();
  };

  return (
    <>
      <ButtonContainer>
        {user ? (
          <StyledButton $isLoggedIn onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" />
            ) : (
              <UserIcon size={18} />
            )}
            {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
          </StyledButton>
        ) : (
          <StyledButton onClick={() => setIsModalOpen(true)}>
            Sign In
          </StyledButton>
        )}

        {isDropdownOpen && user && (
          <Dropdown>
            <DropdownItem onClick={handleLogout}>
              <LogOut size={16} /> Sign Out
            </DropdownItem>
          </Dropdown>
        )}
      </ButtonContainer>

      {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
