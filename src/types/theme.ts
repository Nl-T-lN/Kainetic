export interface ThemeSettings {
  accentColor: string;
  bgColor: string;
  fontFamily: 'Inter' | 'Roboto' | 'Outfit' | 'Poppins' | 'JetBrains Mono' | 'System';
  fontSize: number; // 80 to 130 (%)
  radius: number; // 0 to 24 (px)
  opacity: number; // 0 to 100 (%)
  glassmorphism: boolean;
  animations: boolean;
  compactMode: boolean;
  sidebarWidth: number; // 200 to 300 (px)
  playerStyle: 'standard' | 'expanded' | 'minimal';
  progressBarStyle: 'thin' | 'thick' | 'waveform';
  dynamicAccent: boolean;
  albumBackground: boolean;
}

export type ThemePreset = 'system' | 'black' | 'dark' | 'ocean' | 'purple' | 'forest' | 'mocha' | 'custom';
