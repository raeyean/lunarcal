import React, { useState, useCallback } from 'react';
import { View, ScrollView, Animated, StyleSheet } from 'react-native';
import { GanzhiHero } from '../components/GanzhiHero';
import { JieqiBanner } from '../components/JieqiBanner';
import { FestivalBanner } from '../components/FestivalBanner';
import { YiJiCard } from '../components/YiJiCard';
import { ClashSection } from '../components/ClashSection';
import { TongshuSection } from '../components/TongshuSection';
import { MonthHeader } from '../components/MonthHeader';
import { EventDetailModal } from '../components/EventDetailModal';
import { useTheme } from '../context/ThemeContext';
import { getDayData, getChineseDayName, getEnglishDayName } from '../utils/lunar';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { getEventDescription, extractEventName } from '../data/eventDescriptions';

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
  const [eventModal, setEventModal] = useState<{ name: string; description: string } | null>(null);

  const handleEventPress = useCallback((text: string) => {
    const name = extractEventName(text);
    const description = getEventDescription(text);
    if (description) {
      setEventModal({ name, description });
    }
  }, []);

  const prevDate = new Date(year, month - 1, day - 1);
  const nextDate = new Date(year, month - 1, day + 1);

  const renderDayPanel = (y: number, m: number, d: number, isCenter: boolean) => {
    const dayData = getDayData(y, m, d);
    const { lunar, ganzhi, yi, ji, clash, tongshu, jieqi, nextJieqi, festivals } = dayData;
    const lunarDateStr = `農曆 ${lunar.monthCn}月${lunar.dayCn} · ${ganzhi.year}年${ganzhi.month}月${ganzhi.day}日`;

    let jieqiText = '';
    if (jieqi) {
      jieqiText = jieqi;
    } else if (nextJieqi) {
      jieqiText = `${nextJieqi.name}將至 — ${nextJieqi.date}`;
    }

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
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator={false}
        >
          <GanzhiHero
            yearGanzhi={ganzhi.year}
            monthGanzhi={ganzhi.month}
            dayGanzhi={ganzhi.day}
            lunarDateString={lunarDateStr}
          />
          <JieqiBanner text={jieqiText} onPress={handleEventPress} />
          <FestivalBanner festivals={festivals} onPressFestival={handleEventPress} />
          <View style={styles.yiJiRow}>
            <YiJiCard type="yi" items={yi} />
            <YiJiCard type="ji" items={ji} />
          </View>
          <ClashSection
            animal={clash.animal}
            emoji={clash.emoji}
            description={clash.description}
            direction={clash.direction}
            element={clash.element}
            taishen={clash.taishen}
          />
          <TongshuSection data={tongshu} />
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
      <EventDetailModal
        visible={eventModal !== null}
        name={eventModal?.name ?? ''}
        description={eventModal?.description ?? ''}
        onClose={() => setEventModal(null)}
      />
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
  contentInner: {
    padding: 24,
    paddingTop: 16,
    gap: 20,
  },
  yiJiRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
