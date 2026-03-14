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
      <TouchableOpacity onPress={onPrev} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Text style={[styles.arrow, { color: colors.foreground }]}>‹</Text>
      </TouchableOpacity>
      <View style={styles.titleGroup}>
        <Text style={[styles.titleCn, { color: colors.foreground }]}>{titleCn}</Text>
        <Text style={[styles.titleEn, { color: colors.muted }]}>{titleEn}</Text>
      </View>
      <TouchableOpacity onPress={onNext} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
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
  arrow: {
    fontSize: 28,
    fontWeight: '300',
  },
});
