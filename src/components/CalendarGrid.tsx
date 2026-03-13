import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CalendarCell } from './CalendarCell';
import { DayData } from '../utils/lunar';

interface CalendarGridProps {
  weeks: DayData[][];
  selectedDay: number;
  daysInMonth: number;
  firstWeekDay: number;
  onSelectDay: (day: number) => void;
}

export function CalendarGrid({
  weeks,
  selectedDay,
  daysInMonth,
  firstWeekDay,
  onSelectDay,
}: CalendarGridProps) {
  return (
    <View style={styles.container}>
      {weeks.map((week, weekIdx) => (
        <View key={weekIdx} style={styles.weekRow}>
          {week.map((dayData, cellIdx) => {
            const globalIdx = weekIdx * 7 + cellIdx;
            const isEmpty = globalIdx < firstWeekDay || globalIdx >= firstWeekDay + daysInMonth;

            if (isEmpty) {
              return (
                <CalendarCell
                  key={cellIdx}
                  day={0}
                  lunarText=""
                  isActive={false}
                  isJieqi={false}
                  isEmpty={true}
                  onPress={() => {}}
                />
              );
            }

            const day = globalIdx - firstWeekDay + 1;
            const isFestival = !!dayData.festivalShort;
            const lunarText = dayData.jieqi || dayData.festivalShort || dayData.lunar.dayCn;
            const isJieqi = !!dayData.jieqi;

            return (
              <CalendarCell
                key={cellIdx}
                day={day}
                lunarText={lunarText}
                isActive={day === selectedDay}
                isJieqi={isJieqi}
                isFestival={isFestival && !isJieqi}
                isEmpty={false}
                onPress={() => onSelectDay(day)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 2,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
