"use client";

import { useState } from "react";
import styled from "styled-components";

const PanelContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.background};
  padding: 1rem;
  margin-top: 1rem;
`;

const Header = styled.h3`
  font-family: ${({ theme }) => theme.fonts.pixel};
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.7rem;
  margin: 0 0 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button<{ $active?: boolean }>`
  background: ${({ $active, theme }) => ($active ? theme.colors.gold : theme.colors.deepWell)};
  color: ${({ $active, theme }) => ($active ? theme.colors.background : theme.colors.cream)};
  border: 1px solid ${({ theme }) => theme.colors.gold};
  font-family: ${({ theme }) => theme.fonts.pixel};
  font-size: 0.6rem;
  padding: 0.5rem;
  cursor: pointer;
  flex: 1;

  &:hover {
    background: ${({ $active, theme }) => ($active ? theme.colors.gold : "rgba(247, 189, 72, 0.1)")};
  }
`;

const CodeDisplay = styled.div`
  background: #000;
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.pixel};
  font-size: 1.2rem;
  text-align: center;
  padding: 0.75rem;
  margin-top: 1rem;
  letter-spacing: 0.2rem;
  border: 1px solid ${({ theme }) => theme.colors.surface};
`;

const Input = styled.input`
  background: #000;
  color: ${({ theme }) => theme.colors.cream};
  border: 1px solid ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.pixel};
  font-size: 1rem;
  padding: 0.5rem;
  width: 100%;
  text-align: center;
  text-transform: uppercase;
  margin-top: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.gold};
  }
`;

interface PartyPanelProps {
  isHost: boolean;
  roomCode: string | null;
  listenerCount: number;
  onCreate: () => void;
  onJoin: (code: string) => void;
  onLeave: () => void;
}

export function PartyPanel({ isHost, roomCode, listenerCount, onCreate, onJoin, onLeave }: PartyPanelProps) {
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"IDLE" | "JOIN">("IDLE");

  if (roomCode) {
    return (
      <PanelContainer>
        <Header>
          {isHost ? "TRANSMITTING" : "RECEIVING"}
          <span style={{ color: "#fff" }}>LISTENERS: {listenerCount}</span>
        </Header>
        <CodeDisplay>{roomCode}</CodeDisplay>
        <Button style={{ marginTop: "1rem", width: "100%" }} onClick={onLeave}>
          DISCONNECT
        </Button>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      <Header>SYNC MODULE</Header>
      {mode === "IDLE" ? (
        <ButtonGroup>
          <Button onClick={onCreate}>HOST ROOM</Button>
          <Button onClick={() => setMode("JOIN")}>JOIN ROOM</Button>
        </ButtonGroup>
      ) : (
        <>
          <ButtonGroup>
            <Button $active onClick={() => setMode("JOIN")}>JOIN SYNC</Button>
            <Button onClick={() => setMode("IDLE")}>CANCEL</Button>
          </ButtonGroup>
          <form onSubmit={(e) => { e.preventDefault(); onJoin(joinCode); }}>
            <Input 
              type="text" 
              maxLength={4} 
              placeholder="CODE" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <Button style={{ marginTop: "0.5rem", width: "100%" }} type="submit" disabled={joinCode.length !== 4}>
              CONNECT
            </Button>
          </form>
        </>
      )}
    </PanelContainer>
  );
}
