import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { IconButton } from './IconButton';

interface MonthHeaderProps {
  titleCn: string;
  titleEn: string;
  onPrev: () => void;
  onNext: () => void;
}

const SWIPE_HINT_KEY = 'calendarSwipeHintShown';

export function MonthHeader({ titleCn, titleEn, onPrev, onNext }: MonthHeaderProps) {
  const { colors } = useTheme();
  const [hintVisible, setHintVisible] = useState(false);
  const hintOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const seen = await AsyncStorage.getItem(SWIPE_HINT_KEY);
        if (seen || cancelled) return;
        setHintVisible(true);
        Animated.timing(hintOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => {
            Animated.timing(hintOpacity, {
              toValue: 0,
              duration: 350,
              useNativeDriver: true,
            }).start(() => {
              if (!cancelled) setHintVisible(false);
            });
          }, 2500);
        });
        await AsyncStorage.setItem(SWIPE_HINT_KEY, '1');
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hintOpacity]);

  return (
    <View style={styles.container}>
      <IconButton
        onPress={onPrev}
        accessibilityLabel="上一月"
        variant="ghost"
      >
        <Text style={[styles.arrow, { color: colors.foreground }]}>‹</Text>
      </IconButton>
      <View style={styles.titleGroup}>
        <Text style={[styles.titleCn, { color: colors.foreground }]}>{titleCn}</Text>
      </View>
      <IconButton
        onPress={onNext}
        accessibilityLabel="下一月"
        variant="ghost"
      >
        <Text style={[styles.arrow, { color: colors.foreground }]}>›</Text>
      </IconButton>
      {hintVisible ? (
        <View pointerEvents="none" style={styles.hintWrap}>
          <Animated.View
            style={[
              styles.hintChip,
              {
                backgroundColor: colors.muted + '20',
                opacity: hintOpacity,
              },
            ]}
          >
            <Text style={[styles.hintText, { color: colors.subtleText }]}>
              ← 滑動切換月份 →
            </Text>
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  titleGroup: {
    alignItems: 'center',
    gap: 2,
  },
  titleCn: {
    ...Typography.screenHeader,
  },
  titleEn: {
    ...Typography.monthEnglish,
  },
  arrow: {
    fontSize: 28,
    fontWeight: '300',
  },
  hintWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintChip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    ...Typography.badgeText,
  },
});
