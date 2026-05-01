import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';

interface MoreChipProps {
  count?: number;
  label?: string;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function MoreChip({ count, label, onPress, accessibilityLabel }: MoreChipProps) {
  const { colors } = useTheme();

  const displayLabel = label ?? (count !== undefined ? `+${count} 更多` : '更多');
  const a11yLabel = accessibilityLabel ?? displayLabel;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={a11yLabel}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.muted + '20' },
        pressed && { opacity: 0.6 },
      ]}
    >
      <Text style={[styles.text, { color: colors.subtleText }]}>{displayLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.pill,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Typography.badgeText,
  },
});
