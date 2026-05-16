import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { AuspiciousResult } from '../utils/auspiciousScan';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { withOpacity } from '../constants/colorUtils';

const WEEKDAY_NAMES = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

interface AuspiciousResultCardProps {
  result: AuspiciousResult;
  matchedActivity: string;
  onPress: () => void;
}

export function AuspiciousResultCard({ result, matchedActivity, onPress }: AuspiciousResultCardProps) {
  const { colors } = useTheme();
  const luckColor = result.tianShenType === '吉' ? colors.success : colors.muted;

  const yiTop = result.yi.slice(0, 6);
  const a11yLabel = `${result.date.month}月${result.date.day}日 ${WEEKDAY_NAMES[result.weekDay]}, 農曆 ${result.lunarDate}`;
  const a11yHint = `${result.tianShenType} ${result.tianShen} · 宜 ${yiTop.join('、')} · 點擊查看當日詳情`;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityHint={a11yHint}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.solarDate, { color: colors.foreground }]}>
            {result.date.month}月{result.date.day}日
          </Text>
          <Text style={[styles.weekday, { color: colors.muted }]}>
            {WEEKDAY_NAMES[result.weekDay]}
          </Text>
        </View>
        <View style={styles.rightColumn}>
          <Text style={[styles.lunarDate, { color: colors.primary }]}>
            {result.lunarDate}
          </Text>
          <Text style={[styles.ganzhi, { color: colors.subtleText }]}>
            {result.ganzhiDay}
          </Text>
        </View>
      </View>

      <Text style={[styles.luck, { color: luckColor }]}>
        {result.tianShenType} · {result.tianShen}
      </Text>

      <View style={styles.chipRow}>
        {yiTop.map((item, idx) => {
          const isMatch = item === matchedActivity;
          return (
            <View
              key={`${item}-${idx}`}
              style={[
                styles.yiChip,
                {
                  backgroundColor: isMatch
                    ? withOpacity(colors.primary, 0.15)
                    : withOpacity(colors.primary, 0.08),
                },
              ]}
            >
              <Text style={[
                styles.yiChipText,
                {
                  color: isMatch ? colors.primary : withOpacity(colors.primary, 0.7),
                  fontFamily: isMatch ? Fonts.outfitSemiBold : Fonts.inter,
                },
              ]}>
                {item}
              </Text>
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  solarDate: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 16,
  },
  weekday: {
    fontFamily: Fonts.inter,
    fontSize: 12,
  },
  rightColumn: {
    alignItems: 'flex-end',
  },
  lunarDate: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 13,
  },
  ganzhi: {
    fontFamily: Fonts.inter,
    fontSize: 11,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  yiChip: {
    borderRadius: Radius.md,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
  },
  yiChipText: {
    fontSize: 10,
  },
  luck: {
    fontFamily: Fonts.inter,
    fontSize: 11,
  },
});
