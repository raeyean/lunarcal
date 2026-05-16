import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography, Fonts } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';

interface TogglePillProps {
  activeTab: 'daily' | 'calendar';
  onToggle: (tab: 'daily' | 'calendar') => void;
}

export function TogglePill({ activeTab, onToggle }: TogglePillProps) {
  const { colors } = useTheme();

  const renderTab = (tab: 'daily' | 'calendar', label: string) => {
    const isActive = activeTab === tab;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.tab,
          isActive && {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
            shadowOpacity: 0.25,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          },
          pressed && { opacity: 0.85 },
        ]}
        onPress={() => onToggle(tab)}
        accessibilityRole="tab"
        accessibilityLabel={label}
        accessibilityState={{ selected: isActive }}
      >
        <Text
          style={[
            styles.tabText,
            { color: isActive ? colors.white : colors.muted },
            isActive && styles.tabTextActive,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {renderTab('daily', '日詳')}
      {renderTab('calendar', '月曆')}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Radius.xl,
    padding: Spacing.xs,
    maxWidth: 240,
    width: '60%',
    minHeight: 44,
  },
  tab: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.xl,
  },
  tabText: {
    ...Typography.toggleActive,
    fontFamily: Fonts.outfitMedium,
  },
  tabTextActive: {
    fontFamily: Fonts.outfitBold,
  },
});
