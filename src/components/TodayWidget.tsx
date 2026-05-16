import React, { useRef, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { getDayData } from '../utils/lunar';
import { Fonts } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { withOpacity } from '../constants/colorUtils';
import { DragHandle } from './DragHandle';
import { MoreChip } from './MoreChip';

interface TodayWidgetProps {
  visible: boolean;
  onDismiss: () => void;
  onDismissToday: () => void;
  onOpenGlossary?: (term: 'yi' | 'ji') => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_THRESHOLD = 200;

export function TodayWidget({ visible, onDismiss, onDismissToday, onOpenGlossary }: TodayWidgetProps) {
  const { colors, isDark } = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  const animatedOpacity = translateY.interpolate({
    inputRange: [0, SCREEN_HEIGHT * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const today = useMemo(() => {
    const now = new Date();
    return getDayData(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderGrant: () => {
          translateY.stopAnimation();
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > DISMISS_THRESHOLD || gestureState.vy > 0.5) {
            Animated.timing(translateY, {
              toValue: SCREEN_HEIGHT,
              duration: 250,
              useNativeDriver: true,
            }).start(() => {
              translateY.setValue(0);
              dismissRef.current();
            });
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              tension: 40,
              friction: 7,
              useNativeDriver: true,
            }).start();
          }
        },
        onPanResponderTerminationRequest: () => false,
        onPanResponderTerminate: () => {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 40,
            friction: 7,
            useNativeDriver: true,
          }).start();
        },
      }),
    [translateY],
  );

  const { ganzhi, lunar, yi, ji } = today;
  const yiItems = yi.slice(0, 6);
  const jiItems = ji.slice(0, 6);

  const gradientColors: [string, string] = isDark
    ? [colors.primaryLight, colors.surfaceElevated]
    : [colors.primaryLight, colors.background];

  const subCardYiBg = isDark ? colors.primaryLight : withOpacity(colors.primary, 0.08);
  const subCardYiBorder = withOpacity(colors.primary, isDark ? 0.38 : 0.2);
  const subCardJiBg = isDark ? colors.chip : colors.subtleSurface;
  const subCardJiBorder = isDark ? colors.divider : colors.subtleBorder;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <Animated.View
          accessible={true}
          accessibilityViewIsModal
          accessibilityLabel="今日一覽"
          accessibilityHint="向下滑動關閉"
          style={[styles.cardWrapper, { transform: [{ translateY }], opacity: animatedOpacity }]}
          {...panResponder.panHandlers}
        >
          <LinearGradient colors={gradientColors} style={[styles.card, { borderColor: colors.subtleBorder }]}>
            <DragHandle />
            <Text style={[styles.label, { color: colors.muted }]}>今日一覽</Text>

            <Text style={[styles.heroGanzhi, { color: colors.primary }]}>
              {ganzhi.day}日
            </Text>

            <Text style={[styles.subtitle, { color: colors.subtleText }]}>
              {ganzhi.year}年 {ganzhi.month}月 | 農曆{lunar.monthCn}月{lunar.dayCn}
            </Text>

            <View style={styles.yiJiRow}>
              <View style={[styles.subCard, { backgroundColor: subCardYiBg, borderColor: subCardYiBorder }]}>
                <Text style={[styles.subCardTitle, { color: colors.primary }]}>宜</Text>
                {yiItems.map((item, idx) => (
                  <Text key={`${item}-${idx}`} style={[styles.subCardItem, { color: colors.foreground }]}>{item}</Text>
                ))}
                {yi.length > 6 && (
                  <MoreChip
                    count={yi.length - 6}
                    onPress={() => { onOpenGlossary?.('yi'); onDismiss(); }}
                    accessibilityLabel={`更多 ${yi.length - 6} 項宜`}
                  />
                )}
              </View>
              <View style={[styles.subCard, { backgroundColor: subCardJiBg, borderColor: subCardJiBorder }]}>
                <Text style={[styles.subCardTitle, { color: colors.jiDark }]}>忌</Text>
                {jiItems.map((item, idx) => (
                  <Text key={`${item}-${idx}`} style={[styles.subCardItem, { color: colors.foreground }]}>{item}</Text>
                ))}
                {ji.length > 6 && (
                  <MoreChip
                    count={ji.length - 6}
                    onPress={() => { onOpenGlossary?.('ji'); onDismiss(); }}
                    accessibilityLabel={`更多 ${ji.length - 6} 項忌`}
                  />
                )}
              </View>
            </View>

            <Text style={[styles.hint, { color: colors.muted }]}>
              向下滑動關閉
            </Text>

            <TouchableOpacity onPress={onDismissToday}>
              <Text style={[styles.dismissToday, { color: colors.subtleText }]}>
                今日不再顯示
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 380,
  },
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.interMedium,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  heroGanzhi: {
    fontFamily: Fonts.outfitBlack,
    fontSize: 36,
    letterSpacing: 4,
  },
  subtitle: {
    fontFamily: Fonts.inter,
    fontSize: 12,
    marginBottom: Spacing.lg,
  },
  yiJiRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  subCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    gap: 6,
  },
  subCardTitle: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 18,
    marginBottom: Spacing.xs,
  },
  subCardItem: {
    fontFamily: Fonts.interMedium,
    fontSize: 13,
    lineHeight: 20,
  },
  hint: {
    fontFamily: Fonts.inter,
    fontSize: 11,
    marginTop: Spacing.lg,
  },
  dismissToday: {
    fontFamily: Fonts.interMedium,
    fontSize: 12,
    marginTop: Spacing.xs,
    textDecorationLine: 'underline',
  },
});
