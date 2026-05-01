import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { SymbolView } from 'expo-symbols';
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
      <SymbolView
        name="chevron.right"
        size={14}
        tintColor={color}
        weight="semibold"
        resizeMode="scaleAspectFit"
        fallback={<Text style={[styles.chevronFallback, { color }]}>›</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    ...Typography.badgeText,
  },
  chevronFallback: {
    fontSize: 16,
    lineHeight: 16,
  },
});
