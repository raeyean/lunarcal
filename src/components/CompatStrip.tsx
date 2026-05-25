import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useBirthProfile } from '../context/BirthProfileContext';
import { computeCompat } from '@lunarcal/shared';
import { getDayData } from '../utils/lunar';
import { Typography } from '../constants/typography';

interface Props {
  targetSolarDate: string;     // 'YYYY-MM-DD'
  onPress?: () => void;
  compact?: boolean;
}

export function CompatStrip({ targetSolarDate, onPress, compact }: Props) {
  const { profile, userBazi, isLoading } = useBirthProfile();
  const { colors } = useTheme();

  const result = useMemo(() => {
    if (!userBazi) return null;
    try {
      const [y, m, d] = targetSolarDate.split('-').map(Number);
      const dayData = getDayData(y, m, d);
      return computeCompat(userBazi.day.ganZhi, dayData.ganzhi.day);
    } catch (e) {
      console.warn('[CompatStrip] dayData fetch failed', e);
      return null;
    }
  }, [userBazi, targetSolarDate]);

  if (isLoading) {
    return <View style={[styles.skeleton, { backgroundColor: colors.surface }]} />;
  }

  if (!profile || !result) return null;

  const a11y = `${result.stars} out of 5 stars, ${result.reasonText}`;

  const body = (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.primary + '40' },
        compact && styles.compact,
      ]}
      accessibilityLabel={a11y}
      accessibilityRole="text"
    >
      {!compact && <Text style={[styles.label, { color: colors.muted }]}>今日對你</Text>}
      <View style={styles.row}>
        <View style={styles.starsRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < result.stars ? 'star' : 'star-outline'}
              size={14}
              color={colors.primary}
              style={{ marginRight: 2 }}
            />
          ))}
        </View>
        <Text style={[styles.reason, { color: colors.foreground }]} numberOfLines={1}>
          {result.reasonText}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress} accessibilityRole="button">{body}</Pressable>;
  }
  return body;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 4,
  },
  compact: { padding: 8, marginVertical: 2 },
  label: { ...Typography.microCaption, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  starsRow: { flexDirection: 'row', marginRight: 8 },
  reason: { ...Typography.body, flexShrink: 1 },
  skeleton: { height: 32, borderRadius: 10, marginVertical: 4 },
});
