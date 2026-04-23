import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography, Fonts } from '../constants/typography';

interface CalendarCellProps {
  day: number;
  lunarText: string;
  isActive: boolean;
  isJieqi: boolean;
  isFestival?: boolean;
  isEmpty: boolean;
  onPress: () => void;
}

export function CalendarCell({ day, lunarText, isActive, isJieqi, isFestival, isEmpty, onPress }: CalendarCellProps) {
  const { colors } = useTheme();

  if (isEmpty) {
    return <View style={styles.container} />;
  }

  return (
    <TouchableOpacity
      style={[styles.container, isActive && { backgroundColor: colors.primary, borderRadius: 12 }]}
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={`${day}日，農曆${lunarText}${isActive ? '，已選取' : ''}`}
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
    maxWidth: 52,
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
