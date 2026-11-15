import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Animated, { Easing, Keyframe, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Typography, Fonts } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Stagger, Offset, EASE_OUT } from '../constants/motion';
import { IconButton } from './IconButton';
import { AnimatedSheet } from './AnimatedSheet';
import type { ActivityMeaning } from '../data/activityMeanings';

export type GlossaryTermId =
  | 'tianGanDiZhi'
  | 'jianChu'
  | 'pengZuBaiJi'
  | 'jieqi'
  | 'jiShen'
  | 'yiJi'
  | 'yi'
  | 'ji'
  | 'fangwei'
  | 'xiuSong';

interface GlossaryEntry {
  title: string;
  description: string;
  itemsHeading?: string;
  items?: ActivityMeaning[];
}

const GLOSSARY: Record<GlossaryTermId, GlossaryEntry> = {
  tianGanDiZhi: {
    title: '天干地支',
    description:
      '天干地支 — 中國傳統紀年法。十天干配十二地支，組成六十甲子循環。用於記錄年、月、日、時。',
  },
  jianChu: {
    title: '建除十二神',
    description:
      '建除十二神 — 古代曆法以建、除、滿、平、定、執、破、危、成、收、開、閉十二神輪值，用於判斷每日宜忌。',
  },
  pengZuBaiJi: {
    title: '彭祖百忌',
    description:
      '彭祖百忌 — 相傳彭祖根據天干地支歸納的每日禁忌，提醒在特定日子避免特定行為。',
  },
  jieqi: {
    title: '節氣',
    description:
      '節氣 — 一年分二十四節氣，反映季節氣候變化，指導農事活動。',
  },
  jiShen: {
    title: '吉神宜趨',
    description:
      '吉神宜趨 — 當日當值的吉神方位與宜行之事。',
  },
  yiJi: {
    title: '宜忌',
    description:
      '宜忌 — 根據黃曆判斷當日適合（宜）與不宜（忌）進行的活動。',
  },
  yi: {
    title: '宜',
    description:
      '宜 — 黃曆中當日推薦進行的事項。古人依據天干地支、值日星神、節氣等綜合推算，列出當日順利吉祥之事，提醒擇吉日行事，可順勢而為。',
    itemsHeading: '今日宜事釋義',
  },
  ji: {
    title: '忌',
    description:
      '忌 — 黃曆中當日不宜進行的事項。傳統擇日學認為某些行為在特定日子易遇阻滯或不順，建議避開以免招致沖煞，宜延後或另擇吉日。',
    itemsHeading: '今日忌事釋義',
  },
  fangwei: {
    title: '方位',
    description:
      '方位 — 當日吉凶方位指引，包含財神、喜神、貴神所在。',
  },
  xiuSong: {
    title: '二十八宿',
    description:
      '二十八宿 — 古代天文劃分黃道附近恆星為二十八宿，用於擇日及占卜。',
  },
};

interface GlossarySheetProps {
  visible: boolean;
  termId: GlossaryTermId | null;
  /** Override the items list — e.g. only the day's actual 宜/忌 entries. */
  items?: ActivityMeaning[];
  onClose: () => void;
}

/** Term chip pop-in (#24): 360 ms, first chip after ~140 ms, then +55 ms per chip. */
const CHIP_POP_MS = 360;
const CHIP_FIRST_EXTRA_MS = 60;
const CHIP_STEP_MS = 55;
/** Overshoot easing approximating the prototype spring, cubic-bezier(.34,1.56,.64,1). */
const POP_EASING = Easing.bezier(0.34, 1.56, 0.64, 1);

// Keyframe.delay() mutates the instance, so each index gets its own (cached) keyframe.
const chipPopCache: ReturnType<typeof makeChipPop>[] = [];
function makeChipPop(index: number) {
  return new Keyframe({
    0: { opacity: 0, transform: [{ scale: Offset.cellPopScaleFrom }] },
    40: { opacity: 1, easing: EASE_OUT },
    100: { transform: [{ scale: 1 }], easing: POP_EASING },
  })
    .duration(CHIP_POP_MS)
    .delay(Stagger.base + CHIP_FIRST_EXTRA_MS + index * CHIP_STEP_MS)
    .reduceMotion(ReduceMotion.System);
}
function chipPop(index: number) {
  return (chipPopCache[index] ??= makeChipPop(index));
}

export function GlossarySheet({ visible, termId, items, onClose }: GlossarySheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const entry = termId ? GLOSSARY[termId] : null;
  const displayItems = items ?? entry?.items;

  return (
    <AnimatedSheet
      visible={visible}
      onClose={onClose}
      maxHeight={windowHeight * 0.8}
      style={styles.sheet}
      header={
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {entry?.title ?? ''}
          </Text>
          <IconButton
            onPress={onClose}
            accessibilityLabel="關閉"
            variant="ghost"
            style={styles.closeButton}
          >
            <Text style={[styles.closeGlyph, { color: colors.primary }]}>✕</Text>
          </IconButton>
        </View>
      }
    >
      {entry ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: Spacing.xl + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.description, { color: colors.subtleText }]}>
            {entry.description}
          </Text>
          {displayItems && displayItems.length > 0 ? (
            <View style={styles.itemsBlock}>
              {entry.itemsHeading ? (
                <Text style={[styles.itemsHeading, { color: colors.foreground }]}>
                  {entry.itemsHeading}
                </Text>
              ) : null}
              {displayItems.map((item, idx) => (
                <Animated.View
                  key={item.name}
                  entering={chipPop(idx)}
                  style={[
                    styles.itemRow,
                    idx < displayItems.length - 1 && {
                      borderBottomColor: colors.lineSoft,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.itemName,
                      { color: termId === 'ji' ? colors.ji : colors.primary },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={[styles.itemMeaning, { color: colors.subtleText }]}>
                    {item.meaning}
                  </Text>
                </Animated.View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </AnimatedSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.cardTitle,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
  },
  closeGlyph: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 16,
  },
  scroll: {
    flexGrow: 0,
  },
  description: {
    fontFamily: Fonts.inter,
    fontSize: 15,
    lineHeight: 24,
  },
  itemsBlock: {
    marginTop: Spacing.lg,
  },
  itemsHeading: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 13,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  itemRow: {
    paddingVertical: Spacing.sm + 2,
  },
  itemName: {
    fontFamily: Fonts.outfitBold,
    fontSize: 15,
    marginBottom: 2,
  },
  itemMeaning: {
    fontFamily: Fonts.inter,
    fontSize: 13,
    lineHeight: 20,
  },
});
