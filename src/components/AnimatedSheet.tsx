import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type ColorValue,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  Extrapolation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useTheme } from '../context/ThemeContext';
import { Duration, EASE_IN, Sheet } from '../constants/motion';
import { Radius } from '../constants/radius';
import { Spacing } from '../constants/spacing';
import { useMotion } from '../hooks/useMotion';
import { DragHandle } from './DragHandle';

/** Upward drags move the sheet at this fraction of the finger distance. */
const UPWARD_DAMPING = 0.2;
/** Release velocity (px/s) at or above which a downward fling dismisses. */
const DISMISS_VELOCITY = 800;

interface AnimatedSheetProps {
  visible: boolean;
  /** Called on scrim tap, drag-to-dismiss, and Android back. The parent sets `visible` to false. */
  onClose: () => void;
  children?: React.ReactNode;
  /**
   * Content rendered above `children` inside the drag region (with the handle).
   * Only this region (and the handle) starts drag-to-dismiss, so ScrollViews in
   * `children` keep their own scrolling.
   */
  header?: React.ReactNode;
  /**
   * Style for the animated sheet container. `bottom` sheets default to the theme
   * background and rounded top corners. Do not set `overflow: 'hidden'`: the
   * filler below the sheet that hides the spring overshoot would be clipped.
   */
  style?: StyleProp<ViewStyle>;
  maxHeight?: number;
  /** When false, scrim tap, drag and Android back do not close the sheet. Default true. */
  dismissible?: boolean;
  /** `bottom` (default) anchors to the screen bottom; `center` floats a card in the middle. */
  placement?: 'bottom' | 'center';
  /** Render the built-in `DragHandle` at the top of the drag region. Default true. */
  showHandle?: boolean;
  /**
   * `header` (default): only the handle and `header` start a drag.
   * `sheet`: the whole sheet is draggable. Use only when the content does not scroll.
   */
  dragRegion?: 'header' | 'sheet';
  /**
   * Called after the exit animation finishes and the Modal has unmounted. Open a
   * follow-up Modal from here: on iOS a sibling Modal cannot present while this
   * one is still on screen.
   */
  onExited?: () => void;
}

/**
 * Reanimated bottom sheet host (issue #24, tokens from #18).
 *
 * Transparent `Modal` with a fading scrim and a sheet that springs up on open and
 * eases out on close. The Modal stays mounted until the exit animation finishes.
 * Dragging the handle/header follows the finger (upward drag is damped) and
 * dismisses past `Sheet.dismissDistance` or on a fast fling; otherwise it springs
 * back. All animations follow the OS Reduce Motion setting.
 */
