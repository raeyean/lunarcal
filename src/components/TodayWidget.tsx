import React, { useRef, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { getDayData } from '../utils/lunar';
import { Fonts } from '../constants/typography';

interface TodayWidgetProps {
  visible: boolean;
  onDismiss: () => void;
  onDismissToday: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_THRESHOLD = 150;

export function TodayWidget({ visible, onDismiss, onDismissToday }: TodayWidgetProps) {
  const { colors, isDark } = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;

  const animatedOpacity = translateY.interpolate({
    inputRange: [0, SCREEN_HEIGHT * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const today = useMemo(() => {
    const now = new Date();
    return getDayData(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onMoveShouldSetPanResponderCapture: (_, gestureState) =>
        gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
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
            onDismiss();
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
    })
  ).current;

  const { ganzhi, lunar, yi, ji } = today;
  const yiItems = yi.slice(0, 3);
  const jiItems = ji.slice(0, 3);

  const gradientColors: [string, string] = isDark
    ? [`${colors.primary}40`, colors.background]
    : [colors.primaryLight, colors.background];

  const subCardYiBg = `${colors.primary}${isDark ? '1F' : '14'}`;
  const subCardYiBorder = `${colors.primary}${isDark ? '40' : '33'}`;
  const subCardJiBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
  const subCardJiBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.backdrop, { backgroundColor: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.5)' }]}>
        <Animated.View
          style={[styles.cardWrapper, { transform: [{ translateY }], opacity: animatedOpacity }]}
          {...panResponder.panHandlers}
        >
          <LinearGradient colors={gradientColors} style={[styles.card, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
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
                  <Text key={idx} style={[styles.subCardItem, { color: colors.foreground }]}>{item}</Text>
                ))}
              </View>
              <View style={[styles.subCard, { backgroundColor: subCardJiBg, borderColor: subCardJiBorder }]}>
                <Text style={[styles.subCardTitle, { color: colors.jiDark }]}>忌</Text>
                {jiItems.map((item, idx) => (
                  <Text key={idx} style={[styles.subCardItem, { color: colors.foreground }]}>{item}</Text>
                ))}
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
    padding: 24,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 380,
  },
  card: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    gap: 8,
  },
  label: {
    fontFamily: Fonts.interMedium,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroGanzhi: {
    fontFamily: Fonts.outfitBlack,
    fontSize: 36,
    letterSpacing: 4,
  },
  subtitle: {
    fontFamily: Fonts.inter,
    fontSize: 12,
    marginBottom: 16,
  },
  yiJiRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  subCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    gap: 6,
  },
  subCardTitle: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 18,
    marginBottom: 4,
  },
  subCardItem: {
    fontFamily: Fonts.interMedium,
    fontSize: 13,
    lineHeight: 20,
  },
  hint: {
    fontFamily: Fonts.inter,
    fontSize: 11,
    marginTop: 16,
  },
  dismissToday: {
    fontFamily: Fonts.interMedium,
    fontSize: 12,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
});
