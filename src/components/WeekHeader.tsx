import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

const DAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function WeekHeader() {
  return (
    <View style={styles.container}>
      {DAYS.map((day) => (
        <Text key={day} style={styles.dayText}>{day}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  dayText: {
    ...Typography.weekDay,
    color: Colors.muted,
    width: 44,
    textAlign: 'center',
  },
});
