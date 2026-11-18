import React, { useCallback, useEffect, useMemo } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Offset } from '../constants/motion';
import { useMotion } from '../hooks/useMotion';
import { usePanelEntrance } from '../hooks/usePanelEntrance';

interface RiseInProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Delay before the rise starts, in ms. */
  delay?: number;
  /** Rise duration in ms (ease-out). */
  duration: number;
  /** Starting translateY in px. */
  offset?: number;
  /** Play on mount. False for off-screen swipe panels, which mount static. */
  animate?: boolean;
}

/**
 * Fades in and rises `offset` px to rest (issue #23). Plays on mount when
 * `animate`, and again when a swipe commit starts toward the `SwipePanel` it
 * sits in, so the rise runs during the slide (#29). Remount it (new `key`) to
 * replay outside a swipe panel. Instant when the OS Reduce Motion setting is on.
 */
export function RiseIn({
  children,
  style,
  delay = 0,
  duration,
  offset = Offset.panelY,
  animate = true,
}: RiseInProps) {
  const { reduced, timing } = useMotion();
  const progress = useSharedValue(animate ? 0 : 1);
  const config = useMemo(() => timing(duration), [timing, duration]);

  useEffect(() => {
    if (!animate) return;
    progress.set(withDelay(delay, withTiming(1, config)));
    // Mount-only: later plays come from the swipe commit, or a remount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = useCallback(() => {
    'worklet';
    if (reduced) return;
    progress.set(0);
    progress.set(withDelay(delay, withTiming(1, config)));
  }, [reduced, delay, config, progress]);
  usePanelEntrance(play);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: (1 - progress.get()) * offset }],
  }));

  // Always an Animated.View: `animate` flips when a panel becomes the centre,
  // and switching element types would remount the children.
  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
