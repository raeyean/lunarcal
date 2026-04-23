import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography, Fonts } from '../constants/typography';

interface TogglePillProps {
  activeTab: 'daily' | 'calendar';
  onToggle: (tab: 'daily' | 'calendar') => void;
}

export function TogglePill({ activeTab, onToggle }: TogglePillProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'daily' && { backgroundColor: colors.primary }]}
        onPress={() => onToggle('daily')}
        activeOpacity={0.6}
        accessibilityRole="tab"
        accessibilityLabel="日詳"
        accessibilityState={{ selected: activeTab === 'daily' }}
      >
        <Text style={[styles.tabText, { color: colors.muted }, activeTab === 'daily' && { color: colors.white }]}>
          日詳
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'calendar' && { backgroundColor: colors.primary }]}
        onPress={() => onToggle('calendar')}
        activeOpacity={0.6}
        accessibilityRole="tab"
        accessibilityLabel="月曆"
        accessibilityState={{ selected: activeTab === 'calendar' }}
      >
        <Text style={[styles.tabText, { color: colors.muted }, activeTab === 'calendar' && { color: colors.white }]}>
          月曆
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 4,
    maxWidth: 240,
    width: '60%',
    height: 40,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  tabText: {
    ...Typography.toggleActive,
    fontFamily: Fonts.outfitMedium,
  },
});
