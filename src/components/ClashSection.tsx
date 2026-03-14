import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
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
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>相冲生肖</Text>
      <View style={styles.animalRow}>
        <View style={[styles.emojiCircle, { backgroundColor: colors.background }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={[styles.clashName, { color: colors.foreground }]}>{animal}</Text>
          <Text style={[styles.clashDesc, { color: colors.subtleText }]}>{description}</Text>
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
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
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
  },
  clashDesc: {
    ...Typography.body,
    lineHeight: 17,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
});
