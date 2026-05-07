import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';

interface InfoBadgeProps {
  label?: string;
  tint?: string;
  style?: ViewStyle;
}

const ARROW_SIZE = 14;

export function InfoBadge({ label, tint, style }: InfoBadgeProps) {
  const { colors } = useTheme();
  const color = tint ?? colors.muted;

  return (
    <View style={[styles.container, style]} accessible={false}>
      {label ? <Text style={[styles.label, { color }]}>{label}</Text> : null}
      <Svg width={ARROW_SIZE} height={ARROW_SIZE} viewBox="0 0 24 24">
        <Path
          d="M9 5l7 7-7 7"
          stroke={color}
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
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
});
