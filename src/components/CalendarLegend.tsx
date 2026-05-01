import React from 'react';
import { View, Text, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { IconButton } from './IconButton';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface LegendItem {
  label: string;
  color: string;
}

interface CalendarLegendProps {
  expanded: boolean;
  onToggle: () => void;
}

export function CalendarLegend({ expanded, onToggle }: CalendarLegendProps) {
  const { colors } = useTheme();

  const legendItems: LegendItem[] = [
    { label: '節氣', color: colors.primary },
    { label: '節日', color: colors.festival },
    { label: '今日', color: colors.primary },
    { label: '選中', color: colors.primaryLight },
  ];

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  if (!expanded) {
    return (
      <View style={styles.collapsedContainer}>
        <IconButton
          onPress={handleToggle}
          accessibilityLabel="顯示日曆圖例"
          accessibilityHint="點擊查看日曆顏色說明"
          variant="ghost"
        >
          <Text style={[styles.questionGlyph, { color: colors.muted }]}>?</Text>
        </IconButton>
      </View>
    );
  }

  return (
    <View style={[styles.expandedContainer, { borderColor: colors.divider }]}>
      <View style={styles.row}>
        {legendItems.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendLabel, { color: colors.subtleText }]}>{item.label}</Text>
          </View>
        ))}
        <IconButton
          onPress={handleToggle}
          accessibilityLabel="隱藏日曆圖例"
          variant="ghost"
          style={styles.collapseButton}
        >
          <Text style={[styles.collapseGlyph, { color: colors.muted }]}>✕</Text>
        </IconButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsedContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
  },
  expandedContainer: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
  },
  legendLabel: {
    ...Typography.badgeText,
  },
  questionGlyph: {
    fontSize: 16,
    fontWeight: '600',
  },
  collapseButton: {
    marginLeft: 'auto',
    minWidth: 32,
    minHeight: 32,
  },
  collapseGlyph: {
    fontSize: 12,
  },
});
