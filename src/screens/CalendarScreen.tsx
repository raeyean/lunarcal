import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MonthHeader } from '../components/MonthHeader';
import { WeekHeader } from '../components/WeekHeader';
import { CalendarGrid } from '../components/CalendarGrid';
import { BottomPanel } from '../components/BottomPanel';
import { Colors } from '../constants/colors';
import { getMonthDays, getChineseMonthName, getEnglishMonthName, getDayData } from '../utils/lunar';
import { Solar } from 'lunar-javascript';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

interface CalendarScreenProps {
  year: number;
  month: number;
  selectedDay: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (day: number) => void;
}

export function CalendarScreen({
  year, month, selectedDay,
  onPrevMonth, onNextMonth, onSelectDay,
}: CalendarScreenProps) {
  const weeks = getMonthDays(year, month);
  const firstDay = Solar.fromYmd(year, month, 1);
  const firstWeekDay = firstDay.getWeek();
  const daysInMonth = new Date(year, month, 0).getDate();
  const swipeHandlers = useSwipeGesture({ onSwipeLeft: onNextMonth, onSwipeRight: onPrevMonth });

  const selectedDayData = getDayData(year, month, selectedDay, month);

  return (
    <View style={styles.container} {...swipeHandlers}>
      <MonthHeader
        titleCn={getChineseMonthName(year, month)}
        titleEn={getEnglishMonthName(year, month)}
        onPrev={onPrevMonth}
        onNext={onNextMonth}
      />
      <WeekHeader />
      <CalendarGrid
        weeks={weeks}
        selectedDay={selectedDay}
        daysInMonth={daysInMonth}
        firstWeekDay={firstWeekDay}
        onSelectDay={onSelectDay}
      />
      <View style={styles.divider} />
      <BottomPanel dayData={selectedDayData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
});
