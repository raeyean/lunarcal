import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography, Fonts } from '../constants/typography';
import { ClashInfo } from './ClashInfo';
import { DayData } from '../utils/lunar';

interface BottomPanelProps {
  dayData: DayData;
}

export function BottomPanel({ dayData }: BottomPanelProps) {
  const { colors } = useTheme();
  const { lunar, ganzhi, yi, ji, clash, festivals } = dayData;

  const dateStr = `${lunar.monthCn}月${lunar.dayCn} ${ganzhi.year}年 ${ganzhi.month}月 ${ganzhi.day}日`;
  const festivalStr = festivals.length > 0 ? festivals[0] : null;
  const ganzhiStr = `天干地支：${ganzhi.day}日 · ${ganzhi.month}月 · ${ganzhi.year}年`;

  const yiStr1 = yi.slice(0, 3).join(' · ');
  const yiStr2 = yi.slice(3, 6).join(' · ');
  const jiStr1 = ji.slice(0, 3).join(' · ');
  const jiStr2 = ji.slice(3, 6).join(' · ');

  // Extract short clash label (e.g. "沖馬")
  const clashShort = clash.animal.split(' ')[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.bottomPanelBg }]}>
      <View style={styles.dateRow}>
        <View style={styles.dateLeft}>
          <Text style={[styles.dateNum, { color: colors.foreground }]}>{dateStr}</Text>
          {festivalStr ? (
            <Text style={[styles.festival, { color: colors.festival }]}>{festivalStr}</Text>
          ) : null}
          <Text style={[styles.ganzhi, { color: colors.subtleText }]}>{ganzhiStr}</Text>
        </View>
        <ClashInfo emoji={clash.emoji} label={clashShort} />
      </View>
      <View style={styles.yiJiRow}>
        <View style={[styles.yiJiCol, { backgroundColor: colors.surface }]}>
          <Text style={[styles.yiJiLabel, { color: colors.primary }]}>宜</Text>
          {yiStr1 ? <Text style={[styles.yiJiText, { color: colors.subtleText }]}>{yiStr1}</Text> : null}
          {yiStr2 ? <Text style={[styles.yiJiText, { color: colors.subtleText }]}>{yiStr2}</Text> : null}
        </View>
        <View style={[styles.yiJiCol, { backgroundColor: colors.surface }]}>
          <Text style={[styles.yiJiLabel, { color: colors.jiDark }]}>忌</Text>
          {jiStr1 ? <Text style={[styles.yiJiText, { color: colors.subtleText }]}>{jiStr1}</Text> : null}
          {jiStr2 ? <Text style={[styles.yiJiText, { color: colors.subtleText }]}>{jiStr2}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLeft: {
    flex: 1,
    gap: 2,
  },
  dateNum: {
    ...Typography.dateSummary,
  },
  festival: {
    ...Typography.subtitle,
    fontFamily: Fonts.interMedium,
  },
  ganzhi: {
    ...Typography.subtitle,
  },
  yiJiRow: {
    flexDirection: 'row',
    gap: 12,
  },
  yiJiCol: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  yiJiLabel: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 16,
  },
  yiJiText: {
    ...Typography.subtitle,
  },
});
