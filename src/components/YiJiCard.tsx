import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface YiJiCardProps {
  type: 'yi' | 'ji';
  items: string[];
}

export function YiJiCard({ type, items }: YiJiCardProps) {
  const isYi = type === 'yi';
  const accentColor = isYi ? Colors.primary : Colors.jiDark;
  const title = isYi ? '宜' : '忌';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
      </View>
      {items.slice(0, 6).map((item, idx) => (
        <Text key={idx} style={styles.item}>{item}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accentBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  title: {
    ...Typography.cardTitle,
  },
  item: {
    ...Typography.bodyMedium,
    color: Colors.foreground,
  },
});
