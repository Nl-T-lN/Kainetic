"use client";

import styled, { keyframes } from "styled-components";
import { useRouter } from "next/navigation";
import { useState } from "react";

// CSS Animations
const float = keyframes`
  0% { transform: translate(-50%, -50%) translateY(0px) rotate(0deg); }
  50% { transform: translate(-50%, -50%) translateY(-10px) rotate(2deg); }
  100% { transform: translate(-50%, -50%) translateY(0px) rotate(0deg); }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.2); }
  50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.6); }
  100% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.2); }
`;

const TitleContainer = styled.div`
  margin-bottom: 1rem;
  padding: 0;
  text-align: left;
  h2 {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0;
    color: white;
  }
  p {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0.25rem 0 0 0;
  }
`;

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  background: radial-gradient(circle at center, rgba(30, 30, 40, 0.6) 0%, rgba(10, 10, 15, 0) 70%);
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 768px) {
    height: 300px;
  }
`;

const Node = styled.button<{ $x: number; $y: number; $color: string; $size: number; $delay: number }>`
  position: absolute;
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background: ${({ $color }) => $color};
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  cursor: pointer;
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  box-shadow: 0 0 15px ${({ $color }) => $color};
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 10;
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.3);
    z-index: 20;
    border-color: white;
    animation: none; // Pause float on hover for stability
    box-shadow: 0 0 30px ${({ $color }) => $color};
    
    .node-label {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const NodeLabel = styled.span`
  position: absolute;
  bottom: -35px;
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 10px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  pointer-events: none;
`;

const SvgLines = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
`;

interface MapNode {
  id: string;
  label: string;
  x: number; // Percentage
  y: number; // Percentage
  color: string;
  size: number;
}

const NODES: MapNode[] = [
  { id: "pop", label: "Pop", x: 50, y: 50, color: "#ff4b4b", size: 60 },
  { id: "hiphop", label: "Hip-Hop", x: 25, y: 40, color: "#ff9900", size: 50 },
  { id: "rnb", label: "R&B", x: 35, y: 70, color: "#cc33ff", size: 45 },
  { id: "rock", label: "Rock", x: 75, y: 35, color: "#33ccff", size: 50 },
  { id: "indie", label: "Indie", x: 65, y: 65, color: "#33ff99", size: 45 },
  { id: "electronic", label: "Electronic", x: 40, y: 20, color: "#ff33cc", size: 40 },
  { id: "lofi", label: "Lo-Fi", x: 20, y: 60, color: "#6699ff", size: 35 },
  { id: "jazz", label: "Jazz", x: 80, y: 60, color: "#ffcc00", size: 35 },
  { id: "kpop", label: "K-Pop", x: 60, y: 25, color: "#ff66b2", size: 45 },
];

const CONNECTIONS = [
  ["pop", "hiphop"],
  ["pop", "rock"],
  ["pop", "electronic"],
  ["pop", "indie"],
  ["hiphop", "rnb"],
  ["hiphop", "lofi"],
  ["rnb", "jazz"],
  ["rock", "indie"],
  ["electronic", "kpop"],
  ["pop", "kpop"],
];

export default function MusicMap() {
  const router = useRouter();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const handleNodeClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div>
      <TitleContainer>
        <h2>The Music Constellation</h2>
        <p>Explore genres connected by their sonic roots</p>
      </TitleContainer>
      <MapContainer>
        {/* Background SVG connecting lines */}
        <SvgLines>
          {CONNECTIONS.map(([id1, id2]) => {
            const n1 = NODES.find(n => n.id === id1);
            const n2 = NODES.find(n => n.id === id2);
            if (!n1 || !n2) return null;
            
            const isHighlighted = hoveredNode === id1 || hoveredNode === id2;
            
            return (
              <line
                key={`${id1}-${id2}`}
                x1={`${n1.x}%`}
                y1={`${n1.y}%`}
                x2={`${n2.x}%`}
                y2={`${n2.y}%`}
                stroke={isHighlighted ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.1)"}
                strokeWidth={isHighlighted ? 3 : 1}
                style={{ transition: "all 0.3s ease" }}
              />
            );
          })}
        </SvgLines>

        {/* Nodes */}
        {NODES.map((node, i) => (
          <Node
            key={node.id}
            $x={node.x}
            $y={node.y}
            $color={node.color}
            $size={node.size}
            $delay={i * 0.2}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => handleNodeClick(node.label)}
            title={node.label}
          >
            <NodeLabel className="node-label">{node.label}</NodeLabel>
          </Node>
        ))}
      </MapContainer>
    </div>
  );
}
