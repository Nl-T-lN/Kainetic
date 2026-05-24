"use client";

import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Search, Sparkles, Wand2 } from "lucide-react";

const HubContainer = styled.div`
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const SearchBarWrapper = styled.div<{ $focused: boolean }>`
  display: flex;
  align-items: center;
  background: ${({ $focused }) =>
    $focused ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.07)"};
  border: 1px solid ${({ $focused }) =>
    $focused ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.08)"};
  border-radius: var(--radius);
  padding: 0.65rem 1.25rem;
  width: 100%;
  transition: all ${({ theme }) => theme.transitions.normal};
  box-shadow: ${({ $focused }) =>
    $focused
      ? "0 0 0 1px rgba(29, 185, 84, 0.15), 0 4px 20px rgba(0,0,0,0.3)"
      : "0 2px 12px rgba(0,0,0,0.15)"};

  svg.search-icon {
    transition: transform ${({ theme }) => theme.transitions.normal};
    transform: ${({ $focused }) => ($focused ? "scale(1.1)" : "scale(1)")};
  }
`;

const Input = styled.input`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.cream};
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: 0.95rem;
  flex: 1;
  outline: none;
  margin-left: 0.65rem;

  &::placeholder {
    color: ${({ theme }) => theme.colors.mutedDim};
  }
`;

const LoadingBar = styled.div`
  height: 2px;
  border-radius: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    ${({ theme }) => theme.colors.accent} 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  margin: 0 1rem;
`;


type SearchMode = "STANDARD" | "VIBE" | "MAGIC";

interface SearchHubProps {
  onSearch: (q: string) => void;
  onMoodSearch: (vibe: string) => void;
  onPlaylistGenerate: (vibe: string) => void;
  onCategoryChange?: (category: string) => void;
  isLoading: boolean;
}

export function SearchHub({
  onSearch,
  onMoodSearch,
  onPlaylistGenerate,
  onCategoryChange,
  isLoading,
}: SearchHubProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("STANDARD");
  const [category, setCategory] = useState("All");
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (mode === "STANDARD") {
      onSearch(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      if (mode === "VIBE") {
        onMoodSearch(query);
      } else if (mode === "MAGIC") {
        onPlaylistGenerate(query);
      }
    }
  };

  const getPlaceholder = () => {
    if (isLoading) return "Processing...";
    if (mode === "STANDARD") return "What do you want to play?";
    if (mode === "VIBE") return "Describe a vibe (e.g. late night driving)";
    if (mode === "MAGIC") return "Describe your perfect mixtape...";
    return "";
  };

  const getIcon = () => {
    if (mode === "STANDARD")
      return <Search size={20} color="#b3b3b3" className="search-icon" />;
    if (mode === "VIBE")
      return <Sparkles size={20} color="#1DB954" className="search-icon" />;
    return <Wand2 size={20} color="#f7bd48" className="search-icon" />;
  };

  return (
    <HubContainer>
      <SearchBarWrapper $focused={isFocused}>
        {getIcon()}
        <Input
          type="text"
          placeholder={getPlaceholder()}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          spellCheck={false}
        />
      </SearchBarWrapper>
      {isLoading && <LoadingBar />}
    </HubContainer>
  );
}
