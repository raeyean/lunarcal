import React, { useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { MonthHeader } from '../components/MonthHeader';
import { WeekHeader } from '../components/WeekHeader';
import { CalendarGrid } from '../components/CalendarGrid';
import { BottomPanel } from '../components/BottomPanel';
import { CalendarLegend } from '../components/CalendarLegend';
import { DeityStrip } from '../components/DeityStrip';
import { useTheme } from '../context/ThemeContext';
import { getMonthDays, getChineseMonthName, getDayData } from '../utils/lunar';
import { Solar } from 'lunar-javascript';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { getPrevMonth, getNextMonth } from '../utils/dateHelpers';

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
  const [legendExpanded, setLegendExpanded] = useState(false);
  const { panHandlers, animatedStyle, triggerPrev, triggerNext, screenWidth } = useSwipeGesture({
    onSwipeLeft: onNextMonth,
    onSwipeRight: onPrevMonth,
  });

  const { year: prevYear, month: prevMonth } = getPrevMonth(year, month);
  const { year: nextYear, month: nextMonth } = getNextMonth(year, month);

  const selectedDayData = getDayData(year, month, selectedDay, month);

  const renderMonthPanel = (y: number, m: number, sd: number, isCenter: boolean) => {
    const weeks = getMonthDays(y, m);
    const firstDay = Solar.fromYmd(y, m, 1);
    const firstWeekDay = firstDay.getWeek();
    const daysInMonth = new Date(y, m, 0).getDate();

    // Flatten + collect deity days that fall in the *displayed* month only.
    // getMonthDays pads first/last week with duplicates of day-1, so dedupe by day.
    const seenDays = new Set<number>();
    const deityDays = weeks
      .flat()
      .filter(d => {
        if (d.solar.month !== m || d.solar.year !== y || !d.deity) return false;
        if (seenDays.has(d.solar.day)) return false;
        seenDays.add(d.solar.day);
        return true;
      });

    return (
      <View key={`${y}-${m}`} style={{ width: screenWidth }}>
        <MonthHeader
          titleCn={getChineseMonthName(y, m)}
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
          year={y}
          month={m}
        />
        <DeityStrip
          days={deityDays}
          onSelect={isCenter ? onSelectDay : undefined}
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
      <CalendarLegend expanded={legendExpanded} onToggle={() => setLegendExpanded(v => !v)} />
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
