import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Fonts } from '../constants/typography';

interface CalendarCellProps {
  day: number;
  lunarText: string;
  isActive: boolean;
  isJieqi: boolean;
  isEmpty: boolean;
  onPress: () => void;
}

export function CalendarCell({ day, lunarText, isActive, isJieqi, isEmpty, onPress }: CalendarCellProps) {
  if (isEmpty) {
    return <View style={styles.container} />;
  }

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onPress}
    >
      <Text style={[
        styles.dayNumber,
        isActive && styles.dayNumberActive,
      ]}>
        {day}
      </Text>
      <Text style={[
        styles.lunarText,
        isActive && styles.lunarTextActive,
        isJieqi && !isActive && styles.lunarTextJieqi,
      ]}>
        {lunarText}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  activeContainer: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  dayNumber: {
    ...Typography.calendarDay,
    color: Colors.foreground,
  },
  dayNumberActive: {
    ...Typography.calendarDayActive,
    color: Colors.white,
  },
  lunarText: {
    ...Typography.lunarDateCell,
    color: Colors.muted,
  },
  lunarTextActive: {
    color: Colors.white,
  },
  lunarTextJieqi: {
    color: Colors.primary,
    fontFamily: Fonts.interMedium,
  },
});