export function AnimatedSheet({
  visible,
  onClose,
  children,
  header,
  style,
  maxHeight,
  dismissible = true,
  placement = 'bottom',
  showHandle = true,
  dragRegion = 'header',
  onExited,
}: AnimatedSheetProps) {
  const { colors } = useTheme();
  const { spring, timing } = useMotion();
  const { height: windowHeight } = useWindowDimensions();

  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const awaitingLayout = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;
  const exitPending = useRef(false);

  const isBottom = placement === 'bottom';
  const translateY = useSharedValue(windowHeight);
  const scrim = useSharedValue(0);
  /** Distance that puts the sheet fully off-screen. */
  const offscreen = useSharedValue(windowHeight);
  const dragStart = useSharedValue(0);

  const openSpring = spring;
  const closeTiming = useMemo(() => timing(Duration.sheetClose, EASE_IN), [timing]);
  const scrimInTiming = useMemo(() => timing(Duration.scrimIn), [timing]);
  const scrimOutTiming = useMemo(() => timing(Duration.scrimOut, EASE_IN), [timing]);

  const requestClose = useCallback(() => onCloseRef.current(), []);

  const unmount = useCallback(() => {
    // A reopen may have raced the exit callback; keep the sheet if so.
    if (visibleRef.current) return;
    mountedRef.current = false;
    exitPending.current = true;
    setMounted(false);
  }, []);

  // Fire onExited after the commit that removed the Modal.
  useEffect(() => {
    if (!mounted && exitPending.current) {
      exitPending.current = false;
      onExitedRef.current?.();
    }
  }, [mounted]);

  const animateIn = useCallback(() => {
    scrim.set(withTiming(1, scrimInTiming));
    translateY.set(withSpring(0, openSpring));
  }, [scrim, translateY, scrimInTiming, openSpring]);

  const animateOut = useCallback(() => {
    scrim.set(withTiming(0, scrimOutTiming));
    translateY.set(withTiming(offscreen.value, closeTiming, (finished) => {
      if (finished) scheduleOnRN(unmount);
    }));
  }, [scrim, translateY, offscreen, scrimOutTiming, closeTiming, unmount]);

  useEffect(() => {
    if (visible) {
      if (!mountedRef.current) {
        // First frame renders off-screen; onLayout measures and starts the open.
        mountedRef.current = true;
        awaitingLayout.current = true;
        offscreen.set(windowHeight);
        translateY.set(windowHeight);
        scrim.set(0);
        setMounted(true);
      } else {
        animateIn();
      }
    } else if (mountedRef.current) {
      awaitingLayout.current = false;
      animateOut();
    }
    // Only react to visibility changes; the helpers read the latest config.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const h = e.nativeEvent.layout.height;
      // A bottom sheet hides at its own height; a centred card needs the window height.
      const distance = isBottom && h > 0 ? h : windowHeight;
      offscreen.set(distance);
      if (awaitingLayout.current) {
        awaitingLayout.current = false;
        translateY.set(distance);
        animateIn();
      }
    },
    [isBottom, windowHeight, offscreen, translateY, animateIn],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(dismissible)
        .activeOffsetY([-10, 10])
        .onStart(() => {
          dragStart.set(translateY.value);
        })
        .onUpdate((e) => {
          const raw = dragStart.value + e.translationY;
          translateY.set(raw > 0 ? raw : raw * UPWARD_DAMPING);
          scrim.set(interpolate(
            translateY.value,
            [0, offscreen.value],
            [1, 0],
            Extrapolation.CLAMP,
          ));
        })
        .onEnd((e) => {
          if (e.translationY >= Sheet.dismissDistance || e.velocityY > DISMISS_VELOCITY) {
            // Start leaving right away; the parent's visible=false continues it to unmount.
            scrim.set(withTiming(0, scrimOutTiming));
            translateY.set(withTiming(offscreen.value, closeTiming));
            scheduleOnRN(requestClose);
          } else {
            scrim.set(withTiming(1, scrimInTiming));
            translateY.set(withSpring(0, { ...openSpring, velocity: e.velocityY }));
          }
        }),
    [
      dismissible,
      dragStart,
      translateY,
      scrim,
      offscreen,
      scrimInTiming,
      scrimOutTiming,
      closeTiming,
      openSpring,
      requestClose,
    ],
  );

  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  const sheetBg =
    (StyleSheet.flatten(style)?.backgroundColor as ColorValue | undefined) ??
    (isBottom ? colors.background : undefined);

  const dragArea =
    showHandle || header ? (
      <View collapsable={false}>
        {showHandle ? <DragHandle /> : null}
        {header}
      </View>
    ) : null;

  const content =
    dragRegion === 'sheet' ? (
      <GestureDetector gesture={pan}>
        <View collapsable={false}>
          {dragArea}
          {children}
        </View>
      </GestureDetector>
    ) : (
      <>
        {dragArea ? <GestureDetector gesture={pan}>{dragArea}</GestureDetector> : null}
        {children}
      </>
    );

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismissible ? onClose : () => {}}
    >
      {/* Modal content is a separate native root, so gestures need their own root view. */}
      <GestureHandlerRootView style={isBottom ? styles.rootBottom : styles.rootCenter}>
        <Animated.View style={[styles.scrim, { backgroundColor: colors.overlay }, scrimStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismissible ? onClose : undefined}
            accessibilityLabel="關閉"
            accessibilityRole="button"
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          onLayout={handleLayout}
          style={[
            isBottom ? styles.sheetBottom : styles.sheetCenter,
            isBottom && { backgroundColor: colors.background },
            maxHeight != null && { maxHeight },
            style,
            sheetStyle,
          ]}
        >
          {isBottom ? (
            // Filler below the sheet so the open spring's overshoot never shows a gap.
            <View
              pointerEvents="none"
              style={[styles.overshootFiller, { height: windowHeight, backgroundColor: sheetBg }]}
            />
          ) : null}
          {content}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  rootBottom: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  rootCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
  },
  sheetBottom: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  sheetCenter: {},
  overshootFiller: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
  },
});
