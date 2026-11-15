import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MonthHeader } from '../components/MonthHeader';
import { EditorialDaily } from '../components/EditorialDaily';
import { CompatStrip } from '../components/CompatStrip';
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
  openGlossaryTerm?: 'yi' | 'ji' | null;
  onGlossaryOpened?: () => void;
  /**
   * Direction of the last prev/next day navigation (-1 = prev, 1 = next).
   * Drives the hero numeral roll direction on the center panel (#23).
   */
  navDirection?: -1 | 1;
}

const noop = () => {};

export function DailyDetailScreen({ year, month, day, onPrevDay, onNextDay, openGlossaryTerm, onGlossaryOpened, navDirection }: DailyDetailScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { gesture, animatedStyle, triggerPrev, triggerNext, screenWidth } = useSwipeGesture({
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
          <View style={{ paddingHorizontal: Spacing.xl }}>
            <CompatStrip
              targetSolarDate={`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`}
              compact
            />
          </View>
          <EditorialDaily
              day={dayData}
              navDirection={isCenter ? navDirection : undefined}
              animate={isCenter}
              openGlossaryTerm={isCenter ? openGlossaryTerm : null}
              onGlossaryOpened={isCenter ? onGlossaryOpened : undefined}
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
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.panelRow, animatedStyle, { width: screenWidth * 3 }]}>
          {renderDayPanel(prev.year, prev.month, prev.day, false)}
          {renderDayPanel(year, month, day, true)}
          {renderDayPanel(next.year, next.month, next.day, false)}
        </Animated.View>
      </GestureDetector>
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
