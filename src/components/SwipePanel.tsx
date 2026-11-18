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
 *
 * Off-centre panels stay hidden while the user drags: a neighbour only becomes
 * visible once a commit targets it, at the moment its entrance starts, so the
 * user never sees its content static and then blank out and replay.
 */
export function SwipePanel({ x, commit, slot, width, active, children }: SwipePanelProps) {
  const style = useAnimatedStyle(() => ({
    opacity: active || commit.get().slot === slot ? 1 : 0,
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
