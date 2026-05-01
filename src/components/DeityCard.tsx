import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { DEITY_LABEL, deityColor, type DeityKind } from '../constants/colors';
import type { DeityDay } from '../data/deityDays';
import { Fonts } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';

interface DeityCardProps {
  deity: DeityDay;
  /** Optional traditional practices line, e.g. 宜焚香·誦經·布施·放生 */
  practices?: string;
}

/** Sacred-day card — used on daily editorial view + date detail. */
export function DeityCard({ deity, practices = '宜焚香 · 誦經 · 布施 · 放生' }: DeityCardProps) {
  const { colors } = useTheme();
  const c = deityColor(deity.kind, colors);
  return (
    <View style={[styles.wrap, { backgroundColor: c + '1a', borderColor: c + '33' }]}>
      <View style={[styles.badge, { backgroundColor: c }]}>
        <Text style={styles.glyph}>{deity.deity[0]}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.kicker, { color: c }]}>
          {DEITY_LABEL[deity.kind]} · 神聖之日
        </Text>
        <Text style={[styles.name, { color: colors.foreground }]}>{deity.name}</Text>
        <Text style={[styles.practices, { color: colors.subtleText }]}>{practices}</Text>
      </View>
    </View>
  );
}

interface UpcomingDeityProps {
  deity: DeityDay;
  daysAway: number;
  /** lunar.monthCn / lunar.dayCn for the upcoming date — short label e.g. "三/十五" */
  lunarLabel: string;
}

/** Dashed teaser shown on daily view when today isn't a deity day. */
export function UpcomingDeity({ deity, daysAway, lunarLabel }: UpcomingDeityProps) {
  const { colors } = useTheme();
  const c = deityColor(deity.kind, colors);
  return (
    <View style={[styles.upcomingWrap, { borderColor: c + '99' }]}>
      <View style={[styles.upcomingBadge, { borderColor: c }]}>
        <Text style={[styles.upcomingGlyph, { color: c }]}>{deity.deity[0]}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.kickerMono, { color: colors.muted }]}>
          即將來臨 · {daysAway}日後
        </Text>
        <Text style={[styles.upcomingName, { color: colors.foreground }]}>{deity.name}</Text>
      </View>
      <Text style={[styles.lunarBadge, { color: c }]}>{lunarLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    color: '#fff',
    fontSize: 22,
    fontFamily: Fonts.outfitExtraBold,
  },
  body: {
    flex: 1,
  },
  kicker: {
    fontFamily: Fonts.interSemiBold,
    fontSize: 9,
    letterSpacing: 1.6,
  },
  kickerMono: {
    fontFamily: Fonts.interMedium,
    fontSize: 9,
    letterSpacing: 1.6,
  },
  name: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 16,
    marginTop: 3,
    lineHeight: 22,
  },
  practices: {
    fontFamily: Fonts.inter,
    fontSize: 11,
    marginTop: 2,
  },
  upcomingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  upcomingBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  upcomingGlyph: {
    fontSize: 18,
    fontFamily: Fonts.outfitExtraBold,
  },
  upcomingName: {
    fontFamily: Fonts.outfitBold,
    fontSize: 14,
    marginTop: 2,
  },
  lunarBadge: {
    fontFamily: Fonts.interSemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
  },
});
