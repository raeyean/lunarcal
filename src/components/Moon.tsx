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
  const [t, setT] = useState(phase);
  const fromRef = useRef(phase);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animated) {
      setT(phase);
      fromRef.current = phase;
      return;
    }
    const start = Date.now();
    const from = fromRef.current;
    const to = phase;
    const tick = () => {
      const k = Math.min(1, (Date.now() - start) / 800);
      const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const next = from + (to - from) * eased;
      setT(next);
      fromRef.current = next;
      if (k < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, animated]);

  const litFrac = t < 0.5 ? t * 2 : (1 - t) * 2;
  const waxing = t < 0.5;
  const k = Math.cos(t * Math.PI * 2);
  const R = size / 2;
  const cx = R, cy = R;
  const ellipseRx = Math.abs(k) * R;

  const lightColor = theme === 'dark' ? '#f4ecd8' : '#fffdf6';
  const shadowColor = theme === 'dark' ? '#0c0e14' : '#1a1d2a';
  const rim = theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';

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
          <Stop offset="100%" stopColor={theme === 'dark' ? '#9a8e6a' : '#d8cda8'} stopOpacity={0.85} />
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
        <Circle cx={cx - R * 0.25} cy={cy - R * 0.2} r={R * 0.18} fill="#5a4f38" />
        <Circle cx={cx + R * 0.15} cy={cy - R * 0.35} r={R * 0.09} fill="#5a4f38" />
        <Circle cx={cx + R * 0.3} cy={cy + R * 0.15} r={R * 0.13} fill="#5a4f38" />
        <Circle cx={cx - R * 0.1} cy={cy + R * 0.3} r={R * 0.1} fill="#5a4f38" />
      </G>

      <Circle cx={cx} cy={cy} r={R - 0.5} fill="none" stroke={rim} strokeWidth={1} />
    </Svg>
  );
}
