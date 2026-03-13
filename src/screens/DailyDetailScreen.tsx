import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { GanzhiHero } from '../components/GanzhiHero';
import { JieqiBanner } from '../components/JieqiBanner';
import { FestivalBanner } from '../components/FestivalBanner';
import { YiJiCard } from '../components/YiJiCard';
import { ClashSection } from '../components/ClashSection';
import { MonthHeader } from '../components/MonthHeader';
import { Colors } from '../constants/colors';
import { getDayData, getChineseDayName, getEnglishDayName } from '../utils/lunar';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

interface DailyDetailScreenProps {
  year: number;
  month: number;
  day: number;
  onPrevDay: () => void;
  onNextDay: () => void;
}

export function DailyDetailScreen({ year, month, day, onPrevDay, onNextDay }: DailyDetailScreenProps) {
  const dayData = getDayData(year, month, day);
  const { lunar, ganzhi, yi, ji, clash, jieqi, nextJieqi, festivals } = dayData;
  const swipeHandlers = useSwipeGesture({ onSwipeLeft: onNextDay, onSwipeRight: onPrevDay });

  const lunarDateStr = `農曆 ${lunar.monthCn}月${lunar.dayCn} · ${ganzhi.year}年${ganzhi.month}月${ganzhi.day}日`;

  let jieqiText = '';
  if (jieqi) {
    jieqiText = jieqi;
  } else if (nextJieqi) {
    jieqiText = `${nextJieqi.name}將至 — ${nextJieqi.date}`;
  }

  return (
    <View style={styles.container}>
      <MonthHeader
        titleCn={getChineseDayName(year, month, day)}
        titleEn={getEnglishDayName(year, month, day)}
        onPrev={onPrevDay}
        onNext={onNextDay}
      />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} {...swipeHandlers}>
        <GanzhiHero
          yearGanzhi={ganzhi.year}
          monthGanzhi={ganzhi.month}
          dayGanzhi={ganzhi.day}
          lunarDateString={lunarDateStr}
        />
        <JieqiBanner text={jieqiText} />
        <FestivalBanner festivals={festivals} />
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
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
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
