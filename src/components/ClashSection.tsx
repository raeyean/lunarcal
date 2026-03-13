import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Badge } from './Badge';

interface ClashSectionProps {
  animal: string;
  emoji: string;
  description: string;
  direction: string;
  element: string;
}

export function ClashSection({ animal, emoji, description, direction, element }: ClashSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>相冲生肖</Text>
      <View style={styles.animalRow}>
        <View style={styles.emojiCircle}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.clashName}>{animal}</Text>
          <Text style={styles.clashDesc}>{description}</Text>
        </View>
      </View>
      <View style={styles.badges}>
        <Badge label={direction} />
        <Badge label="胎神佔方" />
        <Badge label={element} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
    color: Colors.foreground,
  },
  animalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  detail: {
    flex: 1,
    gap: 4,
  },
  clashName: {
    ...Typography.clashName,
    color: Colors.foreground,
  },
  clashDesc: {
    ...Typography.body,
    color: Colors.subtleText,
    lineHeight: 17,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
});
