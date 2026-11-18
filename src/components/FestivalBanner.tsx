import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { InfoBadge } from './InfoBadge';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { PressableScale } from './PressableScale';
import { Press } from '../constants/motion';

interface FestivalBannerProps {
  festivals: string[];
  onPressFestival?: (name: string) => void;
}

export function FestivalBanner({ festivals, onPressFestival }: FestivalBannerProps) {
  const { colors } = useTheme();

  if (festivals.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.festivalLight }]}>
      {festivals.map((name, i) => (
        <PressableScale scaleTo={Press.card}
          key={`${name}-${i}`}
          style={styles.row}
          onPress={() => onPressFestival?.(name)}
          accessibilityRole="button"
          accessibilityLabel={`節日 ${name}`}
          accessibilityHint="點擊查看節日詳情"
        >
          <View style={[styles.dot, { backgroundColor: colors.festival }]} />
          <Text style={[styles.text, { color: colors.festival }]}>{name}</Text>
          <View style={styles.spacer} />
          <InfoBadge tint={colors.festival} />
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4, // circle
  },
  text: {
    ...Typography.jieqiBanner,
  },
  spacer: {
    flex: 1,
  },
});
