import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { MoreChip } from './MoreChip';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface YiJiCardProps {
  type: 'yi' | 'ji';
  items: string[];
}

const COLLAPSED_LIMIT = 6;

export function YiJiCard({ type, items }: YiJiCardProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const isYi = type === 'yi';
  const accentColor = isYi ? colors.primary : colors.jiDark;
  const title = isYi ? '宜' : '忌';

  const visibleItems = expanded ? items : items.slice(0, COLLAPSED_LIMIT);
  const remaining = Math.max(0, items.length - COLLAPSED_LIMIT);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
      </View>
      {visibleItems.map((item, idx) => (
        <Text key={idx} style={[styles.item, { color: colors.foreground }]}>{item}</Text>
      ))}
      {remaining > 0 ? (
        <MoreChip
          label={expanded ? '收起' : `+${remaining} 更多`}
          onPress={toggle}
          accessibilityLabel={expanded ? '收起列表' : `展開更多 ${remaining} 項`}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  accentBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  title: {
    ...Typography.cardTitle,
  },
  item: {
    ...Typography.bodyMedium,
  },
});
