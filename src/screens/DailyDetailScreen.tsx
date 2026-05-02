import React from 'react';
import { View, ScrollView, Animated, StyleSheet } from 'react-native';
import { MonthHeader } from '../components/MonthHeader';
import { EditorialDaily } from '../components/EditorialDaily';
import { useTheme } from '../context/ThemeContext';
import { getDayData, getChineseDayName, getEnglishDayName } from '../utils/lunar';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

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
  const { panHandlers, animatedStyle, triggerPrev, triggerNext, screenWidth } = useSwipeGesture({
    onSwipeLeft: onNextDay,
    onSwipeRight: onPrevDay,
  });

  const prevDate = new Date(year, month - 1, day - 1);
  const nextDate = new Date(year, month - 1, day + 1);

  const renderDayPanel = (y: number, m: number, d: number, isCenter: boolean) => {
    const dayData = getDayData(y, m, d);
    return (
      <View key={`${y}-${m}-${d}`} style={{ width: screenWidth }}>
        <MonthHeader
          titleCn={getChineseDayName(y, m, d)}
          titleEn={getEnglishDayName(y, m, d)}
          onPrev={isCenter ? triggerPrev : noop}
          onNext={isCenter ? triggerNext : noop}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
        >
          <EditorialDaily day={dayData} />
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.panelRow, animatedStyle, { width: screenWidth * 3 }]} {...panHandlers}>
        {renderDayPanel(prevDate.getFullYear(), prevDate.getMonth() + 1, prevDate.getDate(), false)}
        {renderDayPanel(year, month, day, true)}
        {renderDayPanel(nextDate.getFullYear(), nextDate.getMonth() + 1, nextDate.getDate(), false)}
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
  scrollInner: {
    paddingBottom: 35,
  },
});
