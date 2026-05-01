import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography, Fonts } from '../constants/typography';
import { Radius } from '../constants/radius';

interface CalendarCellProps {
  day: number;
  lunarText: string;
  isActive: boolean;
  isJieqi: boolean;
  isFestival?: boolean;
  isEmpty: boolean;
  isToday?: boolean;
  isLunarFirst?: boolean;
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
  accessibilityLabel,
  onPress,
}: CalendarCellProps) {
  const { colors } = useTheme();

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

  return (
    <TouchableOpacity
      style={[styles.container, ...containerExtra]}
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${day}日，農曆${lunarText}${isActive ? '，已選取' : ''}`}
      accessibilityState={{ selected: isActive }}
    >
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
        isLunarFirst && !isJieqi && !isFestival && !isActive && {
          color: colors.foreground,
          fontFamily: Fonts.interMedium,
        },
      ]}
        numberOfLines={1}
      >
        {lunarText}
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
  },
  dayNumber: {
    ...Typography.calendarDay,
  },
  lunarText: {
    ...Typography.lunarDateCell,
  },
});
