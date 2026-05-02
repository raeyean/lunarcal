export type ThemeColors = { [K in keyof typeof LightColors]: string };

// Editorial palette — warm rice paper, vermilion, ink wash, antique gold
// Mirrors PALETTE.light/dark from the LunarCal design handoff.
export const LightColors = {
  // brand / accent
  primary: '#a02617',          // vermilion (宜)
  primaryLight: '#f4e6e0',     // vermilion soft
  primarySoft: 'rgba(160,38,23,0.12)',   // pressed/selected wash
  ji: '#3a4a5a',               // ink wash (忌)
  jiSoft: '#e2e6ec',
  accent: '#8a6f3a',           // antique gold

  // surfaces
  background: '#f6f3ec',       // warm rice paper
  surface: '#fffdf6',
  surfaceElevated: '#ffffff',  // cards/sheets above surface
  bottomPanelBg: '#fffdf6',
  chip: '#f0ead8',
  overlay: 'rgba(26,24,22,0.45)',  // modal scrim — theme-aware

  // ink scale
  foreground: '#1a1816',
  jiDark: '#1a1816',
  subtleText: '#5a544c',
  muted: '#9a9389',
  mutedSoft: 'rgba(154,147,137,0.18)',
  inkSoft: '#5a544c',
  inkMute: '#9a9389',

  // semantic state
  success: '#3d6b4a',          // jade
  danger: '#a02617',           // vermilion (reused for errors)
  warning: '#b8860b',          // dark goldenrod
  info: '#3a4a5a',             // ink wash
  disabled: 'rgba(26,24,22,0.35)',

  // text on coloured surfaces
  onPrimary: '#fffdf6',
  onAccent: '#fffdf6',
  onDanger: '#fffdf6',

  // structure
  divider: '#dcd4c4',
  line: '#dcd4c4',
  lineSoft: '#e8e1d2',
  badgeBg: '#f0ead8',
  white: '#FFFFFF',

  // legacy aliases (still referenced by older components)
  whiteTranslucent80: 'rgba(255,253,246,0.85)',
  whiteTranslucent50: 'rgba(255,253,246,0.5)',
  whiteOverlay: 'rgba(160,38,23,0.1)',
  festival: '#a02617',
  festivalLight: '#f4e6e0',
  jiShen: 'rgba(160,38,23,0.75)',

  // deity color tokens (kind → dot)
  deityFo: '#c9a86a',           // 佛诞 — antique gold
  deityPusa: '#a02617',         // 菩萨诞 — vermilion
  deityShen: '#3d6b4a',         // 神诞 — deep jade
  deityDao: '#6b3d6b',          // 道诞 — plum
} as const;

export const DarkColors: ThemeColors = {
  primary: '#d4634d',
  primaryLight: '#3a1f18',
  primarySoft: 'rgba(212,99,77,0.18)',
  ji: '#7a8fa6',
  jiSoft: '#1a2128',
  accent: '#c9a86a',

  background: '#0e0d0b',
  surface: '#16140f',
  surfaceElevated: '#1f1c16',
  bottomPanelBg: '#16140f',
  chip: '#1f1b14',
  overlay: 'rgba(0,0,0,0.6)',

  foreground: '#f0e9d9',
  jiDark: '#f0e9d9',
  subtleText: '#a89f8a',
  muted: '#6a5f4f',
  mutedSoft: 'rgba(168,159,138,0.18)',
  inkSoft: '#a89f8a',
  inkMute: '#6a5f4f',

  success: '#86c79a',
  danger: '#d4634d',
  warning: '#d4a84d',
  info: '#7a8fa6',
  disabled: 'rgba(240,233,217,0.35)',

  onPrimary: '#0e0d0b',
  onAccent: '#0e0d0b',
  onDanger: '#0e0d0b',

  divider: '#2c2820',
  line: '#2c2820',
  lineSoft: '#1f1c16',
  badgeBg: '#1f1b14',
  white: '#FFFFFF',

  whiteTranslucent80: 'rgba(20,18,14,0.85)',
  whiteTranslucent50: 'rgba(20,18,14,0.5)',
  whiteOverlay: 'rgba(255,255,255,0.06)',
  festival: '#d4634d',
  festivalLight: '#3a1f18',
  jiShen: 'rgba(212,99,77,0.75)',

  deityFo: '#c9a86a',
  deityPusa: '#d4634d',
  deityShen: '#86c79a',
  deityDao: '#b48ec0',
} as const;

// Keep backwards-compatible export for any remaining static references
export const Colors = LightColors;

// Deity-kind helper
export type DeityKind = 'fo' | 'pusa' | 'shen' | 'dao';
export const DEITY_LABEL: Record<DeityKind, string> = {
  fo: '佛诞',
  pusa: '菩萨',
  shen: '神诞',
  dao: '道',
};
export function deityColor(kind: DeityKind, colors: ThemeColors): string {
  switch (kind) {
    case 'fo':   return colors.deityFo;
    case 'pusa': return colors.deityPusa;
    case 'shen': return colors.deityShen;
    case 'dao':  return colors.deityDao;
  }
}
