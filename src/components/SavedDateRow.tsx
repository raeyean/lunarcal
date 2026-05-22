import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useBirthProfile } from '../context/BirthProfileContext';
import { computeCompat } from '@lunarcal/shared';
import { getDayData } from '../utils/lunar';
import type { SavedDate } from '@lunarcal/shared';

interface Props {
  item: SavedDate;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SavedDateRow({ item, onPress, onEdit, onDelete }: Props) {
  const { colors } = useTheme();
  const { userBazi } = useBirthProfile();

  const compat = useMemo(() => {
    if (!userBazi) return null;
    try {
      const [y, m, d] = item.solarDate.split('-').map(Number);
      const dayData = getDayData(y, m, d);
      return computeCompat(userBazi.day.ganZhi, dayData.ganzhi.day);
    } catch {
      return null;
    }
  }, [userBazi, item.solarDate]);

  const lunarLabel = useMemo(() => {
    const [y, m, d] = item.solarDate.split('-').map(Number);
    try {
      const data = getDayData(y, m, d);
      return `${data.ganzhi.year}年 ${data.lunar.monthCn}月${data.lunar.dayCn}`;
    } catch {
      return '';
    }
  }, [item.solarDate]);

  const handleLongPress = () => {
    Alert.alert(item.label, undefined, [
      { text: '編輯', onPress: onEdit },
      { text: '刪除', style: 'destructive', onPress: onDelete },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const stars = compat ? '★'.repeat(compat.stars) + '☆'.repeat(5 - compat.stars) : '';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.line }]}
      accessibilityRole="button"
      accessibilityLabel={`${item.label} ${item.solarDate}${compat ? ` ${compat.stars} 星 ${compat.reasonText}` : ''}`}
      accessibilityActions={[{ name: 'magicTap', label: '編輯或刪除' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'magicTap') handleLongPress();
      }}
    >
      <View style={styles.left}>
        <Text style={[styles.label, { color: colors.foreground }]}>{item.label}</Text>
        <Text style={[styles.date, { color: colors.muted }]}>
          {item.solarDate}{lunarLabel ? ` · 農曆${lunarLabel}` : ''}
        </Text>
      </View>
      {compat && <Text style={[styles.stars, { color: colors.primary }]}>{stars}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 8,
  },
  left: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600' },
  date: { fontSize: 11, marginTop: 2 },
  stars: { fontSize: 14 },
});
