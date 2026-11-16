// src/components/ActivityPicker.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { ACTIVITY_CATEGORIES, ALL_ACTIVITIES } from '../constants/activities';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { Chevron } from './Chevron';
import { PressableScale } from './PressableScale';
import { Press } from '../constants/motion';

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
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {ACTIVITY_CATEGORIES.map(category => {
        const isExpanded = expandedKey === category.key;
        return (
          <View key={category.key}>
            <PressableScale scaleTo={Press.card}
              style={[styles.categoryRow, { borderBottomColor: colors.divider }]}
              onPress={() => toggleCategory(category.key)}
              accessibilityRole="button"
              accessibilityLabel={category.label}
              accessibilityState={{ expanded: isExpanded }}
            >
              <Text style={[styles.categoryLabel, { color: colors.foreground }]}>
                {category.label}
              </Text>
              <Chevron expanded={isExpanded} size={14} color={colors.muted} />
            </PressableScale>
            {isExpanded && (
              <View style={styles.chipGrid}>
                {category.activities.map(activity => {
                  const isSelected = selected === activity;
                  return (
                    <PressableScale
                      key={activity}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.background,
                        },
                      ]}
                      onPress={() => onSelect(activity)}
                      accessibilityRole="button"
                      accessibilityLabel={activity}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text style={[
                        styles.chipText,
                        { color: isSelected ? colors.white : colors.foreground },
                      ]}>
                        {activity}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}

      {/* Show all */}
      <PressableScale scaleTo={Press.card}
        style={[styles.categoryRow, styles.categoryRowLast]}
        onPress={() => toggleCategory('all')}
        accessibilityRole="button"
        accessibilityLabel="顯示全部"
        accessibilityState={{ expanded: expandedKey === 'all' }}
      >
        <Text style={[styles.categoryLabel, { color: colors.muted }]}>
          顯示全部
        </Text>
        <Chevron expanded={expandedKey === 'all'} size={14} color={colors.muted} />
      </PressableScale>
      {expandedKey === 'all' && (
        <View style={styles.chipGrid}>
          {ALL_ACTIVITIES.map(activity => {
            const isSelected = selected === activity;
            return (
              <PressableScale
                key={activity}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.background,
                  },
                ]}
                onPress={() => onSelect(activity)}
                accessibilityRole="button"
                accessibilityLabel={activity}
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={[
                  styles.chipText,
                  { color: isSelected ? colors.white : colors.foreground },
                ]}>
                  {activity}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  categoryRowLast: {
    borderBottomWidth: 0,
  },
  categoryLabel: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 17,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  chip: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: Fonts.interMedium,
    fontSize: 13,
  },
});
