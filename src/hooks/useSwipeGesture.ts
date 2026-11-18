import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Dimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Duration } from '../constants/motion';
import { useMotion } from './useMotion';
import type { SwipeCommit, SwipeDirection } from './usePanelEntrance';

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

interface SwipeConfig {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  /**
   * Slot of the centre panel (its offset, in panels, from the date the screen
   * mounted with). Changes by exactly ±1 after each commit.
   */
  slot: number;
}

/**
 * Three-panel (prev / current / next) horizontal swipe, driven by a Gesture
 * Handler pan and a Reanimated shared value (issue #21).
 *
 * Attach `gesture` with a `GestureDetector`, and render each panel in a
 * `SwipePanel` with `x`, `commit` and its own slot. Panels are placed at
 * `slot * screenWidth + x`, and `x` rests at `-slot * screenWidth`, so the
 * centre panel sits at 0.
 *
 * #29: a commit slides `x` to the neighbour's resting offset and, at the same
 * moment, writes `commit` so the incoming panel plays its entrance during the
 * slide. When the parent then moves the centre date, the incoming panel keeps
 * its slot (and its mounted instance), so `x` is already correct and there is
 * nothing to reset — no flicker, no replay. The gesture stays blocked until
 * React has rendered the new centre (the `slot` effect below).
 */
export function useSwipeGesture({ onSwipeLeft, onSwipeRight, slot }: SwipeConfig) {
  const { spring, timing } = useMotion();
  const x = useSharedValue(-slot * SCREEN_WIDTH);
  const centerSlot = useSharedValue(slot);
  const isAnimating = useSharedValue(false);
  const commit = useSharedValue<SwipeCommit>({ seq: 0, slot, dir: 1 });
  const handlersRef = useRef({ onSwipeLeft, onSwipeRight });
  useEffect(() => {
    handlersRef.current = { onSwipeLeft, onSwipeRight };
  }, [onSwipeLeft, onSwipeRight]);

  // The parent has rendered the new centre: its neighbours are mounted, so
  // accept the next swipe.
  useEffect(() => {
    centerSlot.set(slot);
    isAnimating.set(false);
  }, [slot, centerSlot, isAnimating]);

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
      if (isAnimating.get()) return;
      isAnimating.set(true);
      const target = centerSlot.get() + direction;
      commit.set({ seq: commit.get().seq + 1, slot: target, dir: direction });
      x.set(withTiming(-target * SCREEN_WIDTH, commitTiming, (finished?: boolean) => {
        'worklet';
        if (finished) {
          scheduleOnRN(finishCommit, direction);
        } else {
          isAnimating.set(false);
        }
      }));
    },
    [commitTiming, finishCommit, isAnimating, centerSlot, commit, x],
  );

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-CLAIM_THRESHOLD, CLAIM_THRESHOLD])
        .failOffsetY([-FAIL_Y_THRESHOLD, FAIL_Y_THRESHOLD])
        .onUpdate(e => {
          if (isAnimating.get()) return;
          x.set(-centerSlot.get() * SCREEN_WIDTH + e.translationX);
        })
        .onEnd((e, success) => {
          if (isAnimating.get()) return;
          const dx = e.translationX;
          const vx = e.velocityX;
          if (success && (dx < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD)) {
            startCommit(1);
          } else if (success && (dx > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD)) {
            startCommit(-1);
          } else {
            x.set(withSpring(-centerSlot.get() * SCREEN_WIDTH, spring));
          }
        }),
    [isAnimating, x, centerSlot, startCommit, spring],
  );

  const triggerPrev = useCallback(() => startCommit(-1), [startCommit]);
  const triggerNext = useCallback(() => startCommit(1), [startCommit]);

  return {
    gesture,
    x,
    commit,
    triggerPrev,
    triggerNext,
    screenWidth: SCREEN_WIDTH,
  };
}
