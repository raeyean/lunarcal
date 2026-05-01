import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { InfoBadge } from './InfoBadge';
import { IconButton } from './IconButton';
import { HelpIcon } from './HelpIcon';
import type { GlossaryTermId } from './GlossarySheet';

interface JieqiBannerProps {
  text: string;
  onPress?: (text: string) => void;
  onOpenGlossary?: (termId: GlossaryTermId) => void;
}

export function JieqiBanner({ text, onPress, onOpenGlossary }: JieqiBannerProps) {
  const { colors } = useTheme();

  if (!text) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.primaryLight }]}>
      <TouchableOpacity
        style={styles.tapRegion}
        onPress={() => onPress?.(text)}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel={text}
        accessibilityHint="點擊查看詳情"
      >
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.text, { color: colors.primary }]}>{text}</Text>
        <View style={styles.badgeWrap}>
          <InfoBadge tint={colors.primary} />
        </View>
      </TouchableOpacity>
      <IconButton
        variant="ghost"
        accessibilityLabel="關於節氣"
        accessibilityHint="點擊查看詳情"
        onPress={() => onOpenGlossary?.('jieqi')}
        style={styles.helpButton}
        hitSlop={{ top: 8, bottom: 8, left: 0, right: 8 }}
      >
        <HelpIcon size={16} color={colors.primary} />
      </IconButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
  },
  tapRegion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4, // circle
  },
  text: {
    ...Typography.jieqiBanner,
    flexShrink: 1,
  },
  badgeWrap: {
    marginLeft: 'auto',
  },
  helpButton: {
    minWidth: 36,
    minHeight: 36,
    marginLeft: Spacing.xs,
  },
});
