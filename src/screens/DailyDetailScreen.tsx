import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, type ScrollViewInstance } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MonthHeader } from '../components/MonthHeader';
import { EditorialDaily } from '../components/EditorialDaily';
import { CompatStrip } from '../components/CompatStrip';
import { ApiDemoCard } from '../components/ApiDemoCard';
import { SwipePanel } from '../components/SwipePanel';
import { useTheme } from '../context/ThemeContext';
import { getDayData, getChineseDayName } from '../utils/lunar';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import type { SwipeCommit } from '../hooks/usePanelEntrance';
import { getPrevDay, getNextDay, type YearMonthDay } from '../utils/dateHelpers';
import { Spacing } from '../constants/spacing';

interface DailyDetailScreenProps {
  year: number;
  month: number;
  day: number;
  onPrevDay: () => void;
  onNextDay: () => void;
  openGlossaryTerm?: 'yi' | 'ji' | null;
  onGlossaryOpened?: () => void;
}

const noop = () => {};
const MS_PER_DAY = 86_400_000;

function utcDay({ year, month, day }: YearMonthDay) {
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

/**
 * Prev / current / next day panels. The screen is not remounted on a day step
 * (#29): panels are keyed by date and placed by a slot (days from the date the
 * screen mounted with), so the incoming panel keeps running its entrance
 * across the swap.
 */
export function DailyDetailScreen({ year, month, day, onPrevDay, onNextDay, openGlossaryTerm, onGlossaryOpened }: DailyDetailScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [anchor] = useState(() => utcDay({ year, month, day }));
  const slot = Math.round(utcDay({ year, month, day }) - anchor);
  const { gesture, x, commit, triggerPrev, triggerNext, screenWidth } = useSwipeGesture({
    onSwipeLeft: onNextDay,
    onSwipeRight: onPrevDay,
    slot,
  });

  const prev = getPrevDay(year, month, day);
  const next = getNextDay(year, month, day);
  const centerPhase = useMemo(() => getDayData(year, month, day).phase, [year, month, day]);

  const panel = (date: YearMonthDay, panelSlot: number) => {
    const isCenter = panelSlot === slot;
    return (
      <DayPanel
        key={`${date.year}-${date.month}-${date.day}`}
        date={date}
        slot={panelSlot}
        isCenter={isCenter}
        x={x}
        commit={commit}
        width={screenWidth}
        bottomInset={insets.bottom}
        heldMoonPhase={isCenter ? undefined : centerPhase}
        onPrev={isCenter ? triggerPrev : noop}
        onNext={isCenter ? triggerNext : noop}
        openGlossaryTerm={isCenter ? openGlossaryTerm : null}
        onGlossaryOpened={isCenter ? onGlossaryOpened : undefined}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.panelRow, { width: screenWidth }]}>
          {panel(prev, slot - 1)}
          {panel({ year, month, day }, slot)}
          {panel(next, slot + 1)}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

interface DayPanelProps {
  date: YearMonthDay;
  slot: number;
  isCenter: boolean;
  x: SharedValue<number>;
  commit: SharedValue<SwipeCommit>;
  width: number;
  bottomInset: number;
  heldMoonPhase?: number;
  onPrev: () => void;
  onNext: () => void;
  openGlossaryTerm?: 'yi' | 'ji' | null;
  onGlossaryOpened?: () => void;
}

function DayPanel({
  date, slot, isCenter, x, commit, width, bottomInset, heldMoonPhase,
  onPrev, onNext, openGlossaryTerm, onGlossaryOpened,
}: DayPanelProps) {
  const { year: y, month: m, day: d } = date;
  const dayData = useMemo(() => getDayData(y, m, d), [y, m, d]);
  const scrollRef = useRef<ScrollViewInstance>(null);

  // Off-screen panels sit at the top, as they did when the screen remounted
  // per day, so a swipe back shows the hero and its entrance.
  useEffect(() => {
    if (!isCenter) scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [isCenter]);

  return (
    <SwipePanel x={x} commit={commit} slot={slot} width={width} active={isCenter}>
      <MonthHeader
        titleCn={getChineseDayName(y, m, d)}
        onPrev={onPrev}
        onNext={onNext}
        animate={isCenter}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: bottomInset + Spacing.xxl }}
      >
        <View style={{ paddingHorizontal: Spacing.xl }}>
          <CompatStrip
            targetSolarDate={`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`}
            compact
          />
        </View>
        <EditorialDaily
          day={dayData}
          animate={isCenter}
          heldMoonPhase={heldMoonPhase}
          openGlossaryTerm={openGlossaryTerm}
          onGlossaryOpened={onGlossaryOpened}
        />
        {__DEV__ && isCenter && (
          <ApiDemoCard
            year={y}
            month={m}
            day={d}
            lunarMonth={dayData.lunar.monthNum}
            lunarDay={dayData.lunar.dayNum}
          />
        )}
      </ScrollView>
    </SwipePanel>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  panelRow: {
    flex: 1,
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
});
