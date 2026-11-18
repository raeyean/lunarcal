import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { IconButton } from './IconButton';
import { AnimatedSheet } from './AnimatedSheet';

interface EventDetailModalProps {
  visible: boolean;
  name: string;
  description: string;
  onClose: () => void;
}

export function EventDetailModal({ visible, name, description, onClose }: EventDetailModalProps) {
  const { colors } = useTheme();

  return (
    <AnimatedSheet
      visible={visible}
      onClose={onClose}
      style={styles.sheet}
      header={
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>{name}</Text>
          <IconButton onPress={onClose} accessibilityLabel="關閉" variant="ghost">
            <Text style={[styles.closeButton, { color: colors.primary }]}>關閉</Text>
          </IconButton>
        </View>
      }
    >
      <Text style={[styles.description, { color: colors.subtleText }]}>
        {description}
      </Text>
    </AnimatedSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.outfitBold,
    fontSize: 20,
  },
  closeButton: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 16,
  },
  description: {
    fontFamily: Fonts.inter,
    fontSize: 15,
    lineHeight: 24,
  },
});
