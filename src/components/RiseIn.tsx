import React, { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Offset } from '../constants/motion';
import { useMotion } from '../hooks/useMotion';

interface RiseInProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Delay before the rise starts, in ms. */
  delay?: number;
  /** Rise duration in ms (ease-out). */
  duration: number;
  /** Starting translateY in px. */
  offset?: number;
  /** When false, renders statically (used for off-screen swipe panels). */
  animate?: boolean;
}

/**
 * Fades in and rises `offset` px to rest on mount (issue #23). Remount it (new
 * `key`) to replay. Instant when the OS Reduce Motion setting is on.
 */
export function RiseIn({
  children,
  style,
  delay = 0,
  duration,
  offset = Offset.panelY,
  animate = true,
}: RiseInProps) {
  const { timing } = useMotion();
  const progress = useSharedValue(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) return;
    progress.value = withDelay(delay, withTiming(1, timing(duration)));
    // Mount-only: replay is by remounting with a new key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * offset }],
  }));

  if (!animate) return <View style={style}>{children}</View>;
  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
