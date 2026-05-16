import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { Badge } from './Badge';
import { Chevron } from './Chevron';
import type { GlossaryTermId } from './GlossarySheet';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ClashSectionProps {
  animal: string;
  emoji: string;
  description: string;
  direction: string;
  element: string;
  taishen: string;
  onOpenGlossary?: (term: GlossaryTermId) => void;
}

const STORAGE_KEY = 'clash.expanded';

export function ClashSection({ animal, emoji, description, direction, element, taishen }: ClashSectionProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === '1') setExpanded(true);
        setHydrated(true);
      })
      .catch(err => {
        console.warn('Failed to load clash section state:', err);
        setHydrated(true);
      });
  }, []);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = !expanded;
    setExpanded(next);
    AsyncStorage.setItem(STORAGE_KEY, next ? '1' : '0').catch(err =>
      console.warn('Failed to save clash section state:', err),
    );
  };

  const summary = `${animal} · ${direction}`;

  if (!hydrated) {
    return <View style={[styles.container, { backgroundColor: colors.surface }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Pressable
        onPress={toggle}
        style={styles.header}
        accessibilityRole="button"
        accessibilityLabel={`相冲生肖, ${expanded ? '已展開' : '已收起'}`}
        accessibilityState={{ expanded }}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>相冲生肖</Text>
        <View style={styles.chevron}>
          <Chevron expanded={expanded} size={14} color={colors.subtleText} />
        </View>
      </Pressable>
      {expanded ? (
        <>
          <View style={styles.animalRow}>
            <View style={[styles.emojiCircle, { backgroundColor: colors.background }]}>
              <Text style={styles.emoji}>{emoji}</Text>
            </View>
            <View style={styles.detail}>
              <Text style={[styles.clashName, { color: colors.foreground }]}>{animal}</Text>
              <Text style={[styles.clashDesc, { color: colors.subtleText }]}>{description}</Text>
            </View>
          </View>
          <View style={styles.badges}>
            <Badge label={direction} />
            <Badge label={`胎神：${taishen}`} />
            <Badge label={element} />
          </View>
        </>
      ) : (
        <Text style={[styles.summary, { color: colors.subtleText }]} numberOfLines={1}>{summary}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
  },
  chevron: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    ...Typography.body,
  },
  animalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28, // circle
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  detail: {
    flex: 1,
    gap: Spacing.xs,
  },
  clashName: {
    ...Typography.clashName,
  },
  clashDesc: {
    ...Typography.body,
    lineHeight: 17,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
