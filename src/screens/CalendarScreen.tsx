import React, { useEffect, useMemo, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MonthHeader } from '../components/MonthHeader';
import { WeekHeader } from '../components/WeekHeader';
import { CalendarGrid } from '../components/CalendarGrid';
import { BottomPanel } from '../components/BottomPanel';
import { CalendarLegend } from '../components/CalendarLegend';
import { DeityStrip } from '../components/DeityStrip';
import { useTheme } from '../context/ThemeContext';
import { getMonthDays, getChineseMonthName, getDayData } from '../utils/lunar';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { getPrevMonth, getNextMonth } from '../utils/dateHelpers';

const LEGEND_EXPANDED_KEY = 'lunarcal_legend_expanded';

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

  useEffect(() => {
    AsyncStorage.getItem(LEGEND_EXPANDED_KEY)
      .then(val => {
        if (val === 'true') setLegendExpanded(true);
      })
      .catch(err => console.warn('Failed to load legend state:', err));
  }, []);

  const toggleLegend = () => {
    setLegendExpanded(v => {
      const next = !v;
      AsyncStorage.setItem(LEGEND_EXPANDED_KEY, next ? 'true' : 'false').catch(err =>
        console.warn('Failed to save legend state:', err),
      );
      return next;
    });
  };

  const { panHandlers, animatedStyle, triggerPrev, triggerNext, screenWidth } = useSwipeGesture({
    onSwipeLeft: onNextMonth,
    onSwipeRight: onPrevMonth,
  });

  const { year: prevYear, month: prevMonth } = getPrevMonth(year, month);
  const { year: nextYear, month: nextMonth } = getNextMonth(year, month);

  const selectedDayData = getDayData(year, month, selectedDay, month);

  // Deity days for the *current* month — rendered outside the swipe area so
  // the strip's horizontal ScrollView owns its own gestures without fighting
  // the parent month-swipe PanResponder.
  const currentDeityDays = useMemo(() => {
    const weeks = getMonthDays(year, month);
    const seen = new Set<number>();
    return weeks
      .flat()
      .filter(d => {
        if (d.solar.month !== month || d.solar.year !== year || !d.deity) return false;
        if (seen.has(d.solar.day)) return false;
        seen.add(d.solar.day);
        return true;
      });
  }, [year, month]);

  const renderMonthPanel = (y: number, m: number, sd: number, isCenter: boolean) => {
    const weeks = getMonthDays(y, m);

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
          onSelectDay={isCenter ? onSelectDay : noopDay}
          year={y}
          month={m}
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
      <DeityStrip days={currentDeityDays} onSelect={onSelectDay} />
      <CalendarLegend expanded={legendExpanded} onToggle={toggleLegend} />
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
