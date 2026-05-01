import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';

interface BadgeProps {
  label: string;
}

export function Badge({ label }: BadgeProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.badgeBg }]}>
      <Text style={[styles.text, { color: colors.subtleText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Typography.badgeText,
  },
});
