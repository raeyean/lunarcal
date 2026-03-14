import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { Fonts } from '../constants/typography';

interface GanzhiHeroProps {
  yearGanzhi: string;
  monthGanzhi: string;
  dayGanzhi: string;
  lunarDateString: string;
}

export function GanzhiHero({ yearGanzhi, monthGanzhi, dayGanzhi, lunarDateString }: GanzhiHeroProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={[styles.label, { color: colors.whiteTranslucent50 }]}>天干地支</Text>
      <View style={styles.pillarsRow}>
        <View style={styles.pillar}>
          <Text style={[styles.pillarLabel, { color: colors.whiteTranslucent50 }]}>年</Text>
          <Text style={[styles.pillarValue, { color: colors.white }]}>{yearGanzhi}</Text>
        </View>
        <View style={styles.pillar}>
          <Text style={[styles.pillarLabel, { color: colors.whiteTranslucent50 }]}>月</Text>
          <Text style={[styles.pillarValue, { color: colors.white }]}>{monthGanzhi}</Text>
        </View>
        <View style={styles.pillar}>
          <Text style={[styles.pillarLabel, { color: colors.whiteTranslucent50 }]}>日</Text>
          <Text style={[styles.pillarValue, { color: colors.white }]}>{dayGanzhi}</Text>
        </View>
      </View>
      <Text style={[styles.subtitle, { color: colors.whiteTranslucent80 }]}>{lunarDateString}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
    gap: 8,
  },
  label: {
    fontFamily: Fonts.interMedium,
    fontSize: 11,
    letterSpacing: 2,
  },
  pillarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  pillar: {
    gap: 2,
  },
  pillarLabel: {
    fontFamily: Fonts.inter,
    fontSize: 10,
  },
  pillarValue: {
    ...Typography.heroGanzhi,
  },
  subtitle: {
    fontFamily: Fonts.inter,
    fontSize: 11,
  },
});
