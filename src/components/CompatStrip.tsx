import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useBirthProfile } from '../context/BirthProfileContext';
import { computeCompat } from '@lunarcal/shared';
import { getDayData } from '../utils/lunar';

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

  const starString = '★'.repeat(result.stars) + '☆'.repeat(5 - result.stars);
  const a11y = `${result.stars} out of 5 stars, ${result.reasonText}`;

  const body = (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.primary + '40' },
        compact && styles.compact,
      ]}
      accessibilityLabel={a11y}
    >
      {!compact && <Text style={[styles.label, { color: colors.muted }]}>今日對你</Text>}
      <View style={styles.row}>
        <Text style={[styles.stars, { color: colors.primary }]}>{starString}</Text>
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
  label: { fontSize: 10, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  stars: { fontSize: 14, marginRight: 8 },
  reason: { fontSize: 12, flexShrink: 1 },
  skeleton: { height: 32, borderRadius: 10, marginVertical: 4 },
});
