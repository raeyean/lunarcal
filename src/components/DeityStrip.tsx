import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { DEITY_LABEL, deityColor } from '../constants/colors';
import { Fonts } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import type { DayData } from '../utils/lunar';

interface DeityStripProps {
  /** Deity days falling in the displayed solar month. */
  days: DayData[];
  onSelect?: (day: number) => void;
}

/** "本月神誕" horizontal strip shown above the monthly grid. */
export function DeityStrip({ days, onSelect }: DeityStripProps) {
  const { colors } = useTheme();
  if (days.length === 0) return null;
  return (
    <View style={styles.wrap}>
      <Text style={[styles.kicker, { color: colors.muted }]}>本月神誕</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        directionalLockEnabled
        alwaysBounceHorizontal
        decelerationRate="fast"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {days.map(d => {
          if (!d.deity) return null;
          const c = deityColor(d.deity.kind, colors);
          return (
            <TouchableOpacity
              key={`${d.solar.year}-${d.solar.month}-${d.solar.day}`}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.line,
                  borderLeftColor: c,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => onSelect?.(d.solar.day)}
              accessibilityRole="button"
              accessibilityLabel={`${d.solar.month}月${d.solar.day}日 ${DEITY_LABEL[d.deity.kind]} ${d.deity.deity}`}
              accessibilityHint="點擊查看當日詳情"
            >
              <View style={styles.cardHead}>
                <Text style={[styles.dayNum, { color: colors.foreground }]}>{d.solar.day}</Text>
                <Text style={[styles.lunar, { color: colors.muted }]}>{d.lunar.dayCn}</Text>
              </View>
              <Text style={[styles.name, { color: c }]} numberOfLines={1}>
                {d.deity.deity}
              </Text>
              <Text style={[styles.kind, { color: colors.subtleText }]}>
                {DEITY_LABEL[d.deity.kind]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  kicker: {
    fontFamily: Fonts.interSemiBold,
    fontSize: 9,
    letterSpacing: 1.6,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  row: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  card: {
    minWidth: 130,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs + 2,
  },
  dayNum: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 18,
    lineHeight: 20,
  },
  lunar: {
    fontFamily: Fonts.interMedium,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  name: {
    fontFamily: Fonts.outfitBold,
    fontSize: 12,
    marginTop: Spacing.xs,
    lineHeight: 16,
  },
  kind: {
    fontFamily: Fonts.inter,
    fontSize: 10,
    marginTop: 1,
  },
});
