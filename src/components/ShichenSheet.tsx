import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Typography, Fonts } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { IconButton } from './IconButton';
import type { ShichenSlot } from '../utils/lunar';

interface ShichenSheetProps {
  visible: boolean;
  shichen: ShichenSlot[];
  onClose: () => void;
}

const EXPLAIN = '十二時辰將一晝夜分為十二段，每段兩小時，由地支命名。古人據干支與當日值神判斷吉、凶、中三等，作擇時參考。';
const SCREEN_HEIGHT = Dimensions.get('window').height;

export function ShichenSheet({ visible, shichen, onClose }: ShichenSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [modalVisible, setModalVisible] = React.useState(false);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [visible]);

  const luckColor = (luck: ShichenSlot['luck']): string =>
    luck === '吉' ? colors.primary : luck === '凶' ? colors.ji : colors.muted;
  const luckBg = (luck: ShichenSlot['luck']): string =>
    luck === '吉' ? colors.primaryLight : luck === '凶' ? colors.badgeBg : colors.surface;

  return (
    <Modal visible={modalVisible} animationType="none" transparent statusBarTranslucent>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[styles.overlay, { backgroundColor: colors.overlay }]} />
        </TouchableWithoutFeedback>
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              maxHeight: SCREEN_HEIGHT * 0.8,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>十二時辰</Text>
            <IconButton
              onPress={onClose}
              accessibilityLabel="關閉"
              variant="ghost"
              style={styles.closeButton}
            >
              <Text style={[styles.closeGlyph, { color: colors.primary }]}>✕</Text>
            </IconButton>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: Spacing.xl + insets.bottom }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.explain, { color: colors.subtleText }]}>{EXPLAIN}</Text>
            {shichen.map((s, idx) => (
              <View
                key={s.name}
                style={[
                  styles.row,
                  idx < shichen.length - 1 && {
                    borderBottomColor: colors.lineSoft,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  },
                ]}
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
        </Animated.View>
      </View>
    </Modal>
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
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.lg,
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
  explain: {
    fontFamily: Fonts.inter,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
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
    minWidth: 44,
    minHeight: 32,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  luckText: {
    fontFamily: Fonts.outfitBold,
    fontSize: 14,
  },
});
