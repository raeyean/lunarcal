import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { BaziPillarCell } from './BaziPillarCell';
import type { BaziChart as BaziChartShape } from '@lunarcal/shared';

interface Props {
  bazi: BaziChartShape;
}

export function BaziChart({ bazi }: Props) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View>
      <View style={styles.grid}>
        <BaziPillarCell label="年柱" pillar={bazi.year} />
        <View style={styles.spacer} />
        <BaziPillarCell label="月柱" pillar={bazi.month} />
        <View style={styles.spacer} />
        <BaziPillarCell label="日柱" pillar={bazi.day} emphasize />
        <View style={styles.spacer} />
        <BaziPillarCell label="時柱" pillar={bazi.time} unknown={!bazi.hasTime} />
      </View>

      <Pressable
        onPress={() => setExpanded((p) => !p)}
        style={[styles.toggle, { borderTopColor: colors.line }]}
        accessibilityRole="button"
        accessibilityLabel={expanded ? '收起更多資訊' : '顯示更多資訊'}
      >
        <Text style={[styles.toggleText, { color: colors.muted }]}>
          {expanded ? '收起 ▴' : '顯示更多 ▾'}
        </Text>
      </Pressable>

      {expanded && (
        <View style={[styles.detail, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <DetailRow
            label="十神 (天干)"
            values={[
              bazi.year.shiShenGan,
              bazi.month.shiShenGan,
              bazi.day.shiShenGan,
              bazi.time?.shiShenGan ?? '—',
            ]}
            mutedColor={colors.muted}
            textColor={colors.foreground}
          />
          <DetailRow
            label="藏干"
            values={[
              bazi.year.hideGan.join('·') || '—',
              bazi.month.hideGan.join('·') || '—',
              bazi.day.hideGan.join('·') || '—',
              bazi.time?.hideGan.join('·') || '—',
            ]}
            mutedColor={colors.muted}
            textColor={colors.foreground}
          />
          <DetailRow
            label="地勢"
            values={[
              bazi.year.diShi,
              bazi.month.diShi,
              bazi.day.diShi,
              bazi.time?.diShi ?? '—',
            ]}
            mutedColor={colors.muted}
            textColor={colors.foreground}
          />
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.muted }]}>胎元</Text>
            <Text style={[styles.metaValue, { color: colors.foreground }]}>{bazi.taiYuan ?? '—'}</Text>
            <Text style={[styles.metaLabel, { color: colors.muted, marginLeft: 16 }]}>命宮</Text>
            <Text style={[styles.metaValue, { color: colors.foreground }]}>{bazi.mingGong ?? '—'}</Text>
          </View>

          {bazi.daYun ? (
            <View style={styles.daYunBlock}>
              <Text style={[styles.daYunTitle, { color: colors.muted }]}>大運</Text>
              <View style={styles.daYunRow}>
                {bazi.daYun.map((d) => (
                  <View
                    key={d.startAge}
                    style={[styles.daYunCell, { borderColor: colors.line }]}
                  >
                    <Text style={[styles.daYunAge, { color: colors.muted }]}>{d.startAge}歲</Text>
                    <Text style={[styles.daYunGanZhi, { color: colors.foreground }]}>
                      {d.ganZhi}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={[styles.daYunHint, { color: colors.muted }]}>
              {bazi.hasTime ? '選填性別可顯示大運' : '輸入時辰可顯示大運'}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

interface DetailRowProps {
  label: string;
  values: string[];
  mutedColor: string;
  textColor: string;
}

function DetailRow({ label, values, mutedColor, textColor }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: mutedColor }]}>{label}</Text>
      <View style={styles.detailValues}>
        {values.map((v, i) => (
          <Text key={i} style={[styles.detailValue, { color: textColor }]} numberOfLines={1}>
            {v}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', alignItems: 'stretch' },
  spacer: { width: 6 },
  toggle: {
    marginTop: 10,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  toggleText: { ...Typography.microCaption },
  detail: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  detailRow: { marginBottom: 8 },
  detailLabel: { ...Typography.microCaption, marginBottom: 4 },
  detailValues: { flexDirection: 'row', justifyContent: 'space-between' },
  detailValue: { ...Typography.subtitle, flex: 1, textAlign: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaLabel: { ...Typography.microCaption },
  metaValue: { ...Typography.bodyMedium, fontSize: 12, marginLeft: 6 },
  daYunBlock: { marginTop: 10 },
  daYunTitle: { ...Typography.microCaption, marginBottom: 6 },
  daYunRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  daYunCell: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 56,
    alignItems: 'center',
  },
  daYunAge: { ...Typography.microCaption },
  daYunGanZhi: { ...Typography.bodyMedium, fontSize: 13 },
  daYunHint: { ...Typography.subtitle, marginTop: 8, textAlign: 'center', fontStyle: 'italic' },
});
