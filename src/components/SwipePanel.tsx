import React, { useMemo } from 'react';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { PanelEntranceContext, type SwipeCommit } from '../hooks/usePanelEntrance';

interface SwipePanelProps {
  /** Row offset from `useSwipeGesture`. */
  x: SharedValue<number>;
  /** Commit signal from `useSwipeGesture`. */
  commit: SharedValue<SwipeCommit>;
  /** Stable position of this panel, in panel widths, relative to the screen's anchor. */
  slot: number;
  width: number;
  /** True for the centre panel; off-screen panels are hidden from screen readers. */
  active: boolean;
  children: React.ReactNode;
}

/**
 * One panel of a `useSwipeGesture` row (#29). Every panel shares the same
 * layout box (`marginRight: -width` stacks them at x = 0) and is placed purely
 * by `translateX = slot * width + x`. A panel's slot never changes while it is
 * mounted, so when the parent swaps the centre date nothing moves: the row
 * offset already matches, and the incoming panel stays mounted with its
 * entrance animations still running.
 */
export function SwipePanel({ x, commit, slot, width, active, children }: SwipePanelProps) {
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: slot * width + x.get() }],
  }));
  const entrance = useMemo(() => ({ commit, slot }), [commit, slot]);

  return (
    <PanelEntranceContext.Provider value={entrance}>
      <Animated.View
        style={[{ width, marginRight: -width }, style]}
        accessibilityElementsHidden={!active}
        importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
      >
        {children}
      </Animated.View>
    </PanelEntranceContext.Provider>
  );
}
