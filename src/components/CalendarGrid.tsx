import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CalendarCell } from './CalendarCell';
import { DayData } from '../utils/lunar';
import { Spacing } from '../constants/spacing';

interface CalendarGridProps {
  weeks: DayData[][];
  selectedDay: number;
  daysInMonth: number;
  firstWeekDay: number;
  onSelectDay: (day: number) => void;
  year: number;
  month: number;
}

export function CalendarGrid({
  weeks,
  selectedDay,
  daysInMonth,
  firstWeekDay,
  onSelectDay,
  year,
  month,
}: CalendarGridProps) {
  const today = new Date();
  const isTodayMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDay = isTodayMonth ? today.getDate() : 0;

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
            const isLunarFirst = dayData.lunar.dayCn === '初一';
            const isToday = day === todayDay;
            const a11ySuffix =
              (dayData.jieqi ? ` ${dayData.jieqi}` : '') +
              (dayData.festivalShort ? ` ${dayData.festivalShort}` : '');
            const accessibilityLabel = `${month}月${day}日 農曆${dayData.lunar.monthCn}月${dayData.lunar.dayCn}${a11ySuffix}`;

            return (
              <CalendarCell
                key={cellIdx}
                day={day}
                lunarText={lunarText}
                isActive={day === selectedDay}
                isJieqi={isJieqi}
                isFestival={isFestival && !isJieqi}
                isEmpty={false}
                isToday={isToday}
                isLunarFirst={isLunarFirst}
                accessibilityLabel={accessibilityLabel}
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
    paddingHorizontal: Spacing.lg,
    gap: 2,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
