import { createContext, useContext } from 'react';
import {
  useAnimatedReaction,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

/** -1 = previous (swipe right / ‹), 1 = next (swipe left / ›). */
export type SwipeDirection = -1 | 1;

/**
 * Written by `useSwipeGesture` when a commit starts (#29). `slot` is the panel
 * sliding in; `seq` increases on every commit so repeat commits are seen.
 */
export interface SwipeCommit {
  seq: number;
  slot: number;
  dir: SwipeDirection;
}

export interface PanelEntranceValue {
  commit: SharedValue<SwipeCommit>;
  /** Slot of the panel this subtree belongs to. */
  slot: number;
}

/** Provided by `SwipePanel`; null outside a swipe panel. */
export const PanelEntranceContext = createContext<PanelEntranceValue | null>(null);

const IDLE: SwipeCommit = { seq: 0, slot: 0, dir: 1 };

/**
 * Runs `onPlay` (a worklet, on the UI thread) when a swipe commit starts toward
 * the panel this component sits in, so its entrance plays during the slide
 * (#29). Never fires on mount, and never outside a `SwipePanel`. Keep `onPlay`
 * stable (useCallback): a new identity re-registers the reaction.
 */
export function usePanelEntrance(onPlay: (dir: SwipeDirection) => void) {
  const ctx = useContext(PanelEntranceContext);
  const idle = useSharedValue<SwipeCommit>(IDLE);
  const commit = ctx?.commit ?? idle;
  const slot = ctx?.slot ?? Number.NaN;

  useAnimatedReaction(
    () => commit.get(),
    (cur, prev) => {
      if (prev === null || cur.seq === prev.seq || cur.slot !== slot) return;
      onPlay(cur.dir);
    },
    [commit, slot, onPlay],
  );
}
