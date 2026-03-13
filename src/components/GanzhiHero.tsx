import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Fonts } from '../constants/typography';

interface GanzhiHeroProps {
  yearGanzhi: string;
  monthGanzhi: string;
  dayGanzhi: string;
  lunarDateString: string;
}

export function GanzhiHero({ yearGanzhi, monthGanzhi, dayGanzhi, lunarDateString }: GanzhiHeroProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>天干地支</Text>
      <View style={styles.pillarsRow}>
        <View style={styles.pillar}>
          <Text style={styles.pillarLabel}>年</Text>
          <Text style={styles.pillarValue}>{yearGanzhi}</Text>
        </View>
        <View style={styles.pillar}>
          <Text style={styles.pillarLabel}>月</Text>
          <Text style={styles.pillarValue}>{monthGanzhi}</Text>
        </View>
        <View style={styles.pillar}>
          <Text style={styles.pillarLabel}>日</Text>
          <Text style={styles.pillarValue}>{dayGanzhi}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>{lunarDateString}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    gap: 8,
  },
  label: {
    fontFamily: Fonts.interMedium,
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.whiteTranslucent50,
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
    color: Colors.whiteTranslucent50,
  },
  pillarValue: {
    ...Typography.heroGanzhi,
    color: Colors.white,
  },
  subtitle: {
    fontFamily: Fonts.inter,
    fontSize: 11,
    color: Colors.whiteTranslucent80,
  },
});
