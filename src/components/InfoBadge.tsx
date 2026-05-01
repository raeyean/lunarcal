import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';

interface InfoBadgeProps {
  label?: string;
  tint?: string;
  style?: ViewStyle;
}

export function InfoBadge({ label, tint, style }: InfoBadgeProps) {
  const { colors } = useTheme();
  const color = tint ?? colors.muted;

  return (
    <View style={[styles.container, style]} accessible={false}>
      {label ? <Text style={[styles.label, { color }]}>{label}</Text> : null}
      <Text style={[styles.chevron, { color }]}>›</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  label: {
    ...Typography.badgeText,
  },
  chevron: {
    fontSize: 18,
    lineHeight: 22,
  },
});
