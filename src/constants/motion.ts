import { Easing } from 'react-native-reanimated';

/**
 * Motion tokens from the approved prototype. Spec and rationale: issue #18
 * (raeyean/lunarcal). All motion code should read from here, not hard-code values.
 * Prefer `useMotion()` (src/hooks/useMotion.ts) so reduced motion is respected.
 */

/** Durations in ms. See #18 token table. */
export const Duration = {
  /** Tab content fade + translateY 8 -> 0 (ease-out). */
  tabIn: 320,
  /** Tab indicator slide (spring). */
  tabIndicator: 460,
  /** Tab icon bounce, scale 0.7 -> 1 (spring). */
  tabIcon: 420,
  /** Month/day commit slide, translateX +-64 -> 0 (spring). */
  swipeCommit: 420,
  /** Snap back below swipe threshold (spring). */
  swipeSnapBack: 360,
  /** Calendar cell selection pop, scale 0.55 -> 1 (spring). */
  cellPop: 380,
  /** Special-day burst (ease-out). */
  burst: 620,
  /** Bottom panel / meta rise, translateY 10 -> 0 (ease-out); range is 300-340. */
  panelRise: 320,
  /** Daily hero numeral roll, +-60% translateY (spring). */
  heroRoll: 460,
  /** Per-item duration of the staggered list. */
  listItem: 380,
  /** Sheet open (spring). */
  sheetOpen: 520,
  /** Sheet close (ease-in). */
  sheetClose: 260,
  /** Scrim fade in. */
  scrimIn: 280,
  /** Scrim fade out. */
  scrimOut: 240,
  /** Moon phase change (ease-out). */
  moonPhase: 700,
} as const;

/** Stagger timings in ms for list items (#18). Delay = base + index * step. */
export const Stagger = {
  /** Initial delay before the first item. */
  base: 80,
  /** Added delay per item (generic lists, e.g. 宜/忌). */
  list: 45,
  /** Initial delay before the first 五行/冲/煞/宿 stat cell (#23). */
  statsBase: 220,
  /** Step per stat cell. Tuned to 60 (not the generic 45) by #23. */
  stats: 60,
  /** Step for chips; same as list unless a ticket tunes it. */
  chips: 45,
} as const;

/** Special-day burst geometry (#18). Duration is `Duration.burst`. */
export const Burst = {
  dots: 8,
  radiusFrom: 8,
  radiusTo: 34,
} as const;

/** Sheet gesture values (#18). */
export const Sheet = {
  /** Handle drag distance in px at or beyond which the sheet dismisses. */
  dismissDistance: 90,
} as const;

/**
 * Press-feedback scales (#28). `control` for icon buttons, chips, pills and
 * tabs; `card` for wide rows and cards. `ms` is the press-in/out duration.
 * Consumed by PressableScale.
 */
export const Press = { control: 0.93, card: 0.98, ms: 140 } as const;

/** Offsets used by enter/commit motions (#18). */
export const Offset = {
  tabY: 8,
  panelY: 10,
  swipeX: 64,
  /** Hero numeral roll, as a fraction of its height. */
  heroRollFraction: 0.6,
  tabIconScaleFrom: 0.7,
  cellPopScaleFrom: 0.55,
} as const;

/** Ease-out, cubic-bezier(.22, 1, .36, 1). */
export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

/** Ease-in, cubic-bezier(.4, 0, 1, 1). Used for sheet close. */
export const EASE_IN = Easing.bezier(0.4, 0, 1, 1);

/**
 * `withSpring` config approximating the prototype's overshoot spring
 * (cubic-bezier(.34,1.56,.64,1)). See #18.
 */
export const SPRING = {
  damping: 14,
  stiffness: 180,
  mass: 1,
} as const;
