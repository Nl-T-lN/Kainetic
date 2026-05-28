"use client";

import { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { Radio, Users, Copy, Check, LogOut, Headphones, Wifi, Send, Crown, Play, Search, Plus, ShieldAlert, Key } from "lucide-react";
import type { UsePartyRoomReturn } from "@/hooks/usePartyRoom";
import type { Track } from "@/types/music";

const DEFAULT_ART = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23333'/%3E%3Ctext x='50' y='54' font-family='sans-serif' font-size='40' fill='%23666' text-anchor='middle' dominant-baseline='middle'%3E%E2%99%AA%3C/text%3E%3C/svg%3E";

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

const ActiveRoomGrid = styled.div`
  max-width: 1400px;
  margin: 2rem auto;
  width: 100%;
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  gap: 1.5rem;
  
  @media (max-width: 1100px) {
    grid-template-columns: 250px 1fr;
  }
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

/* ── Active Room Panels ── */
const Panel = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  height: 600px;
  overflow: hidden;
  
  &.glass {
    background: rgba(var(--bg-rgb), var(--glass-opacity));
    backdrop-filter: blur(12px);
  }
`;

const PanelHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

/* ── Panel 1: Members ── */
const MemberList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.03);
  position: relative;
  
  .info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #fff;
    font-size: 0.8rem;
  }
  
  .name {
    font-size: 0.95rem;
    font-weight: 500;
  }
`;

const AdminMenu = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  background: #2a2a2a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  z-index: 10;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  
  button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    text-align: left;
    font-size: 0.85rem;
    
    &:hover {
      background: rgba(255,255,255,0.1);
    }
  }
`;

/* ── Panel 2: Queue ── */
const QueueContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const SearchContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const SearchInputBox = styled.div`
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  padding: 0.5rem 1rem;
  gap: 0.5rem;
  
  input {
    flex: 1;
    background: transparent;
    border: none;
    color: white;
    outline: none;
    font-size: 0.9rem;
  }
`;

const ToggleContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--muted);
  cursor: pointer;
  
  input {
    accent-color: var(--accent);
  }
