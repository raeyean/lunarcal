import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { Spacing } from '../constants/spacing';

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

export function BottomTabBar({ active, onChange }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        { backgroundColor: colors.background, borderTopColor: colors.line, paddingBottom: Spacing.md + insets.bottom },
      ]}
    >
      {TABS.map((t) => {
        const selected = t.key === active;
        const iconName = selected ? t.iconActive : t.icon;
        const iconColor = selected ? colors.primary : colors.muted;

        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={t.label}
          >
            <Ionicons name={iconName} size={22} color={iconColor} />
            <Text style={[styles.label, { color: iconColor }]}>{t.label}</Text>
          </Pressable>
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
