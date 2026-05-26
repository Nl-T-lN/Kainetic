"use client";

import { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { Radio, Users, Copy, Check, LogOut, Headphones, Wifi, Send } from "lucide-react";
import type { ChatMessage } from "@/hooks/usePartyRoom";

const livePulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ViewContainer = styled.div`
  width: 100%;
  animation: ${fadeSlideIn} 0.4s ease-out;
`;

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  width: 100%;
`;

const ActiveRoomContainer = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 1rem;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;

  svg {
    color: var(--accent);
  }
`;

const PageSubtitle = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.muted};
  margin: 0;
  margin-left: 1rem;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled.button`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius);
  padding: 2rem 1.5rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.cream};
  text-align: center;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }
`;

const CardIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
`;

const CardTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
`;

const CardDesc = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.4;
`;

/* ── Join Form ── */
const JoinSection = styled.div`
  animation: ${fadeSlideIn} 0.3s ease-out;
  margin-top: 1.5rem;
`;

const JoinCard = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius);
  padding: 2rem;
  text-align: center;
`;

const JoinTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
`;

const CodeInput = styled.input`
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  color: ${({ theme }) => theme.colors.cream};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 1.75rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5rem;
  padding: 0.85rem 1rem;
  width: 100%;
  max-width: 240px;
  outline: none;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus {
    border-color: var(--accent);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.15);
    letter-spacing: 0.3rem;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
  justify-content: center;
`;

const PrimaryBtn = styled.button`
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 99px;
  padding: 0.6rem 1.75rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: scale(1.03);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const SecondaryBtn = styled.button`
  background: rgba(255, 255, 255, 0.08);
  color: ${({ theme }) => theme.colors.cream};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  padding: 0.6rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

/* ── Active Room ── */
const RoomCard = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius);
  padding: 2rem;
  text-align: center;
  height: fit-content;
  
  &.glass {
    background: rgba(var(--bg-rgb), var(--glass-opacity));
    backdrop-filter: blur(12px);
  }
`;

const RoomStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(var(--accent-rgb), 0.12);
  border: 1px solid rgba(var(--accent-rgb), 0.2);
  border-radius: 99px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LiveDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: ${livePulse} 1.5s ease-in-out infinite;
`;

const RoomCodeDisplay = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: 0.5rem;
  color: ${({ theme }) => theme.colors.cream};
  margin: 1rem 0;
`;

const RoomLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
`;

const ListenerCount = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
  margin-bottom: 1.5rem;

  svg {
    color: var(--accent);
  }
`;

const CopyButton = styled.button<{ $copied: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: ${({ $copied }) =>
    $copied ? "rgba(var(--accent-rgb), 0.15)" : "rgba(255, 255, 255, 0.06)"};
  border: 1px solid ${({ $copied }) =>
    $copied ? "rgba(var(--accent-rgb), 0.3)" : "rgba(255, 255, 255, 0.1)"};
  border-radius: 99px;
  padding: 0.35rem 0.85rem;
  font-size: 0.78rem;
  color: ${({ $copied, theme }) =>
    $copied ? "var(--accent)" : theme.colors.muted};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  margin-bottom: 1.25rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.cream};
  }
`;

const LeaveBtn = styled.button`
  background: rgba(255, 100, 100, 0.08);
  border: 1px solid rgba(255, 100, 100, 0.15);
  border-radius: 99px;
  padding: 0.55rem 1.5rem;
  color: #ff6b6b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 auto;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: rgba(255, 100, 100, 0.15);
  }
`;

/* ── Chat UI ── */
const ChatCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  height: 500px;
  
  &.glass {
    background: rgba(var(--bg-rgb), var(--glass-opacity));
    backdrop-filter: blur(12px);
  }
`;

const ChatHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-weight: 600;
  font-size: 1.1rem;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MessageBubble = styled.div<{ $isSelf: boolean }>`
  background: ${({ $isSelf }) => 
    $isSelf ? "var(--accent)" : "rgba(255, 255, 255, 0.08)"};
  color: ${({ $isSelf }) => 
    $isSelf ? "#000" : "inherit"};
  padding: 0.5rem 0.85rem;
  border-radius: var(--radius);
  max-width: 85%;
  align-self: ${({ $isSelf }) => ($isSelf ? "flex-end" : "flex-start")};
  font-size: 0.9rem;
  border-bottom-right-radius: ${({ $isSelf }) => ($isSelf ? "4px" : "var(--radius)")};
  border-bottom-left-radius: ${({ $isSelf }) => (!$isSelf ? "4px" : "var(--radius)")};
  
  .sender {
    font-size: 0.7rem;
    font-weight: 700;
    margin-bottom: 2px;
    opacity: 0.8;
  }
`;

const ChatInputForm = styled.form`
  display: flex;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  gap: 0.5rem;
`;

const ChatInput = styled.input`
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  padding: 0.5rem 1rem;
  color: white;
  outline: none;
  font-size: 0.9rem;
  
  &:focus {
    border-color: var(--accent);
  }
`;

