import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';

interface ClashInfoProps {
  emoji: string;
  label: string;
}

export function ClashInfo({ emoji, label }: ClashInfoProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, { color: colors.subtleText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  emoji: { fontSize: 14 },
  label: {
    ...Typography.badgeText,
  },
});
