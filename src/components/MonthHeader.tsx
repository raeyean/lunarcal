import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Fonts } from '../constants/typography';

interface MonthHeaderProps {
  titleCn: string;
  titleEn: string;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthHeader({ titleCn, titleEn, onPrev, onNext }: MonthHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrev} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Text style={styles.arrow}>‹</Text>
      </TouchableOpacity>
      <View style={styles.titleGroup}>
        <Text style={styles.titleCn}>{titleCn}</Text>
        <Text style={styles.titleEn}>{titleEn}</Text>
      </View>
      <TouchableOpacity onPress={onNext} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Text style={styles.arrow}>›</Text>
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
    color: Colors.foreground,
  },
  titleEn: {
    ...Typography.monthEnglish,
    color: Colors.muted,
  },
  arrow: {
    fontSize: 28,
    color: Colors.foreground,
    fontWeight: '300',
  },
});
