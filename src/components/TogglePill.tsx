import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Fonts } from '../constants/typography';

interface TogglePillProps {
  activeTab: 'daily' | 'calendar';
  onToggle: (tab: 'daily' | 'calendar') => void;
}

export function TogglePill({ activeTab, onToggle }: TogglePillProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'daily' && styles.tabActive]}
        onPress={() => onToggle('daily')}
      >
        <Text style={[styles.tabText, activeTab === 'daily' && styles.tabTextActive]}>
          日詳
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'calendar' && styles.tabActive]}
        onPress={() => onToggle('calendar')}
      >
        <Text style={[styles.tabText, activeTab === 'calendar' && styles.tabTextActive]}>
          月曆
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 4,
    width: 240,
    height: 40,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.toggleActive,
    fontFamily: Fonts.outfitMedium,
    color: Colors.muted,
  },
  tabTextActive: {
    ...Typography.toggleActive,
    color: Colors.white,
  },
});
