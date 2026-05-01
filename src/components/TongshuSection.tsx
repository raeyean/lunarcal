import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { Badge } from './Badge';
import { IconButton } from './IconButton';
import type { TongshuData } from '../utils/lunar';
import type { GlossaryTermId } from './GlossarySheet';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TongshuSectionProps {
  data: TongshuData;
  onOpenGlossary?: (term: GlossaryTermId) => void;
}

type CardKey = 'jianchu' | 'jishen' | 'fangwei' | 'pengzu' | 'qita';

const STORAGE_PREFIX = 'tongshu.expanded.';

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

interface CollapsibleCardProps {
  cardKey: CardKey;
  title: string;
  summary: string;
  termId?: GlossaryTermId;
  onOpenGlossary?: (term: GlossaryTermId) => void;
  children: React.ReactNode;
}

function CollapsibleCard({ cardKey, title, summary, termId, onOpenGlossary, children }: CollapsibleCardProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_PREFIX + cardKey).then((v) => {
      if (v === '1') setExpanded(true);
      setHydrated(true);
    });
  }, [cardKey]);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = !expanded;
    setExpanded(next);
    AsyncStorage.setItem(STORAGE_PREFIX + cardKey, next ? '1' : '0');
  };

  if (!hydrated) {
    return <View style={[styles.card, { backgroundColor: colors.surface }]} />;
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <Pressable
          onPress={toggle}
          style={styles.cardHeaderTap}
          accessibilityRole="button"
          accessibilityLabel={`${title}, ${expanded ? '已展開' : '已收起'}`}
          accessibilityState={{ expanded }}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
          <Text style={[styles.chevron, { color: colors.subtleText }]}>{expanded ? '▴' : '▾'}</Text>
        </Pressable>
        {termId && onOpenGlossary ? (
          <IconButton
            onPress={() => onOpenGlossary(termId)}
            accessibilityLabel={`${title} 說明`}
            variant="ghost"
            style={styles.glossaryButton}
            hitSlop={{ top: 8, bottom: 8, left: 0, right: 8 }}
          >
            <Text style={[styles.glossaryGlyph, { color: colors.subtleText }]}>?</Text>
          </IconButton>
        ) : null}
      </View>
      {expanded ? (
        <View style={styles.cardBody}>{children}</View>
      ) : (
        <Text style={[styles.summary, { color: colors.subtleText }]} numberOfLines={1}>
          {summary || '點擊展開'}
        </Text>
      )}
    </View>
  );
}

export function TongshuSection({ data, onOpenGlossary }: TongshuSectionProps) {
  const { colors } = useTheme();

  const tianShenColor = data.tianShenLuck === '吉' ? colors.primary : colors.subtleText;

  const summaries: Record<CardKey, string> = {
    jianchu: `${data.zhiXing} · ${data.tianShen}（${data.tianShenLuck}）`,
    jishen: `吉神 ${data.jiShen.length} · 凶煞 ${data.xiongSha.length}`,
    fangwei: `喜 ${data.positionXi} · 財 ${data.positionCai}`,
    pengzu: data.pengzuGan,
    qita: `日祿 ${data.dayLu}`,
  };

  return (
    <View style={styles.wrapper}>
      <CollapsibleCard
        cardKey="jianchu"
        title="值日星神"
        summary={summaries.jianchu}
        termId="jianChu"
        onOpenGlossary={onOpenGlossary}
      >
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
      </CollapsibleCard>

      <CollapsibleCard
        cardKey="jishen"
        title="吉神 / 凶煞"
        summary={summaries.jishen}
        termId="jiShen"
        onOpenGlossary={onOpenGlossary}
      >
        <TagRow label="吉神宜趨" items={data.jiShen} color={colors.jiShen} />
        <TagRow label="凶煞宜忌" items={data.xiongSha} />
      </CollapsibleCard>

      <CollapsibleCard
        cardKey="fangwei"
        title="吉神方位"
        summary={summaries.fangwei}
        termId="fangwei"
        onOpenGlossary={onOpenGlossary}
      >
        <InfoRow label="喜神" value={data.positionXi} />
        <InfoRow label="財神" value={data.positionCai} />
        <InfoRow label="福神" value={data.positionFu} />
      </CollapsibleCard>

      <CollapsibleCard
        cardKey="pengzu"
        title="彭祖百忌"
        summary={summaries.pengzu}
        termId="pengZuBaiJi"
        onOpenGlossary={onOpenGlossary}
      >
        <Text style={[styles.pengzu, { color: colors.foreground }]}>{data.pengzuGan}</Text>
        <Text style={[styles.pengzu, { color: colors.foreground }]}>{data.pengzuZhi}</Text>
      </CollapsibleCard>

      <CollapsibleCard
        cardKey="qita"
        title="其他"
        summary={summaries.qita}
        termId="xiuSong"
        onOpenGlossary={onOpenGlossary}
      >
        <InfoRow label="日祿" value={data.dayLu} />
        <InfoRow label="物候" value={data.wuHou} />
        {data.xiuSong ? (
          <View style={styles.songSection}>
            <Text style={[styles.tagLabel, { color: colors.subtleText }]}>{data.xiu}宿歌</Text>
            <Text style={[styles.songText, { color: colors.subtleText }]}>{data.xiuSong}</Text>
          </View>
        ) : null}
      </CollapsibleCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.md,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.md,
  },
  cardBody: {
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
  },
  chevron: {
    fontSize: 20,
    lineHeight: 22,
    paddingHorizontal: Spacing.xs,
  },
  glossaryButton: {
    minWidth: 32,
    minHeight: 32,
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  glossaryGlyph: {
    fontSize: 16,
    fontWeight: '600',
  },
  summary: {
    ...Typography.body,
  },
  starRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  starChip: {
    borderRadius: Radius.sm,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
  },
  starLabel: {
    ...Typography.bodyMedium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
    gap: Spacing.sm,
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
    borderRadius: Radius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  tagText: {
    ...Typography.badgeText,
  },
  pengzu: {
    ...Typography.bodyMedium,
    lineHeight: 20,
  },
  songSection: {
    gap: Spacing.xs,
  },
  songText: {
    ...Typography.body,
    lineHeight: 18,
  },
});
