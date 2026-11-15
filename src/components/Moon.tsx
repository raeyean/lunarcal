import React, { useEffect, useId, useRef, useState } from 'react';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { LightColors, DarkColors } from '../constants/colors';
import { Duration, EASE_OUT } from '../constants/motion';
import { useMotion } from '../hooks/useMotion';

/**
 * Phase last shown by an `animated` (hero) moon. The daily screen remounts per
 * day, so a fresh Moon reads this as its tween start and slides to the new
 * phase. Only `animated` moons touch it, so off-screen prev/next panels (static)
 * and calendar mini moons never disturb it.
 */
let lastHeroPhase: number | null = null;
const easeOut = EASE_OUT.factory();

interface MoonProps {
  /** 0 = 朔 new, 0.25 = 上弦 first quarter, 0.5 = 望 full, 0.75 = 下弦 last quarter. */
  phase?: number;
  size?: number;
  animated?: boolean;
  theme?: 'light' | 'dark';
}

/**
 * Realistic gradient moon — mirrors `lunarcal/project/moon.jsx` from the design
 * handoff. Renders a circle masked by an elliptical terminator that scales with
 * phase and flips between waxing/waning halves.
 */
export function Moon({ phase = 0.5, size = 120, animated = false, theme = 'light' }: MoonProps) {
  const { reduced } = useMotion();
  const [t, setT] = useState(() =>
    animated && !reduced && lastHeroPhase != null ? lastHeroPhase : phase,
  );
  const fromRef = useRef(t);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animated || reduced) {
      setT(phase);
      fromRef.current = phase;
      if (animated) lastHeroPhase = phase;
      return;
    }
    const start = Date.now();
    const from = fromRef.current;
    const to = phase;
    const tick = () => {
      const k = Math.min(1, (Date.now() - start) / Duration.moonPhase);
      const next = from + (to - from) * easeOut(k);
      setT(next);
      fromRef.current = next;
      lastHeroPhase = next;
      if (k < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, animated, reduced]);

  const litFrac = t < 0.5 ? t * 2 : (1 - t) * 2;
  const waxing = t < 0.5;
  const k = Math.cos(t * Math.PI * 2);
  const R = size / 2;
  const cx = R, cy = R;
  const ellipseRx = Math.abs(k) * R;

  const palette = theme === 'dark' ? DarkColors : LightColors;
  const lightColor = palette.moonSurface;
  const shadowColor = palette.moonShadow;
  const rim = palette.moonRim;

  // Stable id suffix so multiple moons can coexist without colliding gradients.
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');

  let litPath = '';
  if (litFrac < 0.005) {
    litPath = '';
  } else if (litFrac > 0.995) {
    litPath = `M ${cx - R} ${cy} a ${R} ${R} 0 1 0 ${R * 2} 0 a ${R} ${R} 0 1 0 ${-R * 2} 0 Z`;
  } else {
    const sx = cx, sy = cy - R;
    const ex = cx, ey = cy + R;
    const semiSweep = waxing ? 0 : 1;
    const ellipseSweep = waxing ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0);
    litPath = `M ${sx} ${sy} A ${R} ${R} 0 0 ${semiSweep} ${ex} ${ey} A ${ellipseRx} ${R} 0 0 ${ellipseSweep} ${sx} ${sy} Z`;
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id={`shadow-${id}`} cx="50%" cy="50%" r="55%">
          <Stop offset="0%" stopColor={shadowColor} stopOpacity={theme === 'dark' ? 0.85 : 0.95} />
          <Stop offset="100%" stopColor={shadowColor} stopOpacity={1} />
        </RadialGradient>
        <RadialGradient
          id={`light-${id}`}
          cx={waxing ? '38%' : '62%'}
          cy="42%"
          r="65%"
        >
          <Stop offset="0%" stopColor={lightColor} stopOpacity={1} />
          <Stop offset="55%" stopColor={lightColor} stopOpacity={0.94} />
          <Stop offset="100%" stopColor={palette.moonShadowSecondary} stopOpacity={0.85} />
        </RadialGradient>
        <RadialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="80%" stopColor={lightColor} stopOpacity={0} />
          <Stop offset="100%" stopColor={lightColor} stopOpacity={0.35} />
        </RadialGradient>
        <ClipPath id={`disc-${id}`}>
          <Circle cx={cx} cy={cy} r={R} />
        </ClipPath>
      </Defs>

      {litFrac > 0.05 && (
        <Circle
          cx={cx}
          cy={cy}
          r={R * 1.18}
          fill={`url(#glow-${id})`}
          opacity={0.6 * litFrac}
        />
      )}

      <Circle cx={cx} cy={cy} r={R} fill={`url(#shadow-${id})`} />
      {litPath ? <Path d={litPath} fill={`url(#light-${id})`} /> : null}

      <G opacity={0.18 * litFrac} clipPath={`url(#disc-${id})`}>
        <Circle cx={cx - R * 0.25} cy={cy - R * 0.2} r={R * 0.18} fill={palette.moonCrater} />
        <Circle cx={cx + R * 0.15} cy={cy - R * 0.35} r={R * 0.09} fill={palette.moonCrater} />
        <Circle cx={cx + R * 0.3} cy={cy + R * 0.15} r={R * 0.13} fill={palette.moonCrater} />
        <Circle cx={cx - R * 0.1} cy={cy + R * 0.3} r={R * 0.1} fill={palette.moonCrater} />
      </G>

      <Circle cx={cx} cy={cy} r={R - 0.5} fill="none" stroke={rim} strokeWidth={1} />
    </Svg>
  );
}
