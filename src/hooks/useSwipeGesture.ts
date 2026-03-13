import { useRef, useMemo } from 'react';
import { PanResponder, PanResponderGestureState } from 'react-native';

const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.3;

interface SwipeHandlers {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function useSwipeGesture({ onSwipeLeft, onSwipeRight }: SwipeHandlers) {
  const handlersRef = useRef({ onSwipeLeft, onSwipeRight });
  handlersRef.current = { onSwipeLeft, onSwipeRight };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) => {
          const { dx, dy } = gestureState;
          return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
        },
        onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
          const { dx, vx } = gestureState;
          if (dx < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD) {
            handlersRef.current.onSwipeLeft();
          } else if (dx > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD) {
            handlersRef.current.onSwipeRight();
          }
        },
      }),
    []
  );

  return panResponder.panHandlers;
}
