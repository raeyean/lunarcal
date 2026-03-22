import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';

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
}

export function ZodiacPicker({ selected, onSelect }: ZodiacPickerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.grid}>
      {ZODIAC_ANIMALS.map(({ name, emoji }) => {
        const isSelected = selected === name;
        return (
          <TouchableOpacity
            key={name}
            style={[
              styles.cell,
              { backgroundColor: isSelected ? colors.primaryLight : colors.surface },
              isSelected && { borderColor: colors.primary, borderWidth: 2 },
            ]}
            onPress={() => onSelect(name)}
            activeOpacity={0.6}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={[
              styles.label,
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
    gap: 8,
  },
  cell: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 13,
  },
});