`;

const SearchResults = styled.div`
  position: absolute;
  bottom: 80px;
  left: 1rem;
  right: 1rem;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 20;
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  img {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
  }
  
  .details {
    flex: 1;
    overflow: hidden;
  }
  
  .title {
    font-size: 0.9rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .artist {
    font-size: 0.75rem;
    color: var(--muted);
  }
`;

const QueueItem = styled.div<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: ${({ $isActive }) => $isActive ? 'rgba(var(--accent-rgb), 0.1)' : 'transparent'};
  border-left: 3px solid ${({ $isActive }) => $isActive ? 'var(--accent)' : 'transparent'};
  
  img {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    object-fit: cover;
  }
  
  .details {
    flex: 1;
    overflow: hidden;
  }
  
  .title {
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${({ $isActive }) => $isActive ? 'var(--accent)' : '#fff'};
  }
  
  .artist {
    font-size: 0.8rem;
    color: var(--muted);
  }
`;

/* ── Panel 3: Chat ── */
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

/* ── Modal ── */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const ModalCard = styled.div`
  background: #1a1a1a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  text-align: center;
`;

interface ListenAlongProps {
  party: UsePartyRoomReturn;
}

export function ListenAlong({ party }: ListenAlongProps) {
  const [joinCode, setJoinCode] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempProfileName, setTempProfileName] = useState("");
  const [pendingAction, setPendingAction] = useState<"host" | "join" | null>(null);
  const [pendingJoinCode, setPendingJoinCode] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [party.messages]);

  const handleCopy = () => {
    if (party.roomCode) {
      navigator.clipboard.writeText(party.roomCode).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      party.sendMessage(chatInput.trim());
      setChatInput("");
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=song`);
      const data = await res.json();
      setSearchResults(data.tracks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddTrack = (track: Track) => {
    party.requestAddTrack(track, "ADD_TRACK");
    setSearchQuery("");
    setSearchResults([]);
  };

  const executePendingAction = async (newProfile?: any) => {
    if (pendingAction === "host") {
      party.createRoom(newProfile);
    } else if (pendingAction === "join") {
      const success = await party.joinRoom(pendingJoinCode, newProfile);
      if (!success) alert("Room not found or empty.");
    }
    setPendingAction(null);
  };

  const initiateHost = () => {
    if (!party.profile) {
      setPendingAction("host");
      setShowProfileModal(true);
    } else {
      party.createRoom();
    }
  };

  const initiateJoin = (code: string) => {
    if (!party.profile) {
      setPendingAction("join");
      setPendingJoinCode(code);
      setShowProfileModal(true);
    } else {
      party.joinRoom(code).then(success => {
        if (!success) alert("Room not found or empty.");
      });
    }
  };

  const saveProfileAndContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempProfileName.trim()) {
      const p = party.saveProfile(tempProfileName.trim());
      setShowProfileModal(false);
      executePendingAction(p);
    }
  };

  // ── Active Room View ──
  if (party.roomCode) {
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
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '2px', fontWeight: 'bold' }}>
              {party.roomCode}
            </div>
            <CopyButton $copied={copied} onClick={handleCopy} style={{ margin: 0 }}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </CopyButton>
            <SecondaryBtn onClick={party.leaveRoom} style={{ color: '#ff6b6b', borderColor: 'rgba(255,100,100,0.3)' }}>
              Leave
            </SecondaryBtn>
          </div>
        </HeaderRow>
        
        <ActiveRoomGrid>
          {/* PANEL 1: MEMBERS */}
          <Panel className="glass">
            <PanelHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} /> Members ({party.members.length})
              </div>
            </PanelHeader>
            <MemberList>
              {party.members.map(m => (
                <MemberItem key={m.clientId}>
                  <div className="info">
                    <div className="avatar" style={{ background: m.profile?.avatarId || '#333' }}>
                      {m.profile?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="name">
                      {m.profile?.name || 'Unknown'} 
                      {m.clientId === party.profile?.name && " (You)"}
                    </div>
                  </div>
                  {m.isHost && <Crown size={16} color="#f9ca24" />}
                  
                  {party.isHost && !m.isHost && (
                    <div style={{ position: 'relative' }}>
                      <button 
                        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.5 }}
                        onClick={() => setActiveMenuId(activeMenuId === m.clientId ? null : m.clientId)}
                      >
                        ⋮
                      </button>
                      {activeMenuId === m.clientId && (
                        <AdminMenu>
                          <button onClick={() => { party.kickUser(m.clientId); setActiveMenuId(null); }} style={{ color: '#ff6b6b' }}>
                            <LogOut size={14} /> Kick User
                          </button>
                        </AdminMenu>
                      )}
                    </div>
                  )}
                </MemberItem>
              ))}
            </MemberList>
          </Panel>

          {/* PANEL 2: QUEUE */}
          <Panel className="glass" style={{ position: 'relative' }}>
            <PanelHeader>
              <div>Master Queue</div>
              {party.isHost && (
                <ToggleContainer>
                  Allow Guests to Add
                  <input 
                    type="checkbox" 
                    checked={party.permissions.allowGuestAdditions}
                    onChange={(e) => party.toggleGuestAdditions(e.target.checked)}
                  />
                </ToggleContainer>
              )}
            </PanelHeader>
            <QueueContainer>
              {party.partyQueue.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '2rem' }}>Queue is empty.</div>
              ) : (
                party.partyQueue.map((track, i) => (
                  <QueueItem key={`${track.videoId}-${i}`} $isActive={i === party.partyQueueIndex}>
                    <img 
                      src={track.thumbnailUrl || DEFAULT_ART} 
                      onError={(e) => { 
                        if (e.currentTarget.src !== DEFAULT_ART) e.currentTarget.src = DEFAULT_ART; 
                      }}
                      alt={track.title} 
                    />
                    <div className="details">
                      <div className="title">{track.title}</div>
                      <div className="artist">{track.artist}</div>
                    </div>
                    {i === party.partyQueueIndex && <Play size={16} color="var(--accent)" />}
                  </QueueItem>
                ))
              )}
            </QueueContainer>
            
            <SearchContainer>
              <SearchInputBox>
                <Search size={16} color="var(--muted)" />
                <input 
                  placeholder={
                    party.isHost || party.permissions.allowGuestAdditions 
                      ? "Search to add a song..." 
                      : "Host has locked the queue"
                  }
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  disabled={!party.isHost && !party.permissions.allowGuestAdditions}
                />
              </SearchInputBox>
              
              {searchQuery && searchResults.length > 0 && (
                <SearchResults>
                  {searchResults.map(track => (
                    <ResultItem key={track.videoId} onClick={() => handleAddTrack(track)}>
                      <img 
                        src={track.thumbnailUrl || DEFAULT_ART} 
                        onError={(e) => { 
                          if (e.currentTarget.src !== DEFAULT_ART) e.currentTarget.src = DEFAULT_ART; 
                        }}
                        alt="" 
                      />
                      <div className="details">
                        <div className="title">{track.title}</div>
                        <div className="artist">{track.artist}</div>
                      </div>
                      <Plus size={16} color="var(--muted)" />
                    </ResultItem>
                  ))}
                </SearchResults>
              )}
            </SearchContainer>
          </Panel>

          {/* PANEL 3: CHAT */}
          <Panel className="glass">
            <PanelHeader>Party Chat</PanelHeader>
            <MessageList>
              {party.messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '2rem', fontSize: '0.9rem' }}>
                  No messages yet. Say hi!
                </div>
              ) : (
                party.messages.map(msg => {
                  const isSelf = msg.senderName === party.profile?.name;
                  return (
                    <MessageBubble key={msg.id} $isSelf={isSelf}>
                      {!isSelf && <div className="sender">{msg.senderName}</div>}
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
          </Panel>
        </ActiveRoomGrid>
      </ViewContainer>
    );
  }

  // ── Idle View ──
  return (
    <ViewContainer>
      {showProfileModal && (
        <ModalOverlay>
          <ModalCard>
            <h3 style={{ marginBottom: '1rem' }}>Welcome to Parties</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
              Enter a display name so your friends know who you are.
            </p>
            <form onSubmit={saveProfileAndContinue}>
              <CodeInput 
                style={{ width: '100%', maxWidth: 'none', letterSpacing: 'normal', fontSize: '1.2rem', marginBottom: '1rem', textTransform: 'none' }}
                placeholder="Your Name"
                value={tempProfileName}
                onChange={e => setTempProfileName(e.target.value)}
                autoFocus
              />
              <ButtonRow>
                <SecondaryBtn type="button" onClick={() => setShowProfileModal(false)}>Cancel</SecondaryBtn>
                <PrimaryBtn type="submit" disabled={!tempProfileName.trim()}>Continue</PrimaryBtn>
              </ButtonRow>
            </form>
          </ModalCard>
        </ModalOverlay>
      )}

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
        <ActionCard onClick={initiateHost}>
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

      {party.profile && !showJoin && (
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)' }}>
          Logged in as <strong style={{ color: '#fff' }}>{party.profile.name}</strong> ·{" "}
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => {
              setTempProfileName(party.profile?.name || "");
              setShowProfileModal(true);
            }}
          >
            Edit Profile
          </button>
        </div>
      )}

      {showJoin && (
        <JoinSection>
          <JoinCard className="glass">
            <JoinTitle>Enter Room Code</JoinTitle>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (joinCode.length === 4) initiateJoin(joinCode);
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

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.cream};
  }
`;
