import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { Moon } from './Moon';
import { DeityCard, UpcomingDeity } from './DeityCard';
import { CompassRose } from './CompassRose';
import { HelpIcon } from './HelpIcon';
import { ShichenSheet } from './ShichenSheet';
import { GlossarySheet, type GlossaryTermId } from './GlossarySheet';
import { meaningsFor } from '../data/activityMeanings';
import { findUpcomingDeity, type DayData } from '../utils/lunar';

interface EditorialDailyProps {
  day: DayData;
}

const WK = ['日', '一', '二', '三', '四', '五', '六'];

/** Editorial daily-view body — large lunar numeral hero, hairline-divided sections. */
export function EditorialDaily({ day }: EditorialDailyProps) {
  const { colors, isDark } = useTheme();
  const [shichenOpen, setShichenOpen] = useState(false);
  const [glossaryTerm, setGlossaryTerm] = useState<GlossaryTermId | null>(null);
  const dateObj = new Date(day.solar.year, day.solar.month - 1, day.solar.day);
  const dateStr = `${day.solar.year}.${String(day.solar.month).padStart(2, '0')}.${String(day.solar.day).padStart(2, '0')}`;
  const yiItems = day.yi.slice(0, 6);
  const jiItems = day.ji.slice(0, 6);

  const upcoming = useMemo(() => (day.deity ? null : findUpcomingDeity(dateObj, 60)), [day.deity, day.solar.year, day.solar.month, day.solar.day]);

  const glossaryItems = useMemo(() => {
    if (glossaryTerm === 'yi') return meaningsFor(yiItems);
    if (glossaryTerm === 'ji') return meaningsFor(jiItems);
    return undefined;
  }, [glossaryTerm, yiItems, jiItems]);

  return (
    <View style={{ backgroundColor: colors.background }}>
      {/* Top meta */}
      <View style={styles.metaRow}>
        <Text style={[styles.metaText, { color: colors.muted }]}>{dateStr}</Text>
        <Text style={[styles.metaText, { color: colors.muted }]}>星期{WK[dateObj.getDay()]}</Text>
      </View>

      {/* Hero — giant lunar day numeral */}
      <View style={styles.hero}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.heroLabel, { color: colors.subtleText }]}>
            農曆 · {day.lunar.monthCn}月
          </Text>
          <Text style={[styles.heroNumeral, { color: colors.foreground }]}>{day.lunar.dayCn}</Text>
          <Text style={[styles.heroGanzhi, { color: colors.muted }]}>
            {day.ganzhi.year}年 · {day.ganzhi.month}月 · {day.ganzhi.day}日
          </Text>
        </View>
        <View style={{ marginTop: 8 }}>
          <Moon phase={day.phase} size={72} animated theme={isDark ? 'dark' : 'light'} />
        </View>
      </View>

      {/* Hairline divider */}
      <View style={[styles.hairline, { backgroundColor: colors.line }]} />

      {/* 宜 / 忌 split */}
      <View style={[styles.yijiRow, { borderBottomColor: colors.line }]}>
        <View style={[styles.yijiCol, { borderRightColor: colors.line }]}>
          <TouchableOpacity
            style={styles.yijiHead}
            onPress={() => setGlossaryTerm('yi')}
            accessibilityRole="button"
            accessibilityLabel="查看「宜」的說明"
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.yijiBig, { color: colors.primary }]}>宜</Text>
            <HelpIcon size={14} color={colors.muted} />
          </TouchableOpacity>
          <View style={styles.yijiList}>
            {yiItems.map((it, i) => (
              <Text key={`${it}-${i}`} style={[styles.yijiItem, { color: colors.foreground }]}>
                {it}
              </Text>
            ))}
            {day.yi.length > 6 && (
              <Text style={[styles.yijiItem, { color: colors.muted }]}>
                +{day.yi.length - 6} 更多
              </Text>
            )}
          </View>
        </View>
        <View style={styles.yijiColRight}>
          <TouchableOpacity
            style={styles.yijiHead}
            onPress={() => setGlossaryTerm('ji')}
            accessibilityRole="button"
            accessibilityLabel="查看「忌」的說明"
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.yijiBig, { color: colors.ji }]}>忌</Text>
            <HelpIcon size={14} color={colors.muted} />
          </TouchableOpacity>
          <View style={styles.yijiList}>
            {jiItems.map((it, i) => (
              <Text key={`${it}-${i}`} style={[styles.yijiItem, { color: colors.foreground }]}>
                {it}
              </Text>
            ))}
            {day.ji.length > 6 && (
              <Text style={[styles.yijiItem, { color: colors.muted }]}>
                +{day.ji.length - 6} 更多
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Deity card or upcoming teaser */}
      <View style={styles.section}>
        {day.deity ? (
          <DeityCard deity={day.deity} />
        ) : upcoming ? (
          <UpcomingDeity
            deity={upcoming.day.deity!}
            daysAway={upcoming.daysAway}
            lunarLabel={`${upcoming.day.lunar.monthNum}/${upcoming.day.lunar.dayNum}`}
          />
        ) : null}
      </View>

      {/* Stats strip — 五行 冲 煞 宿 */}
      <View style={[styles.statsRow, { borderColor: colors.line }]}>
        {[
          ['五行', day.wuxing],
          ['冲', day.clash.zodiac],
          ['煞', day.clash.sha],
          ['宿', day.xingxiu],
        ].map(([k, v], i) => (
          <View
            key={k}
            style={[
              styles.statCell,
              i < 3 ? { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.line } : null,
            ]}
          >
            <Text style={[styles.statKicker, { color: colors.muted }]}>{(k as string).toUpperCase()}</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{v}</Text>
          </View>
        ))}
      </View>

      {/* 吉时 grid */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <TouchableOpacity
            style={styles.titleWithIcon}
            onPress={() => setShichenOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="查看十二時辰詳情"
            activeOpacity={0.6}
          >
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>吉時</Text>
            <HelpIcon size={15} color={colors.muted} />
          </TouchableOpacity>
        </View>
        <View style={styles.luckyGrid}>
          {(day.luckyHours.length > 0 ? day.luckyHours : day.shichen.slice(0, 4)).map(s => (
            <View
              key={s.name}
              style={[styles.luckyCell, { backgroundColor: colors.surface, borderColor: colors.line }]}
            >
              <View style={styles.luckyHead}>
                <Text style={[styles.luckyName, { color: colors.foreground }]}>{s.name}</Text>
                <Text style={[styles.luckyTag, { color: colors.primary }]}>{s.luck}</Text>
              </View>
              <Text style={[styles.luckyRange, { color: colors.subtleText }]}>{s.range}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 方位 */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <TouchableOpacity
            style={styles.titleWithIcon}
            onPress={() => setGlossaryTerm('fangwei')}
            accessibilityRole="button"
            accessibilityLabel="查看「方位」的說明"
            activeOpacity={0.6}
          >
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>方位</Text>
            <HelpIcon size={15} color={colors.muted} />
          </TouchableOpacity>
        </View>
        <CompassRose directions={day.directions} />
      </View>

      {/* 彭祖百忌 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 8 }]}>彭祖百忌</Text>
        {day.pengzu.map((line, i) => (
          <Text key={i} style={[styles.pengzuLine, { color: colors.subtleText }]}>· {line}</Text>
        ))}
      </View>

      {/* Zodiac conflict pill */}
      <View style={styles.section}>
        <View style={[styles.zodiacPill, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.zodiacGlyph, { color: colors.primary }]}>{day.clash.zodiac}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.zodiacKicker, { color: colors.primary }]}>生肖沖煞</Text>
            <Text style={[styles.zodiacBody, { color: colors.primary }]}>
              屬{day.clash.zodiac}者今日宜靜養
            </Text>
          </View>
        </View>
      </View>

      {/* Swipe hint */}
      <Text style={[styles.swipeHint, { color: colors.muted }]}>← 左右滑動切換日期 →</Text>

      <ShichenSheet
        visible={shichenOpen}
        shichen={day.shichen}
        onClose={() => setShichenOpen(false)}
      />

      <GlossarySheet
        visible={glossaryTerm !== null}
        termId={glossaryTerm}
        items={glossaryItems}
        onClose={() => setGlossaryTerm(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  metaText: {
    fontFamily: Fonts.interMedium,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  heroLabel: {
    fontFamily: Fonts.interMedium,
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroNumeral: {
    fontFamily: Fonts.outfitBlack,
    fontSize: 76,
    lineHeight: 96,
    letterSpacing: -2,
    includeFontPadding: false,
  },
  heroGanzhi: {
    fontFamily: Fonts.interMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    marginTop: 10,
  },
  hairline: {
    height: 1,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  yijiRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  yijiCol: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingRight: 14,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  yijiColRight: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingLeft: 14,
  },
  yijiHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  yijiBig: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 28,
    lineHeight: 36,
    includeFontPadding: false,
  },
  yijiKicker: {
    fontFamily: Fonts.interMedium,
    fontSize: 9,
    letterSpacing: 1.6,
  },
  yijiList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 10,
    rowGap: 4,
  },
  yijiItem: {
    fontFamily: Fonts.interMedium,
    fontSize: 14,
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.outfitBold,
    fontSize: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionKicker: {
    fontFamily: Fonts.interMedium,
    fontSize: 9,
    letterSpacing: 1.6,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statCell: {
    flex: 1,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
  },
  statKicker: {
    fontFamily: Fonts.interMedium,
    fontSize: 9,
    letterSpacing: 1.6,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: Fonts.outfitBold,
    fontSize: 20,
  },
  luckyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  luckyCell: {
    width: '48.5%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  luckyHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  luckyName: {
    fontFamily: Fonts.outfitBold,
    fontSize: 16,
  },
  luckyTag: {
    fontFamily: Fonts.interSemiBold,
    fontSize: 11,
  },
  luckyRange: {
    fontFamily: Fonts.interMedium,
    fontSize: 10,
    letterSpacing: 0.6,
    marginTop: 2,
  },
  pengzuLine: {
    fontFamily: Fonts.interMedium,
    fontSize: 13,
    lineHeight: 24,
  },
  zodiacPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.md,
  },
  zodiacGlyph: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 32,
    lineHeight: 40,
    includeFontPadding: false,
  },
  zodiacKicker: {
    fontFamily: Fonts.interSemiBold,
    fontSize: 11,
    letterSpacing: 1.6,
    opacity: 0.85,
  },
  zodiacBody: {
    fontFamily: Fonts.outfitBold,
    fontSize: 13,
    marginTop: 2,
  },
  swipeHint: {
    fontFamily: Fonts.interMedium,
    fontSize: 9,
    letterSpacing: 1.5,
    textAlign: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
});
