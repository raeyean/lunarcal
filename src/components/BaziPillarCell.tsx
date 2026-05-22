import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { BaziPillar } from '@lunarcal/shared';

interface Props {
  label: '年柱' | '月柱' | '日柱' | '時柱';
  pillar: BaziPillar | null;     // null when time unknown
  emphasize?: boolean;            // day pillar
  unknown?: boolean;              // time + hasTime=false
}

export function BaziPillarCell({ label, pillar, emphasize, unknown }: Props) {
  const { colors } = useTheme();

  if (unknown || !pillar) {
    return (
      <View
        style={[styles.cell, { backgroundColor: colors.surface, borderColor: colors.line }]}
        accessibilityLabel={`${label} 時辰未知`}
      >
        <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
        <Text style={[styles.unknownText, { color: colors.muted }]}>時辰未知</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.cell,
        { backgroundColor: colors.surface, borderColor: emphasize ? colors.primary : colors.line },
        emphasize && styles.emphasized,
      ]}
      accessibilityLabel={`${label} ${pillar.ganZhi}`}
    >
      <Text style={[styles.label, { color: emphasize ? colors.primary : colors.muted }]}>
        {emphasize ? '日主' : label}
      </Text>
      <Text style={[styles.gan, { color: colors.primary }]}>{pillar.gan}</Text>
      <Text style={[styles.zhi, { color: colors.foreground }]}>{pillar.zhi}</Text>
      <Text style={[styles.nayin, { color: colors.muted }]} numberOfLines={1}>
        {pillar.naYin}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    minHeight: 96,
  },
  emphasized: { borderWidth: 2 },
  label: { fontSize: 10, marginBottom: 4 },
  gan: { fontSize: 22, fontWeight: '700', lineHeight: 26 },
  zhi: { fontSize: 18, lineHeight: 22, marginTop: 2 },
  nayin: { fontSize: 9, marginTop: 6 },
  unknownText: { fontSize: 11, marginTop: 24 },
});
