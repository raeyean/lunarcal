import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

const DAYS: { short: string; full: string }[] = [
  { short: '日', full: '星期日' },
  { short: '一', full: '星期一' },
  { short: '二', full: '星期二' },
  { short: '三', full: '星期三' },
  { short: '四', full: '星期四' },
  { short: '五', full: '星期五' },
  { short: '六', full: '星期六' },
];

export function WeekHeader() {
  const { colors } = useTheme();

  return (
    <View style={styles.container} accessibilityRole="header">
      {DAYS.map(({ short, full }) => (
        <Text
          key={short}
          style={[styles.dayText, { color: colors.muted }]}
          accessibilityLabel={full}
        >
          {short}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  dayText: {
    ...Typography.weekDay,
    flex: 1,
    maxWidth: 52,
    textAlign: 'center',
  },
});
