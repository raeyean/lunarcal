import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import type { ShichenSlot } from '../utils/lunar';

interface ShichenSheetProps {
  visible: boolean;
  shichen: ShichenSlot[];
  onClose: () => void;
}

const EXPLAIN = '十二時辰將一晝夜分為十二段，每段兩小時，由地支命名。古人據干支與當日值神判斷吉、凶、中三等，作擇時參考。';

export function ShichenSheet({ visible, shichen, onClose }: ShichenSheetProps) {
  const { colors } = useTheme();

  const luckColor = (luck: ShichenSlot['luck']): string =>
    luck === '吉' ? colors.primary : luck === '凶' ? colors.ji : colors.muted;
  const luckBg = (luck: ShichenSlot['luck']): string =>
    luck === '吉' ? colors.primaryLight : luck === '凶' ? colors.badgeBg : colors.surface;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, { backgroundColor: colors.overlay }]} />
      </TouchableWithoutFeedback>
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <View style={styles.handle}>
            <View style={[styles.handleBar, { backgroundColor: colors.line }]} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>十二時辰</Text>
          <Text style={[styles.explain, { color: colors.subtleText }]}>{EXPLAIN}</Text>

          <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
            {shichen.map(s => (
              <View
                key={s.name}
                style={[styles.row, { borderBottomColor: colors.lineSoft }]}
              >
                <View style={styles.rowLeft}>
                  <Text style={[styles.shichenName, { color: colors.foreground }]}>{s.name}</Text>
                  <Text style={[styles.shichenLabel, { color: colors.subtleText }]}>{s.label}</Text>
                </View>
                <View style={styles.rowMid}>
                  <Text style={[styles.range, { color: colors.foreground }]}>{s.range}</Text>
                  <Text style={[styles.ganzhi, { color: colors.muted }]}>{s.ganzhi}</Text>
                </View>
                <View style={[styles.luckChip, { backgroundColor: luckBg(s.luck) }]}>
                  <Text style={[styles.luckText, { color: luckColor(s.luck) }]}>{s.luck}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  handle: {
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 22,
    marginBottom: Spacing.sm,
  },
  explain: {
    fontFamily: Fonts.interMedium,
    fontSize: 12,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },
  rowLeft: {
    width: 80,
  },
  shichenName: {
    fontFamily: Fonts.outfitBold,
    fontSize: 16,
    lineHeight: 22,
  },
  shichenLabel: {
    fontFamily: Fonts.interMedium,
    fontSize: 11,
    marginTop: 1,
  },
  rowMid: {
    flex: 1,
  },
  range: {
    fontFamily: Fonts.interSemiBold,
    fontSize: 13,
  },
  ganzhi: {
    fontFamily: Fonts.interMedium,
    fontSize: 11,
    marginTop: 2,
  },
  luckChip: {
    minWidth: 36,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  luckText: {
    fontFamily: Fonts.outfitBold,
    fontSize: 14,
  },
});
