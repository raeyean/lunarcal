import React from 'react';
import { View, ScrollView, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MonthHeader } from '../components/MonthHeader';
import { EditorialDaily } from '../components/EditorialDaily';
import { ApiDemoCard } from '../components/ApiDemoCard';
import { useTheme } from '../context/ThemeContext';
import { getDayData, getChineseDayName } from '../utils/lunar';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { getPrevDay, getNextDay } from '../utils/dateHelpers';
import { Spacing } from '../constants/spacing';

interface DailyDetailScreenProps {
  year: number;
  month: number;
  day: number;
  onPrevDay: () => void;
  onNextDay: () => void;
}

const noop = () => {};

export function DailyDetailScreen({ year, month, day, onPrevDay, onNextDay }: DailyDetailScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { panHandlers, animatedStyle, triggerPrev, triggerNext, screenWidth } = useSwipeGesture({
    onSwipeLeft: onNextDay,
    onSwipeRight: onPrevDay,
  });

  const prev = getPrevDay(year, month, day);
  const next = getNextDay(year, month, day);

  const renderDayPanel = (y: number, m: number, d: number, isCenter: boolean) => {
    const dayData = getDayData(y, m, d);
    return (
      <View key={`${y}-${m}-${d}`} style={{ width: screenWidth }}>
        <MonthHeader
          titleCn={getChineseDayName(y, m, d)}
          onPrev={isCenter ? triggerPrev : noop}
          onNext={isCenter ? triggerNext : noop}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxl }}
        >
          <EditorialDaily day={dayData} />
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
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.panelRow, animatedStyle, { width: screenWidth * 3 }]} {...panHandlers}>
        {renderDayPanel(prev.year, prev.month, prev.day, false)}
        {renderDayPanel(year, month, day, true)}
        {renderDayPanel(next.year, next.month, next.day, false)}
      </Animated.View>
    </View>
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
