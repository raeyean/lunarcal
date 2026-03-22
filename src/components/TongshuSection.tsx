import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { Badge } from './Badge';
import type { TongshuData } from '../utils/lunar';

interface TongshuSectionProps {
  data: TongshuData;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.subtleText }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

function TagRow({ label, items, color }: { label: string; items: string[]; color?: string }) {
  const { colors } = useTheme();
  if (items.length === 0) return null;
  return (
    <View style={styles.tagSection}>
      <Text style={[styles.tagLabel, { color: colors.subtleText }]}>{label}</Text>
      <View style={styles.tagRow}>
        {items.map((item, idx) => (
          <View key={idx} style={[styles.tag, { backgroundColor: color || colors.badgeBg }]}>
            <Text style={[styles.tagText, { color: color ? colors.white : colors.foreground }]}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function TongshuSection({ data }: TongshuSectionProps) {
  const { colors } = useTheme();

  const tianShenColor = data.tianShenLuck === '吉'
    ? colors.primary
    : colors.subtleText;

  return (
    <View style={styles.wrapper}>
      {/* 建除十二神 & 天神 */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>值日星神</Text>
        <View style={styles.starRow}>
          <View style={[styles.starChip, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.starLabel, { color: colors.primary }]}>{data.zhiXing}</Text>
          </View>
          <View style={[styles.starChip, { backgroundColor: data.tianShenLuck === '吉' ? colors.primaryLight : colors.badgeBg }]}>
            <Text style={[styles.starLabel, { color: tianShenColor }]}>
              {data.tianShen}（{data.tianShenType}·{data.tianShenLuck}）
            </Text>
          </View>
        </View>
        <View style={styles.starRow}>
          <Badge label={`${data.xiu}宿 · ${data.xiuLuck}`} />
          <Badge label={`月相：${data.yueXiang}`} />
          <Badge label={data.liuYao} />
        </View>
      </View>

      {/* 吉神宜趨 / 凶煞宜忌 */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <TagRow
          label="吉神宜趨"
          items={data.jiShen}
          color={colors.jiShen}
        />
        <TagRow
          label="凶煞宜忌"
          items={data.xiongSha}
        />
      </View>

      {/* 方位 */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>吉神方位</Text>
        <InfoRow label="喜神" value={data.positionXi} />
        <InfoRow label="財神" value={data.positionCai} />
        <InfoRow label="福神" value={data.positionFu} />
      </View>

      {/* 彭祖百忌 */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>彭祖百忌</Text>
        <Text style={[styles.pengzu, { color: colors.foreground }]}>{data.pengzuGan}</Text>
        <Text style={[styles.pengzu, { color: colors.foreground }]}>{data.pengzuZhi}</Text>
      </View>

      {/* 其他資訊 */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>其他</Text>
        <InfoRow label="日祿" value={data.dayLu} />
        <InfoRow label="物候" value={data.wuHou} />
        {data.xiuSong ? (
          <View style={styles.songSection}>
            <Text style={[styles.tagLabel, { color: colors.subtleText }]}>{data.xiu}宿歌</Text>
            <Text style={[styles.songText, { color: colors.subtleText }]}>{data.xiuSong}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
  },
  starRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  starChip: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  starLabel: {
    ...Typography.bodyMedium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    ...Typography.bodyMedium,
    width: 36,
  },
  infoValue: {
    ...Typography.bodyMedium,
    flex: 1,
  },
  tagSection: {
    gap: 8,
  },
  tagLabel: {
    ...Typography.body,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tagText: {
    ...Typography.badgeText,
  },
  pengzu: {
    ...Typography.bodyMedium,
    lineHeight: 20,
  },
  songSection: {
    gap: 4,
  },
  songText: {
    ...Typography.body,
    lineHeight: 18,
  },
});
