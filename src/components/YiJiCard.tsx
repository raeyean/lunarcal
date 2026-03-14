import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';

interface YiJiCardProps {
  type: 'yi' | 'ji';
  items: string[];
}

export function YiJiCard({ type, items }: YiJiCardProps) {
  const { colors } = useTheme();
  const isYi = type === 'yi';
  const accentColor = isYi ? colors.primary : colors.jiDark;
  const title = isYi ? '宜' : '忌';

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
      </View>
      {items.slice(0, 6).map((item, idx) => (
        <Text key={idx} style={[styles.item, { color: colors.foreground }]}>{item}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
});
