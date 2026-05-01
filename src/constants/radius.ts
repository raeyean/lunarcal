export const Radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export type RadiusKey = keyof typeof Radius;
