import { useRef, useMemo, useCallback } from 'react';
import {
  Animated,
  PanResponder,
  PanResponderGestureState,
  Dimensions,
  Easing,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.3;
const BASE_OFFSET = -SCREEN_WIDTH;

interface SwipeConfig {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function useSwipeGesture({ onSwipeLeft, onSwipeRight }: SwipeConfig) {
  const translateX = useRef(new Animated.Value(BASE_OFFSET)).current;
  const isAnimating = useRef(false);
  const handlersRef = useRef({ onSwipeLeft, onSwipeRight });
  handlersRef.current = { onSwipeLeft, onSwipeRight };

  const performSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      const toValue = direction === 'left' ? -2 * SCREEN_WIDTH : 0;

      Animated.timing(translateX, {
        toValue,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        // Parent state change triggers a key change, which remounts
        // this component with a fresh Animated.Value at BASE_OFFSET.
        // No manual reset needed — avoids the flicker caused by
        // Animated and React view updates going through different
        // native channels.
        if (direction === 'left') {
          handlersRef.current.onSwipeLeft();
        } else {
          handlersRef.current.onSwipeRight();
        }
      });
    },
    [translateX],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (
          _,
          { dx, dy }: PanResponderGestureState,
        ) => {
          return (
            !isAnimating.current &&
            Math.abs(dx) > Math.abs(dy) &&
            Math.abs(dx) > 10
          );
        },
        onMoveShouldSetPanResponder: (
          _,
          { dx, dy }: PanResponderGestureState,
        ) => {
          return (
            !isAnimating.current &&
            Math.abs(dx) > Math.abs(dy) &&
            Math.abs(dx) > 10
          );
        },
        onPanResponderMove: (_, { dx }: PanResponderGestureState) => {
          if (!isAnimating.current) {
            translateX.setValue(BASE_OFFSET + dx);
          }
        },
        onPanResponderRelease: (_, { dx, vx }: PanResponderGestureState) => {
          if (isAnimating.current) return;

          if (dx < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD) {
            performSwipe('left');
          } else if (dx > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD) {
            performSwipe('right');
          } else {
            Animated.spring(translateX, {
              toValue: BASE_OFFSET,
              useNativeDriver: true,
              tension: 100,
              friction: 10,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          if (!isAnimating.current) {
            Animated.spring(translateX, {
              toValue: BASE_OFFSET,
              useNativeDriver: true,
              tension: 100,
              friction: 10,
            }).start();
          }
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [translateX, performSwipe],
  );

  const triggerPrev = useCallback(
    () => performSwipe('right'),
    [performSwipe],
  );
  const triggerNext = useCallback(
    () => performSwipe('left'),
    [performSwipe],
  );

  return {
    panHandlers: panResponder.panHandlers,
    animatedStyle: { transform: [{ translateX }] } as const,
    triggerPrev,
    triggerNext,
    screenWidth: SCREEN_WIDTH,
  };
}
