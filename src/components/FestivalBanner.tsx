import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';

interface FestivalBannerProps {
  festivals: string[];
}

export function FestivalBanner({ festivals }: FestivalBannerProps) {
  const { colors } = useTheme();

  if (festivals.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.festivalLight }]}>
      {festivals.map((name, i) => (
        <View key={i} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: colors.festival }]} />
          <Text style={[styles.text, { color: colors.festival }]}>{name}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    ...Typography.jieqiBanner,
  },
});
