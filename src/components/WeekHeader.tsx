import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

const DAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function WeekHeader() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {DAYS.map((day) => (
        <Text key={day} style={[styles.dayText, { color: colors.muted }]}>{day}</Text>
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
