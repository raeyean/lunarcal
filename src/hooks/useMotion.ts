import { useCallback, useMemo } from 'react';
import {
  ReduceMotion,
  useReducedMotion,
  type WithTimingConfig,
} from 'react-native-reanimated';
import { EASE_OUT, SPRING } from '../constants/motion';

/**
 * Reduced-motion-aware motion helpers (issue #18 / #19). Follows the OS setting.
 *
 * - `reduced`: true when the OS Reduce Motion setting is on. Skip decorative
 *   motion (burst, moon float, swipe hint) entirely when true.
 * - `dur(ms)`: `ms`, or 0 when reduced.
 * - `spring`: config for `withSpring`, with `reduceMotion: ReduceMotion.System`.
 * - `timing(ms, easing?)`: config for `withTiming` (default `EASE_OUT`), with
 *   `reduceMotion: ReduceMotion.System`.
 *
 * @example
 * const { reduced, spring, timing } = useMotion();
 * y.value = withSpring(0, spring);
 * opacity.value = withTiming(1, timing(Duration.tabIn));
 * if (!reduced) startBurst();
 */
export function useMotion() {
  const reduced = useReducedMotion();

  const dur = useCallback((ms: number) => (reduced ? 0 : ms), [reduced]);

  const spring = useMemo(
    () => ({ ...SPRING, reduceMotion: ReduceMotion.System }),
    [],
  );

  const timing = useCallback(
    (ms: number, easing: WithTimingConfig['easing'] = EASE_OUT) => ({
      duration: ms,
      easing,
      reduceMotion: ReduceMotion.System,
    }),
    [],
  );

  return { reduced, dur, spring, timing };
}
