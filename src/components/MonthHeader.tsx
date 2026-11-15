import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type EntryExitAnimationFunction,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { IconButton } from './IconButton';
import { withOpacity } from '../constants/colorUtils';
import { Duration, Offset } from '../constants/motion';
import { useMotion } from '../hooks/useMotion';

interface MonthHeaderProps {
  titleCn: string;
  onPrev: () => void;
  onNext: () => void;
}

const SWIPE_HINT_KEY = 'calendarSwipeHintShown';
/** Swipe-hint chip timings (ms): fade in, hold, fade out. */
const HINT_FADE_IN = 400;
const HINT_HOLD = 2500;
const HINT_FADE_OUT = 350;

export function MonthHeader({ titleCn, onPrev, onNext }: MonthHeaderProps) {
  const { colors } = useTheme();
  const { reduced, timing } = useMotion();
  const [hintVisible, setHintVisible] = useState(false);
  const hintOpacity = useSharedValue(0);

  // Title rises and fades in whenever it mounts with a new `titleCn` (#21).
  const titleEntering = useMemo(() => {
    const cfg = timing(Duration.panelRise);
    const entering: EntryExitAnimationFunction = () => {
      'worklet';
      return {
        initialValues: {
          opacity: 0,
          transform: [{ translateY: Offset.panelY }],
        },
        animations: {
          opacity: withTiming(1, cfg),
          transform: [{ translateY: withTiming(0, cfg) }],
        },
      };
    };
    return entering;
  }, [timing]);

  useEffect(() => {
    // The hint is decorative: skip it entirely under reduced motion.
    if (reduced) return;
    let cancelled = false;
    (async () => {
      try {
        const seen = await AsyncStorage.getItem(SWIPE_HINT_KEY);
        if (seen || cancelled) return;
        setHintVisible(true);
        hintOpacity.set(withSequence(
          withTiming(1, timing(HINT_FADE_IN)),
          withDelay(
            HINT_HOLD,
            withTiming(0, timing(HINT_FADE_OUT), (finished?: boolean) => {
              'worklet';
              if (finished) scheduleOnRN(setHintVisible, false);
            }),
          ),
        ));
        await AsyncStorage.setItem(SWIPE_HINT_KEY, '1');
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
      cancelAnimation(hintOpacity);
    };
  }, [reduced, hintOpacity, timing]);

  const hintStyle = useAnimatedStyle(() => ({ opacity: hintOpacity.value }));

  return (
    <View style={styles.container}>
      <IconButton
        onPress={onPrev}
        accessibilityLabel="上一月"
        variant="ghost"
      >
        <Text style={[styles.arrow, { color: colors.foreground }]}>‹</Text>
      </IconButton>
      <View style={styles.titleGroup}>
        <Animated.View key={titleCn} entering={titleEntering}>
          <Text style={[styles.titleCn, { color: colors.foreground }]}>{titleCn}</Text>
        </Animated.View>
      </View>
      <IconButton
        onPress={onNext}
        accessibilityLabel="下一月"
        variant="ghost"
      >
        <Text style={[styles.arrow, { color: colors.foreground }]}>›</Text>
      </IconButton>
      {hintVisible && !reduced ? (
        <View pointerEvents="none" style={styles.hintWrap}>
          <Animated.View
            style={[
              styles.hintChip,
              { backgroundColor: withOpacity(colors.muted, 0.13) },
              hintStyle,
            ]}
          >
            <Text style={[styles.hintText, { color: colors.subtleText }]}>
              ← 滑動切換月份 →
            </Text>
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  titleGroup: {
    alignItems: 'center',
    gap: 2,
  },
  titleCn: {
    ...Typography.screenHeader,
  },
  arrow: {
    fontSize: 28,
    fontWeight: '300',
  },
  hintWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintChip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    ...Typography.badgeText,
  },
});
