import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography, Fonts } from '../constants/typography';
import { Radius } from '../constants/radius';
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
  /** Full day-data — drives deity dot + 朔/望 mini moon. */
  dayData?: DayData;
  accessibilityLabel?: string;
  onPress: () => void;
}

export function CalendarCell({
  day,
  lunarText,
  isActive,
  isJieqi,
  isFestival,
  isEmpty,
  isToday,
  isLunarFirst,
  dayData,
  accessibilityLabel,
  onPress,
}: CalendarCellProps) {
  const { colors, isDark } = useTheme();

  if (isEmpty) {
    return <View style={styles.container} />;
  }

  const containerExtra = [] as any[];
  if (isActive) {
    containerExtra.push({ backgroundColor: colors.primary, borderRadius: Radius.md });
  } else {
    if (isFestival) {
      containerExtra.push({ backgroundColor: colors.festival + '20', borderRadius: Radius.md });
    } else if (isJieqi) {
      containerExtra.push({ backgroundColor: colors.primary + '15', borderRadius: Radius.md });
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
      onPress={onPress}
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
        isActive && { ...Typography.calendarDayActive, color: colors.white },
      ]}>
        {day}
      </Text>
      <Text style={[
        styles.lunarText,
        { color: colors.muted },
        isActive && { color: colors.white },
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 72,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
  },
  dayNumber: {
    ...Typography.calendarDay,
  },
  lunarText: {
    ...Typography.lunarDateCell,
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
