import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MonthHeader } from '../components/MonthHeader';
import { WeekHeader } from '../components/WeekHeader';
import { CalendarGrid } from '../components/CalendarGrid';
import { BottomPanel } from '../components/BottomPanel';
import { CalendarLegend } from '../components/CalendarLegend';
import { DeityStrip } from '../components/DeityStrip';
import { SwipePanel } from '../components/SwipePanel';
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

  // Panels are placed by slot: months from the month the screen mounted with.
  // The screen isn't remounted on a month step, so the incoming panel keeps
  // its title rise running across the swap (#29).
  const [anchor] = useState(() => year * 12 + month);
  const slot = year * 12 + month - anchor;
  const { gesture, x, commit, triggerPrev, triggerNext, screenWidth } = useSwipeGesture({
    onSwipeLeft: onNextMonth,
    onSwipeRight: onPrevMonth,
    slot,
  });

  const { year: prevYear, month: prevMonth } = getPrevMonth(year, month);
  const { year: nextYear, month: nextMonth } = getNextMonth(year, month);

  const selectedDayData = getDayData(year, month, selectedDay, month);

  // Deity days for the *current* month — rendered outside the swipe area so
  // the strip's horizontal ScrollView owns its own gestures without fighting
  // the parent month-swipe pan gesture.
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

  // Neighbours preselect day 1, which is where a month step lands, so the
  // selection doesn't change (and pop) after the swap.
  const renderMonthPanel = (y: number, m: number, sd: number, panelSlot: number) => {
    const weeks = getMonthDays(y, m);
    const isCenter = panelSlot === slot;

    return (
      <SwipePanel
        key={`${y}-${m}`}
        x={x}
        commit={commit}
        slot={panelSlot}
        width={screenWidth}
        active={isCenter}
      >
        <MonthHeader
          titleCn={getChineseMonthName(y, m)}
          onPrev={isCenter ? triggerPrev : noop}
          onNext={isCenter ? triggerNext : noop}
          animate={isCenter}
        />
        <WeekHeader />
        <CalendarGrid
          weeks={weeks}
          selectedDay={sd}
          onSelectDay={isCenter ? onSelectDay : noopDay}
          year={y}
          month={m}
        />
      </SwipePanel>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.swipeArea}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.panelRow, { width: screenWidth }]}>
            {renderMonthPanel(prevYear, prevMonth, 1, slot - 1)}
            {renderMonthPanel(year, month, selectedDay, slot)}
            {renderMonthPanel(nextYear, nextMonth, 1, slot + 1)}
          </Animated.View>
        </GestureDetector>
      </View>
      {/* Keyed per month so its scroll resets, as when the screen remounted per month. */}
      <DeityStrip key={`${year}-${month}`} days={currentDeityDays} onSelect={onSelectDay} />
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
