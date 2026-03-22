import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';

interface JieqiBannerProps {
  text: string;
  onPress?: (text: string) => void;
}

export function JieqiBanner({ text, onPress }: JieqiBannerProps) {
  const { colors } = useTheme();

  if (!text) return null;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.primaryLight }]}
      onPress={() => onPress?.(text)}
      activeOpacity={0.6}
    >
      <View style={[styles.dot, { backgroundColor: colors.primary }]} />
      <Text style={[styles.text, { color: colors.primary }]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
