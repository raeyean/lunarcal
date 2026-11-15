import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Burst, Duration, EASE_OUT } from '../constants/motion';
import { useMotion } from '../hooks/useMotion';

const DOT_SIZE = 6;

interface SelectionBurstProps {
  colorA: string;
  colorB: string;
  onDone: () => void;
}

interface DotProps {
  angle: number;
  color: string;
  progress: SharedValue<number>;
}

function BurstDot({ angle, color, progress }: DotProps) {
  const rad = (angle * Math.PI) / 180;
  const style = useAnimatedStyle(() => {
    const r = Burst.radiusFrom + (Burst.radiusTo - Burst.radiusFrom) * progress.value;
    return {
      opacity: 1 - progress.value,
      transform: [
        { translateX: Math.cos(rad) * r },
        { translateY: Math.sin(rad) * r },
        { scale: 1 - 0.7 * progress.value },
      ],
    };
  });
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
}

/**
 * Radiating dots shown when the user selects a special day (節氣, festival,
 * 初一, 十五). Owns its shared value so idle cells carry none, and unmounts
 * itself through `onDone`. Renders nothing under reduced motion.
 */
export function SelectionBurst({ colorA, colorB, onDone }: SelectionBurstProps) {
  const { reduced, timing } = useMotion();
  const progress = useSharedValue(0);

  React.useEffect(() => {
    if (reduced) {
      onDone();
      return;
    }
    progress.value = withTiming(1, timing(Duration.burst, EASE_OUT), (finished) => {
      if (finished) runOnJS(onDone)();
    });
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (reduced) return null;

  return (
    <View style={styles.layer} pointerEvents="none">
      {Array.from({ length: Burst.dots }, (_, i) => (
        <BurstDot
          key={i}
          angle={i * (360 / Burst.dots)}
          color={i % 2 === 0 ? colorA : colorB}
          progress={progress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
