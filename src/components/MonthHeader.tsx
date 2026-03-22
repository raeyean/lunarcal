import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';

interface MonthHeaderProps {
  titleCn: string;
  titleEn: string;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthHeader({ titleCn, titleEn, onPrev, onNext }: MonthHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrev} style={styles.arrowButton} activeOpacity={0.6}>
        <Text style={[styles.arrow, { color: colors.foreground }]}>‹</Text>
      </TouchableOpacity>
      <View style={styles.titleGroup}>
        <Text style={[styles.titleCn, { color: colors.foreground }]}>{titleCn}</Text>
        <Text style={[styles.titleEn, { color: colors.muted }]}>{titleEn}</Text>
      </View>
      <TouchableOpacity onPress={onNext} style={styles.arrowButton} activeOpacity={0.6}>
        <Text style={[styles.arrow, { color: colors.foreground }]}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  titleGroup: {
    alignItems: 'center',
    gap: 2,
  },
  titleCn: {
    ...Typography.screenHeader,
  },
  titleEn: {
    ...Typography.monthEnglish,
  },
  arrowButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 28,
    fontWeight: '300',
  },
});
