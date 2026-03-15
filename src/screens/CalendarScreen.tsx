import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { MonthHeader } from '../components/MonthHeader';
import { WeekHeader } from '../components/WeekHeader';
import { CalendarGrid } from '../components/CalendarGrid';
import { BottomPanel } from '../components/BottomPanel';
import { useTheme } from '../context/ThemeContext';
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

const noop = () => {};
const noopDay = (_: number) => {};

export function CalendarScreen({
  year, month, selectedDay,
  onPrevMonth, onNextMonth, onSelectDay,
}: CalendarScreenProps) {
  const { colors } = useTheme();
  const { panHandlers, animatedStyle, triggerPrev, triggerNext, screenWidth } = useSwipeGesture({
    onSwipeLeft: onNextMonth,
    onSwipeRight: onPrevMonth,
  });

  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  const selectedDayData = getDayData(year, month, selectedDay, month);

  const renderMonthPanel = (y: number, m: number, sd: number, isCenter: boolean) => {
    const weeks = getMonthDays(y, m);
    const firstDay = Solar.fromYmd(y, m, 1);
    const firstWeekDay = firstDay.getWeek();
    const daysInMonth = new Date(y, m, 0).getDate();

    return (
      <View key={`${y}-${m}`} style={{ width: screenWidth }}>
        <MonthHeader
          titleCn={getChineseMonthName(y, m)}
          titleEn={getEnglishMonthName(y, m)}
          onPrev={isCenter ? triggerPrev : noop}
          onNext={isCenter ? triggerNext : noop}
        />
        <WeekHeader />
        <CalendarGrid
          weeks={weeks}
          selectedDay={isCenter ? sd : 0}
          daysInMonth={daysInMonth}
          firstWeekDay={firstWeekDay}
          onSelectDay={isCenter ? onSelectDay : noopDay}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.swipeArea}>
        <Animated.View style={[styles.panelRow, animatedStyle, { width: screenWidth * 3 }]} {...panHandlers}>
          {renderMonthPanel(prevYear, prevMonth, 1, false)}
          {renderMonthPanel(year, month, selectedDay, true)}
          {renderMonthPanel(nextYear, nextMonth, 1, false)}
        </Animated.View>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      <BottomPanel dayData={selectedDayData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swipeArea: {
    overflow: 'hidden',
  },
  panelRow: {
    flexDirection: 'row',
  },
  divider: {
    height: 1,
  },
});
