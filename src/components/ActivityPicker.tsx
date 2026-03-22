// src/components/ActivityPicker.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { ACTIVITY_CATEGORIES, ALL_ACTIVITIES } from '../constants/activities';

interface ActivityPickerProps {
  selected: string | null;
  onSelect: (activity: string) => void;
}

export function ActivityPicker({ selected, onSelect }: ActivityPickerProps) {
  const { colors } = useTheme();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggleCategory = (key: string) => {
    setExpandedKey(prev => (prev === key ? null : key));
  };

  return (
    <View style={styles.container}>
      {ACTIVITY_CATEGORIES.map(category => {
        const isExpanded = expandedKey === category.key;
        return (
          <View key={category.key}>
            <TouchableOpacity
              style={[styles.categoryRow, { borderBottomColor: colors.divider }]}
              onPress={() => toggleCategory(category.key)}
            >
              <Text style={[styles.categoryLabel, { color: colors.foreground }]}>
                {category.label}
              </Text>
              <Text style={[styles.arrow, { color: colors.muted }]}>
                {isExpanded ? '▾' : '▸'}
              </Text>
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.chipGrid}>
                {category.activities.map(activity => {
                  const isSelected = selected === activity;
                  return (
                    <TouchableOpacity
                      key={activity}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                        },
                      ]}
                      onPress={() => onSelect(activity)}
                    >
                      <Text style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.foreground },
                      ]}>
                        {activity}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}

      {/* Show all */}
      <TouchableOpacity
        style={[styles.categoryRow, { borderBottomColor: colors.divider }]}
        onPress={() => toggleCategory('all')}
      >
        <Text style={[styles.categoryLabel, { color: colors.muted }]}>
          顯示全部
        </Text>
        <Text style={[styles.arrow, { color: colors.muted }]}>
          {expandedKey === 'all' ? '▾' : '▸'}
        </Text>
      </TouchableOpacity>
      {expandedKey === 'all' && (
        <View style={styles.chipGrid}>
          {ALL_ACTIVITIES.map(activity => {
            const isSelected = selected === activity;
            return (
              <TouchableOpacity
                key={activity}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                  },
                ]}
                onPress={() => onSelect(activity)}
              >
                <Text style={[
                  styles.chipText,
                  { color: isSelected ? '#FFFFFF' : colors.foreground },
                ]}>
                  {activity}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  categoryLabel: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 15,
  },
  arrow: {
    fontSize: 14,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 12,
  },
  chip: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chipText: {
    fontFamily: Fonts.interMedium,
    fontSize: 13,
  },
});
