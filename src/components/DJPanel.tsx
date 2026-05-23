"use client";

import styled, { css, keyframes } from "styled-components";

// ============================================================
// 📚 LEARN: DJPanel.tsx 
// ============================================================
// AI DJ Display panel. Modern glassmorphic design.
// ============================================================

const PanelContainer = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.25rem;
  margin-top: 1rem;
  position: relative;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const StatusIndicator = styled.div<{ $isLoading: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ $isLoading, theme }) =>
    $isLoading ? theme.colors.accent : "#2ECC71"};
  box-shadow: 0 0 8px
    ${({ $isLoading, theme }) =>
      $isLoading ? theme.colors.accent : "#2ECC71"};
  ${({ $isLoading }) =>
    $isLoading &&
    css`
      animation: ${blink} 0.5s infinite;
    `}
`;

const Screen = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.85rem;
  min-height: 60px;
`;

const Text = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
`;

export function DJPanel({
  text,
  isLoading,
}: {
  text: string;
  isLoading: boolean;
}) {
  return (
    <PanelContainer>
      <PanelHeader>
        <Title>Auto-DJ</Title>
        <StatusIndicator
          $isLoading={isLoading}
          title={isLoading ? "Processing" : "Ready"}
        />
      </PanelHeader>
      <Screen>
        <Text>{text}</Text>
      </Screen>
    </PanelContainer>
  );
}
