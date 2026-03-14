export type ThemeColors = { [K in keyof typeof LightColors]: string };

export const LightColors = {
  primary: '#f04324',
  primaryLight: '#FEF0EC',
  foreground: '#000000',
  surface: '#F4F4F5',
  jiDark: '#27272A',
  badgeBg: '#E4E4E7',
  muted: '#A1A1AA',
  subtleText: '#71717A',
  white: '#FFFFFF',
  background: '#FFFFFF',
  bottomPanelBg: '#FAFAFA',
  divider: '#F4F4F5',
  whiteTranslucent80: 'rgba(255,255,255,0.8)',
  whiteTranslucent50: 'rgba(255,255,255,0.5)',
  whiteOverlay: 'rgba(255,255,255,0.1)',
  festival: '#D97706',
  festivalLight: '#FEF7EC',
} as const;

export const DarkColors: ThemeColors = {
  primary: '#FF6B4A',
  primaryLight: '#2A1A16',
  foreground: '#F0F0F0',
  surface: '#1E1E1E',
  jiDark: '#D4D4D8',
  badgeBg: '#333333',
  muted: '#808080',
  subtleText: '#A0A0A0',
  white: '#FFFFFF',
  background: '#121212',
  bottomPanelBg: '#1A1A1A',
  divider: '#2A2A2A',
  whiteTranslucent80: 'rgba(255,255,255,0.8)',
  whiteTranslucent50: 'rgba(255,255,255,0.5)',
  whiteOverlay: 'rgba(255,255,255,0.1)',
  festival: '#F59E0B',
  festivalLight: '#2A2210',
} as const;

// Keep backwards-compatible export for any remaining static references
export const Colors = LightColors;
