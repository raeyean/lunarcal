import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Offset } from '../constants/motion';
import { useMotion } from '../hooks/useMotion';
import { PressableScale } from './PressableScale';

export type TabKey = 'daily' | 'calendar' | 'me';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const TABS: TabConfig[] = [
  { key: 'daily',    label: '今日',  icon: 'calendar-outline',  iconActive: 'calendar' },
  { key: 'calendar', label: '月曆',  icon: 'grid-outline',      iconActive: 'grid' },
  { key: 'me',       label: '我的',  icon: 'person-outline',    iconActive: 'person' },
];

interface Props {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

const PILL_W = 72;
const PILL_H = 48;

function TabIcon({ name, color, selected }: { name: keyof typeof Ionicons.glyphMap; color: string; selected: boolean }) {
  const { spring } = useMotion();
  const scale = useSharedValue(1);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (selected) {
      scale.set(Offset.tabIconScaleFrom);
      scale.set(withSpring(1, spring));
    }
  }, [selected, scale, spring]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <Ionicons name={name} size={22} color={color} />
    </Animated.View>
  );
}

export function BottomTabBar({ active, onChange }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { spring } = useMotion();
  const [barWidth, setBarWidth] = useState(0);
  const pillX = useSharedValue(0);
  const placed = useRef(false);

  const activeIndex = TABS.findIndex((t) => t.key === active);

  useEffect(() => {
    if (barWidth === 0) return;
    const tabW = barWidth / TABS.length;
    const target = activeIndex * tabW + (tabW - PILL_W) / 2;
    if (!placed.current) {
      placed.current = true;
      pillX.set(target);
    } else {
      pillX.set(withSpring(target, spring));
    }
  }, [barWidth, activeIndex, pillX, spring]);

  const pillStyle = useAnimatedStyle(() => ({ transform: [{ translateX: pillX.value }] }));

  return (
    <View
      accessibilityRole="tablist"
      onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      style={[
        styles.bar,
        { backgroundColor: colors.background, borderTopColor: colors.line, paddingBottom: Spacing.md + insets.bottom },
      ]}
    >
      {barWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[styles.pill, { backgroundColor: colors.primarySoft }, pillStyle]}
        />
      )}
      {TABS.map((t) => {
        const selected = t.key === active;
        const iconName = selected ? t.iconActive : t.icon;
        const iconColor = selected ? colors.primary : colors.muted;

        return (
          <PressableScale
            key={t.key}
            onPress={() => onChange(t.key)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={t.label}
          >
            <TabIcon name={iconName} color={iconColor} selected={selected} />
            <Text style={[styles.label, { color: iconColor }]}>{t.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  pill: {
    position: 'absolute',
    top: Spacing.sm - 5,
    left: 0,
    width: PILL_W,
    height: PILL_H,
    borderRadius: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.outfitMedium,
  },
});
