import React from 'react';
import { Insets, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Spacing } from '../constants/spacing';

interface IconButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  size?: number;
  variant?: 'default' | 'primary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  hitSlop?: Insets;
}

export function IconButton({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  size = 22,
  variant = 'default',
  disabled = false,
  style,
  hitSlop = { top: 10, bottom: 10, left: 10, right: 10 },
}: IconButtonProps) {
  const { colors } = useTheme();

  const backgroundColors: Record<NonNullable<IconButtonProps['variant']>, string> = {
    default: colors.muted + '20',
    primary: colors.primary,
    ghost: 'transparent',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      hitSlop={hitSlop}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: backgroundColors[variant ?? 'default'] },
        pressed && { opacity: 0.6 },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 44,
    minHeight: 44,
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});