const SendButton = styled.button`
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* ── Props ── */
interface ListenAlongProps {
  isHost: boolean;
  roomCode: string | null;
  listenerCount: number;
  messages?: ChatMessage[];
  onCreate: () => void;
  onJoin: (code: string) => void;
  onLeave: () => void;
  onSendMessage?: (text: string) => void;
}

export function ListenAlong({
  isHost,
  roomCode,
  listenerCount,
  messages = [],
  onCreate,
  onJoin,
  onLeave,
  onSendMessage,
}: ListenAlongProps) {
  const [joinCode, setJoinCode] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCopy = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && onSendMessage) {
      onSendMessage(chatInput.trim());
      setChatInput("");
    }
  };

  // ── Active Room View ──
  if (roomCode) {
    return (
      <ViewContainer>
        <HeaderRow>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <PageTitle>
              <Radio size={28} />
              Parties
            </PageTitle>
            <PageSubtitle>Listen together in real-time</PageSubtitle>
          </div>
        </HeaderRow>
        
        <ActiveRoomContainer>
          <RoomCard className="glass">
          <RoomStatus>
            <LiveIndicator>
              <LiveDot />
              {isHost ? "Hosting" : "Connected"}
            </LiveIndicator>
          </RoomStatus>

          <RoomLabel>Room Code</RoomLabel>
          <RoomCodeDisplay>{roomCode}</RoomCodeDisplay>

          <CopyButton $copied={copied} onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Code"}
          </CopyButton>

          <ListenerCount>
            <Users size={18} />
            {listenerCount} {listenerCount === 1 ? "listener" : "listeners"}{" "}
            connected
          </ListenerCount>

          {isHost ? (
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--muted)",
                marginBottom: "1.25rem",
                lineHeight: 1.5,
              }}
            >
              Share this code with friends. They&apos;ll hear exactly what
              you&apos;re playing, perfectly in sync.
            </div>
          ) : (
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--muted)",
                marginBottom: "1.25rem",
                lineHeight: 1.5,
              }}
            >
              You&apos;re synced with the host. Playback is controlled by them.
            </div>
          )}

          <LeaveBtn onClick={onLeave}>
            <LogOut size={16} />
            Leave Room
          </LeaveBtn>
        </RoomCard>

        <ChatCard className="glass">
          <ChatHeader>Party Chat</ChatHeader>
          <MessageList>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '2rem', fontSize: '0.9rem' }}>
                No messages yet. Say hi!
              </div>
            ) : (
              messages.map(msg => {
                const isSelf = (isHost && msg.sender === "Host") || (!isHost && msg.sender === "Listener"); // Basic check, better with actual user IDs
                // In a real app we'd use a UUID for the current user to accurately determine $isSelf.
                // For now, we'll assume any message matching our role is self (if we're host and it says host).
                return (
                  <MessageBubble key={msg.id} $isSelf={isSelf}>
                    {!isSelf && <div className="sender">{msg.sender}</div>}
                    {msg.text}
                  </MessageBubble>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </MessageList>
          <ChatInputForm onSubmit={handleSendChat}>
            <ChatInput 
              placeholder="Send a message..." 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
            />
            <SendButton type="submit" disabled={!chatInput.trim()}>
              <Send size={16} />
            </SendButton>
          </ChatInputForm>
        </ChatCard>
      </ActiveRoomContainer>
      </ViewContainer>
    );
  }

  // ── Idle View ──
  return (
    <ViewContainer>
      <HeaderRow>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <PageTitle>
            <Radio size={28} />
            Parties
          </PageTitle>
          <PageSubtitle>
            Create a room and share the code, or join a friend&apos;s room to
            listen together in perfect sync.
          </PageSubtitle>
        </div>
      </HeaderRow>
      
      <Container>
      <CardsGrid>
        <ActionCard onClick={onCreate}>
          <CardIcon $color="rgba(var(--accent-rgb), 0.2)">
            <Wifi size={26} color="var(--accent)" />
          </CardIcon>
          <CardTitle>Host a Room</CardTitle>
          <CardDesc>
            Start broadcasting. Your friends join with a 4-letter code.
          </CardDesc>
        </ActionCard>

        <ActionCard onClick={() => setShowJoin(true)}>
          <CardIcon $color="rgba(255, 255, 255, 0.1)">
            <Headphones size={26} color="#fff" />
          </CardIcon>
          <CardTitle>Join a Room</CardTitle>
          <CardDesc>
            Enter a room code to listen along with someone.
          </CardDesc>
        </ActionCard>
      </CardsGrid>

      {showJoin && (
        <JoinSection>
          <JoinCard className="glass">
            <JoinTitle>Enter Room Code</JoinTitle>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (joinCode.length === 4) onJoin(joinCode);
              }}
            >
              <CodeInput
                type="text"
                maxLength={4}
                placeholder="····"
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                }
                autoFocus
              />
              <ButtonRow>
                <SecondaryBtn type="button" onClick={() => setShowJoin(false)}>
                  Cancel
                </SecondaryBtn>
                <PrimaryBtn type="submit" disabled={joinCode.length !== 4}>
                  Connect
                </PrimaryBtn>
              </ButtonRow>
            </form>
          </JoinCard>
        </JoinSection>
      )}
    </Container>
    </ViewContainer>
  );
}
