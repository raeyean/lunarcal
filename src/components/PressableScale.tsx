import React from 'react';
import {
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { EASE_OUT, Press } from '../constants/motion';
import { useMotion } from '../hooks/useMotion';

/**
 * Style keys that position/size the control inside its parent. They stay on
 * the outer Pressable (which owns hit testing) so the hit area never shrinks
 * while pressed; every other key (padding, background, border, flexDirection,
 * child alignment...) goes to the inner scaled view.
 */
const OUTER_KEYS = new Set<string>([
  'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'alignSelf',
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  'marginHorizontal', 'marginVertical', 'marginStart', 'marginEnd',
  'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
  'aspectRatio', 'position', 'top', 'bottom', 'left', 'right', 'start', 'end',
  'zIndex', 'display',
]);

function splitStyle(style: StyleProp<ViewStyle>) {
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const outer: Record<string, unknown> = {};
  const inner: Record<string, unknown> = {};
  for (const key of Object.keys(flat)) {
    (OUTER_KEYS.has(key) ? outer : inner)[key] = flat[key];
  }
  return { outer: outer as ViewStyle, inner: inner as ViewStyle };
}

/**
 * True when the caller gave the outer view a size along the main axis, so the
 * inner view must grow to cover it. Without this the inner view stays
 * content-sized, like a plain Pressable (an unconditional flexGrow inflated
 * auto-height parents, issue #31).
 */
function isSized(outer: Record<string, unknown>) {
  const grows = (v: unknown) => typeof v === 'number' && v > 0;
  return (
    grows(outer.flex) ||
    grows(outer.flexGrow) ||
    outer.height !== undefined ||
    outer.minHeight !== undefined ||
    outer.aspectRatio !== undefined ||
    outer.alignSelf === 'stretch' ||
    (outer.top !== undefined && outer.bottom !== undefined)
  );
}

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  /** Scale while pressed. Defaults to `Press.control`; use `Press.card` for wide rows. */
  scaleTo?: number;
  style?: PressableProps['style'];
}

/**
 * Drop-in `Pressable` that shrinks slightly while pressed (issue #28, spec #18).
 * The outer Pressable owns hit testing, a11y and sizing; an inner Reanimated
 * view carries the visual styles and the scale. No scale when disabled or when
 * the OS Reduce Motion setting is on.
 */
export function PressableScale({
  scaleTo = Press.control,
  style,
  children,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const { reduced } = useMotion();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const canScale = !reduced && !disabled;

  const handlePressIn = React.useCallback(
    (e: GestureResponderEvent) => {
      if (canScale) {
        scale.set(withTiming(scaleTo, { duration: Press.ms, easing: EASE_OUT }));
      }
      onPressIn?.(e);
    },
    [canScale, scale, scaleTo, onPressIn],
  );
  const handlePressOut = React.useCallback(
    (e: GestureResponderEvent) => {
      scale.set(withTiming(1, { duration: Press.ms, easing: EASE_OUT }));
      onPressOut?.(e);
    },
    [scale, onPressOut],
  );

  const resolve = (pressed: boolean) =>
    splitStyle(typeof style === 'function' ? style({ pressed }) : style);
  const fillStyle = (pressed: boolean) => {
    const { outer, inner } = resolve(pressed);
    return [isSized(outer as Record<string, unknown>) && styles.fill, inner];
  };

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => resolve(pressed).outer}
    >
      {(state) => (
        <Animated.View style={[fillStyle(state.pressed), animatedStyle]}>
          {typeof children === 'function' ? children(state) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flexGrow: 1 },
});
