import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { AuspiciousResult } from '../utils/auspiciousScan';

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface AuspiciousResultCardProps {
  result: AuspiciousResult;
  matchedActivity: string;
  onPress: () => void;
}

export function AuspiciousResultCard({ result, matchedActivity, onPress }: AuspiciousResultCardProps) {
  const { colors } = useTheme();
  const luckColor = result.tianShenType === '吉' ? colors.success : colors.muted;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.solarDate, { color: colors.foreground }]}>
            {MONTH_NAMES[result.date.month]} {result.date.day}
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

      <View style={styles.chipRow}>
        {result.yi.slice(0, 6).map((item, idx) => {
          const isMatch = item === matchedActivity;
          return (
            <View
              key={idx}
              style={[
                styles.yiChip,
                {
                  backgroundColor: isMatch
                    ? `${colors.primary}26`
                    : `${colors.primary}14`,
                },
              ]}
            >
              <Text style={[
                styles.yiChipText,
                {
                  color: isMatch ? colors.primary : `${colors.primary}B3`,
                  fontFamily: isMatch ? Fonts.outfitSemiBold : Fonts.inter,
                },
              ]}>
                {item}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={[styles.luck, { color: luckColor }]}>
        {result.tianShenType} · {result.tianShen}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 14,
    gap: 10,
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
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  yiChipText: {
    fontSize: 10,
  },
  luck: {
    fontFamily: Fonts.inter,
    fontSize: 10,
  },
});
