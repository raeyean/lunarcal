export type ThemeColors = { [K in keyof typeof LightColors]: string };

export const LightColors = {
  primary: '#f04324',
  primaryLight: '#FEF0EC',
  foreground: '#000000',
  surface: '#F4F4F5',
  jiDark: '#27272A',
  badgeBg: '#E4E4E7',
  muted: '#78788A',
  subtleText: '#5A5A63',
  white: '#FFFFFF',
  background: '#FFFFFF',
  bottomPanelBg: '#FAFAFA',
  divider: '#F4F4F5',
  whiteTranslucent80: 'rgba(255,255,255,0.8)',
  whiteTranslucent50: 'rgba(255,255,255,0.5)',
  whiteOverlay: 'rgba(255,255,255,0.1)',
  festival: '#B45C04',
  festivalLight: '#FEF7EC',
  jiShen: 'rgba(240,67,36,0.75)',
  success: '#16a34a',
} as const;

export const DarkColors: ThemeColors = {
  primary: '#FF6B4A',
  primaryLight: '#2A1A16',
  foreground: '#F0F0F0',
  surface: '#1E1E1E',
  jiDark: '#D4D4D8',
  badgeBg: '#333333',
  muted: '#9E9EA8',
  subtleText: '#B0B0B8',
  white: '#FFFFFF',
  background: '#121212',
  bottomPanelBg: '#1A1A1A',
  divider: '#2A2A2A',
  whiteTranslucent80: 'rgba(255,255,255,0.8)',
  whiteTranslucent50: 'rgba(255,255,255,0.5)',
  whiteOverlay: 'rgba(255,255,255,0.1)',
  festival: '#F59E0B',
  festivalLight: '#2A2210',
  jiShen: 'rgba(255,107,74,0.75)',
  success: '#4ade80',
} as const;

// Keep backwards-compatible export for any remaining static references
export const Colors = LightColors;
