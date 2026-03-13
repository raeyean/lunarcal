import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface FestivalBannerProps {
  festivals: string[];
}

export function FestivalBanner({ festivals }: FestivalBannerProps) {
  if (festivals.length === 0) return null;

  return (
    <View style={styles.container}>
      {festivals.map((name, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.dot} />
          <Text style={styles.text}>{name}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF7EC',
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
    backgroundColor: Colors.festival,
  },
  text: {
    ...Typography.jieqiBanner,
    color: Colors.festival,
  },
});
