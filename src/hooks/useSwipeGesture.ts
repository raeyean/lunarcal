import { useCallback, useMemo, useRef } from 'react';
import { Dimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Duration } from '../constants/motion';
import { useMotion } from './useMotion';

const SCREEN_WIDTH = Dimensions.get('window').width;
/** Commit when the pan travels further than this (px). */
const SWIPE_THRESHOLD = 50;
/** Commit when the release velocity is above this (px/s; was 0.3 px/ms). */
const VELOCITY_THRESHOLD = 300;
// Horizontal travel (px) before the pan *activates*. Kept at 24 so a small
// horizontal drift while tapping a cell or button can't hand the touch to the
// month/day swipe.
const CLAIM_THRESHOLD = 24;
// Vertical travel (px) at which the pan fails, so the daily ScrollView keeps
// vertical scrolling. Lower than CLAIM_THRESHOLD, so a gesture must be clearly
// horizontal (roughly 2:1) to become a swipe.
const FAIL_Y_THRESHOLD = 12;
const BASE_OFFSET = -SCREEN_WIDTH;

/** -1 = previous (swipe right / ‹), 1 = next (swipe left / ›). */
type SwipeDirection = -1 | 1;

interface SwipeConfig {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

/**
 * Three-panel (prev / current / next) horizontal swipe, driven by a Gesture
 * Handler pan and a Reanimated shared value (issue #21).
 *
 * Attach `gesture` with a `GestureDetector` around a Reanimated `Animated.View`
 * that is `3 * screenWidth` wide and uses `animatedStyle`. After a commit the
 * parent changes state, which changes the screen's `key` and remounts it with
 * a fresh shared value at the base offset — no manual reset, so no flicker.
 */
export function useSwipeGesture({ onSwipeLeft, onSwipeRight }: SwipeConfig) {
  const { spring, timing } = useMotion();
  const translateX = useSharedValue(BASE_OFFSET);
  const isAnimating = useSharedValue(false);
  const handlersRef = useRef({ onSwipeLeft, onSwipeRight });
  handlersRef.current = { onSwipeLeft, onSwipeRight };

  // Worklets can't call `timing()` (a JS function), so build the config here.
  const commitTiming = useMemo(() => timing(Duration.swipeCommit), [timing]);

  const finishCommit = useCallback((direction: SwipeDirection) => {
    if (direction === 1) {
      handlersRef.current.onSwipeLeft();
    } else {
      handlersRef.current.onSwipeRight();
    }
  }, []);

  // Runs on the UI thread from the pan, and on the JS thread from ‹ › buttons.
  const startCommit = useCallback(
    (direction: SwipeDirection) => {
      'worklet';
      if (isAnimating.value) return;
      isAnimating.set(true);
      const toValue = direction === 1 ? -2 * SCREEN_WIDTH : 0;
      translateX.set(withTiming(toValue, commitTiming, (finished?: boolean) => {
        'worklet';
        if (finished) {
          scheduleOnRN(finishCommit, direction);
        } else {
          isAnimating.value = false;
        }
      }));
    },
    [commitTiming, finishCommit, isAnimating, translateX],
  );

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-CLAIM_THRESHOLD, CLAIM_THRESHOLD])
        .failOffsetY([-FAIL_Y_THRESHOLD, FAIL_Y_THRESHOLD])
        .onUpdate(e => {
          if (isAnimating.value) return;
          translateX.set(BASE_OFFSET + e.translationX);
        })
        .onEnd((e, success) => {
          if (isAnimating.value) return;
          const dx = e.translationX;
          const vx = e.velocityX;
          if (success && (dx < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD)) {
            startCommit(1);
          } else if (success && (dx > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD)) {
            startCommit(-1);
          } else {
            translateX.set(withSpring(BASE_OFFSET, spring));
          }
        }),
    [isAnimating, translateX, startCommit, spring],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const triggerPrev = useCallback(() => startCommit(-1), [startCommit]);
  const triggerNext = useCallback(() => startCommit(1), [startCommit]);

  return {
    gesture,
    animatedStyle,
    triggerPrev,
    triggerNext,
    screenWidth: SCREEN_WIDTH,
  };
}
