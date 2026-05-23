"use client";

import styled from "styled-components";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { useState } from "react";

const SettingsContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  color: ${({ theme }) => theme.colors.cream};
`;

const Header = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 2rem;
`;

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  background: transparent;
  border: none;
  color: ${({ $active, theme }) => ($active ? theme.colors.accent : "rgba(255, 255, 255, 0.6)")};
  font-size: 1.1rem;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  cursor: pointer;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -1rem;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${({ $active, theme }) => ($active ? theme.colors.accent : "transparent")};
    border-radius: 3px 3px 0 0;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const SettingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  .title {
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .desc {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ColorInput = styled.input`
  -webkit-appearance: none;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  &::-webkit-color-swatch {
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }
`;

const RangeInput = styled.input`
  width: 150px;
  accent-color: var(--accent);
`;

const Select = styled.select`
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.2);
    transition: 0.3s;
    border-radius: 24px;
  }

  span:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }

  input:checked + span {
    background-color: var(--accent);
  }

  input:checked + span:before {
    transform: translateX(20px);
  }
`;

const PresetsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const PresetPill = styled.button<{ $color: string }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
  }
`;

const PRESETS = [
  { label: 'Coral', color: '#FF6B9D', bg: '#0A0A0A' },
  { label: 'Ocean', color: '#06b6d4', bg: '#0c1821' },
  { label: 'Purple', color: '#a855f7', bg: '#0f0514' },
  { label: 'Forest', color: '#22c55e', bg: '#0a1409' },
  { label: 'Mocha', color: '#89b4fa', bg: '#1e1e2e' },
];

export function SettingsView() {
  const { settings, updateSetting, resetToDefaults, isLoaded } = useThemeSettings();
  const [activeTab, setActiveTab] = useState<'appearance' | 'interface' | 'player'>('appearance');

  if (!isLoaded) return null;

  return (
    <SettingsContainer>
      <Header>Settings</Header>
      
      <Tabs>
        <Tab $active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')}>Appearance</Tab>
        <Tab $active={activeTab === 'interface'} onClick={() => setActiveTab('interface')}>Interface</Tab>
        <Tab $active={activeTab === 'player'} onClick={() => setActiveTab('player')}>Player</Tab>
      </Tabs>

      {activeTab === 'appearance' && (
        <Section>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Theme Presets</h3>
            <PresetsGrid>
              {PRESETS.map((preset) => (
                <PresetPill 
                  key={preset.label} 
                  $color={preset.color}
                  onClick={() => {
                    updateSetting('accentColor', preset.color);
                    updateSetting('bgColor', preset.bg);
                  }}
                >
                  <div className="dot" />
                  {preset.label}
                </PresetPill>
              ))}
            </PresetsGrid>
          </div>

          <SettingRow>
            <SettingInfo>
              <div className="title">Accent Color</div>
              <div className="desc">Primary color for active states and highlights</div>
            </SettingInfo>
            <ControlGroup>
              <ColorInput 
                type="color" 
                value={settings.accentColor} 
                onChange={(e) => updateSetting('accentColor', e.target.value)} 
              />
            </ControlGroup>
          </SettingRow>

          <SettingRow>
            <SettingInfo>
              <div className="title">Background Color</div>
              <div className="desc">Base color for the application</div>
            </SettingInfo>
            <ControlGroup>
              <ColorInput 
                type="color" 
                value={settings.bgColor} 
                onChange={(e) => updateSetting('bgColor', e.target.value)} 
              />
            </ControlGroup>
          </SettingRow>

          <SettingRow>
            <SettingInfo>
              <div className="title">Glassmorphism Opacity</div>
              <div className="desc">Adjust the transparency of panels</div>
            </SettingInfo>
            <ControlGroup>
              <RangeInput 
                type="range" 
                min="0" max="100" 
                value={settings.opacity} 
                onChange={(e) => updateSetting('opacity', Number(e.target.value))} 
              />
              <span style={{ width: '40px', textAlign: 'right' }}>{settings.opacity}%</span>
            </ControlGroup>
          </SettingRow>
        </Section>
      )}

      {activeTab === 'interface' && (
        <Section>
          <SettingRow>
            <SettingInfo>
              <div className="title">Font Family</div>
              <div className="desc">Select the primary typeface</div>
            </SettingInfo>
            <ControlGroup>
              <Select 
                value={settings.fontFamily} 
                onChange={(e) => updateSetting('fontFamily', e.target.value as any)}
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Outfit">Outfit</option>
                <option value="Poppins">Poppins</option>
                <option value="JetBrains Mono">JetBrains Mono</option>
                <option value="System">System Default</option>
              </Select>
            </ControlGroup>
          </SettingRow>

          <SettingRow>
            <SettingInfo>
              <div className="title">Corner Roundness</div>
              <div className="desc">Border radius of cards and panels</div>
            </SettingInfo>
            <ControlGroup>
              <RangeInput 
                type="range" 
                min="0" max="24" 
                value={settings.radius} 
                onChange={(e) => updateSetting('radius', Number(e.target.value))} 
              />
              <span style={{ width: '40px', textAlign: 'right' }}>{settings.radius}px</span>
            </ControlGroup>
          </SettingRow>
          
          <SettingRow>
            <SettingInfo>
              <div className="title">Sidebar Width</div>
              <div className="desc">Width of the left navigation menu</div>
            </SettingInfo>
            <ControlGroup>
              <RangeInput 
                type="range" 
                min="180" max="320" 
                value={settings.sidebarWidth} 
                onChange={(e) => updateSetting('sidebarWidth', Number(e.target.value))} 
              />
              <span style={{ width: '40px', textAlign: 'right' }}>{settings.sidebarWidth}px</span>
            </ControlGroup>
          </SettingRow>
        </Section>
      )}

      {activeTab === 'player' && (
        <Section>
          <SettingRow>
            <SettingInfo>
              <div className="title">Player Style</div>
              <div className="desc">Layout of the bottom player bar</div>
            </SettingInfo>
            <ControlGroup>
              <Select 
                value={settings.playerStyle} 
                onChange={(e) => updateSetting('playerStyle', e.target.value as any)}
              >
                <option value="standard">Standard</option>
                <option value="expanded">Expanded</option>
                <option value="minimal">Minimal</option>
              </Select>
            </ControlGroup>
          </SettingRow>

          <SettingRow>
            <SettingInfo>
              <div className="title">Animations</div>
              <div className="desc">Enable micro-animations and transitions</div>
            </SettingInfo>
            <ControlGroup>
              <Toggle>
                <input 
                  type="checkbox" 
                  checked={settings.animations} 
                  onChange={(e) => updateSetting('animations', e.target.checked)} 
                />
                <span />
              </Toggle>
            </ControlGroup>
          </SettingRow>
        </Section>
      )}

      <button 
        onClick={resetToDefaults}
        style={{ 
          marginTop: '3rem', 
          background: 'rgba(255,255,255,0.05)', 
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '0.75rem 1.5rem',
          borderRadius: 'var(--radius)',
          color: 'var(--accent)',
          fontWeight: 600
        }}
      >
        Reset to Defaults
      </button>
    </SettingsContainer>
  );
}
