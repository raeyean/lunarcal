import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  Keyframe,
  ReduceMotion,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { Typography, Fonts } from '../constants/typography';
import { Radius } from '../constants/radius';
import { Spacing } from '../constants/spacing';
import { Duration, Offset } from '../constants/motion';
import { useMotion } from '../hooks/useMotion';
import { PressableScale } from './PressableScale';
import { Moon } from './Moon';
import { SelectionBurst } from './SelectionBurst';
import { deityColor } from '../constants/colors';
import type { DayData } from '../utils/lunar';

/**
 * Selection pop: scale 0.55 -> 1 with the prototype's overshoot curve
 * (cubic-bezier(.34,1.56,.64,1)) plus a quick opacity fade-in.
 */
const popEntering = new Keyframe({
  0: { opacity: 0, transform: [{ scale: Offset.cellPopScaleFrom }] },
  30: { opacity: 1 },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  },
})
  .duration(Duration.cellPop)
  .reduceMotion(ReduceMotion.System);

interface CalendarCellProps {
  day: number;
  lunarText: string;
  isActive: boolean;
  isJieqi: boolean;
  isFestival?: boolean;
  isEmpty: boolean;
  isToday?: boolean;
  isLunarFirst?: boolean;
  isCurrentMonth?: boolean;
  /** Full day-data — drives deity dot + 朔/望 mini moon. */
  dayData?: DayData;
  accessibilityLabel?: string;
  onSelectDay?: (day: number) => void;
}

function CalendarCellInner({
  day,
  lunarText,
  isActive,
  isJieqi,
  isFestival,
  isEmpty,
  isToday,
  isLunarFirst,
  isCurrentMonth = true,
  dayData,
  accessibilityLabel,
  onSelectDay,
}: CalendarCellProps) {
  const { colors, isDark } = useTheme();
  const { reduced } = useMotion();
  // Set in onPress so only user-initiated selection can trigger the burst.
  const pressedByUser = React.useRef(false);
  const [bursting, setBursting] = React.useState(false);
  const dayNum = dayData?.lunar.dayNum;
  const special = isJieqi || !!isFestival || dayNum === 1 || dayNum === 15;

  const handlePress = React.useCallback(() => {
    pressedByUser.current = true;
    onSelectDay?.(day);
  }, [onSelectDay, day]);
  const handleBurstDone = React.useCallback(() => setBursting(false), []);

  React.useEffect(() => {
    if (isActive) {
      if (pressedByUser.current && special && !reduced) setBursting(true);
    } else {
      pressedByUser.current = false;
      setBursting(false);
    }
  }, [isActive, special, reduced]);

  if (isEmpty) {
    return <View style={styles.container} />;
  }

  if (!isCurrentMonth) {
    return (
      <View style={[styles.container, styles.dimmed]}>
        <Text style={[styles.dayNumber, { color: colors.foreground }]}>{day}</Text>
        <Text style={[styles.lunarText, { color: colors.muted }]} numberOfLines={1}>
          {lunarText}
        </Text>
      </View>
    );
  }

  const containerExtra: ViewStyle[] = [];
  if (isActive) {
    // Lift above neighbours so the burst isn't covered.
    containerExtra.push({ zIndex: 1 });
  } else {
    if (isFestival) {
      containerExtra.push({ backgroundColor: colors.festivalLight, borderRadius: Radius.md });
    } else if (isJieqi) {
      containerExtra.push({ backgroundColor: colors.primarySoft, borderRadius: Radius.md });
    }
    if (isToday) {
      containerExtra.push({
        borderWidth: 1.5,
        borderColor: colors.primary,
        borderRadius: Radius.md,
      });
    }
  }

  const deity = dayData?.deity ?? null;
  const phase = dayData?.phase ?? 0;
  const showMiniMoon = dayData != null && (phase < 0.04 || (phase > 0.46 && phase < 0.54));
  // Deity name overrides lunarText when there's no festival/jieqi taking priority
  const labelText = !isJieqi && !isFestival && deity ? deity.deity : lunarText;
  const deityHue = deity ? deityColor(deity.kind, colors) : null;

  return (
    <PressableScale
      style={[styles.pressable, isActive && styles.pressableActive, styles.container, ...containerExtra]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${day}日，農曆${lunarText}${isActive ? '，已選取' : ''}`}
      accessibilityState={{ selected: isActive }}
    >
        {isActive ? (
          <Animated.View
            entering={popEntering}
            style={[styles.selectedBg, { backgroundColor: colors.primary }]}
          />
        ) : null}

        {bursting ? (
          <SelectionBurst
            colorA={colors.primary}
            colorB={colors.accent}
            onDone={handleBurstDone}
          />
        ) : null}

        {/* deity dot — top-left */}
        {deity && !isActive && !isFestival && !isJieqi ? (
          <View style={[styles.deityDot, { backgroundColor: deityHue || colors.primary }]} />
        ) : null}

        {/* mini moon — top-right at 朔/望 */}
        {showMiniMoon ? (
          <View style={styles.miniMoon}>
            <Moon phase={phase} size={10} theme={isActive || isDark ? 'dark' : 'light'} />
          </View>
        ) : null}

        <Text style={[
          styles.dayNumber,
          { color: colors.foreground },
          isActive && { ...Typography.calendarDayActive, color: colors.onPrimary },
        ]}>
          {day}
        </Text>
        <Text style={[
          styles.lunarText,
          { color: colors.muted },
          isActive && { color: colors.onPrimary },
          isJieqi && !isActive && { color: colors.primary, fontFamily: Fonts.interMedium },
          isFestival && !isActive && { color: colors.festival, fontFamily: Fonts.interMedium },
          deity && !isJieqi && !isFestival && !isActive && deityHue
            ? { color: deityHue, fontFamily: Fonts.interMedium }
            : null,
          isLunarFirst && !isJieqi && !isFestival && !deity && !isActive && {
            color: colors.foreground,
            fontFamily: Fonts.interMedium,
          },
        ]}
          numberOfLines={1}
        >
          {labelText}
        </Text>
    </PressableScale>
  );
}

export const CalendarCell = React.memo(CalendarCellInner);

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    maxWidth: 72,
  },
  pressableActive: {
    zIndex: 1,
  },
  container: {
    flex: 1,
    maxWidth: 72,
    minHeight: 56,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxs,
    position: 'relative',
  },
  selectedBg: {
    ...StyleSheet.absoluteFill,
    borderRadius: Radius.md,
  },
  dayNumber: {
    ...Typography.calendarDay,
  },
  lunarText: {
    ...Typography.lunarDateCell,
  },
  dimmed: {
    opacity: 0.35,
  },
  deityDot: {
    position: 'absolute',
    top: 4,
    left: 6,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  miniMoon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
