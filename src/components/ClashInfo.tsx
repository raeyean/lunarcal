import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';

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
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  emoji: { fontSize: 14 },
  label: {
    ...Typography.badgeText,
  },
});
