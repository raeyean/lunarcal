import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography, Fonts } from '../constants/typography';
import { Radius } from '../constants/radius';
import { Spacing } from '../constants/spacing';
import { Moon } from './Moon';
import { deityColor } from '../constants/colors';
import type { DayData } from '../utils/lunar';

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
  const handlePress = React.useCallback(() => {
    onSelectDay?.(day);
  }, [onSelectDay, day]);

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
    containerExtra.push({ backgroundColor: colors.primary, borderRadius: Radius.md });
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
    <TouchableOpacity
      style={[styles.container, ...containerExtra]}
      onPress={handlePress}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${day}日，農曆${lunarText}${isActive ? '，已選取' : ''}`}
      accessibilityState={{ selected: isActive }}
    >
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
    </TouchableOpacity>
  );
}

export const CalendarCell = React.memo(CalendarCellInner);

const styles = StyleSheet.create({
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
