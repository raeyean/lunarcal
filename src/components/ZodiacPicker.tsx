import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';

const ZODIAC_ANIMALS = [
  { name: '鼠', emoji: '🐀' }, { name: '牛', emoji: '🐂' },
  { name: '虎', emoji: '🐅' }, { name: '兔', emoji: '🐇' },
  { name: '龍', emoji: '🐉' }, { name: '蛇', emoji: '🐍' },
  { name: '馬', emoji: '🐴' }, { name: '羊', emoji: '🐏' },
  { name: '猴', emoji: '🐒' }, { name: '雞', emoji: '🐓' },
  { name: '狗', emoji: '🐕' }, { name: '豬', emoji: '🐖' },
];

interface ZodiacPickerProps {
  selected: string | null;
  onSelect: (animal: string) => void;
  compact?: boolean;
}

export function ZodiacPicker({ selected, onSelect, compact = false }: ZodiacPickerProps) {
  const { colors } = useTheme();

  const cellWidth = compact ? '23%' : '23%';
  const emojiSize = compact ? 20 : 24;
  const labelSize = compact ? 12 : 13;

  return (
    <View style={styles.grid}>
      {ZODIAC_ANIMALS.map(({ name, emoji }) => {
        const isSelected = selected === name;
        return (
          <TouchableOpacity
            key={name}
            style={[
              styles.cell,
              { width: cellWidth as any },
              { backgroundColor: isSelected ? colors.primaryLight : colors.surface },
              isSelected && { borderColor: colors.primary, borderWidth: 2 },
            ]}
            onPress={() => onSelect(name)}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel={`生肖 ${name}`}
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[styles.emoji, { fontSize: emojiSize }]}>{emoji}</Text>
            <Text style={[
              styles.label,
              { fontSize: labelSize },
              { color: isSelected ? colors.primary : colors.foreground },
            ]}>
              {name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cell: {
    aspectRatio: 1,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emoji: {
    marginBottom: Spacing.xs,
  },
  label: {
    fontFamily: Fonts.outfitSemiBold,
  },
});
