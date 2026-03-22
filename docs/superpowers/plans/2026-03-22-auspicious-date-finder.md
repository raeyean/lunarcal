# Auspicious Date Finder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated screen where users pick an activity and zodiac animal, then scan upcoming dates where that activity is auspicious (in 宜) while filtering out zodiac clash conflicts.

**Architecture:** New full-screen overlay (`AuspiciousFinderScreen`) launched from a header icon in `App.tsx`. The scan engine iterates day-by-day using `lunar-javascript` in 30-day chunks, matching activities against `getDayYi()` and filtering clashes via `getDayChongShengXiao()`. Results render as compact cards with lazy pagination on scroll.

**Tech Stack:** React Native, TypeScript, lunar-javascript, AsyncStorage, Animated API

**Spec:** `docs/superpowers/specs/2026-03-22-auspicious-date-finder-design.md`

---

### Task 1: Activity Categories Constant

**Files:**
- Create: `src/constants/activities.ts`

- [ ] **Step 1: Create the activity categories data file**

```typescript
// src/constants/activities.ts

export interface ActivityCategory {
  key: string;
  label: string;
  activities: string[];
}

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  { key: 'life', label: '人生大事', activities: ['嫁娶', '納采', '訂盟', '冠笄'] },
  { key: 'home', label: '居家', activities: ['搬家', '入宅', '修造', '動土', '安床', '安門'] },
  { key: 'business', label: '商業', activities: ['開市', '交易', '立券', '掛匾', '開倉'] },
  { key: 'construction', label: '建築', activities: ['上樑', '豎柱', '破土', '起基', '造屋'] },
  { key: 'travel', label: '出行', activities: ['出行', '移徙', '赴任'] },
  { key: 'spiritual', label: '祭祀', activities: ['祭祀', '祈福', '求嗣', '齋醮', '開光'] },
  { key: 'burial', label: '喪葬', activities: ['安葬', '啟鑽', '除服', '成服'] },
  { key: 'agriculture', label: '農牧', activities: ['栽種', '牧養', '納畜', '伐木'] },
];

export const ALL_ACTIVITIES: string[] = ACTIVITY_CATEGORIES.flatMap(c => c.activities);
```

- [ ] **Step 2: Commit**

```bash
git add src/constants/activities.ts
git commit -m "feat: add activity categories constant for auspicious finder"
```

---

### Task 2: Zodiac Storage Utility

**Files:**
- Create: `src/utils/zodiacStorage.ts`

- [ ] **Step 1: Create the zodiac storage utility**

```typescript
// src/utils/zodiacStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'userZodiac';

export async function getZodiac(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEY);
}

export async function setZodiac(animal: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, animal);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/zodiacStorage.ts
git commit -m "feat: add zodiac AsyncStorage utility"
```

---

### Task 3: Scan Engine

**Files:**
- Create: `src/utils/auspiciousScan.ts`
- Reference: `src/utils/lunar.ts` (for `getDayData` pattern and `Solar` import)

- [ ] **Step 1: Create the scan engine with AuspiciousResult type and scanChunk function**

```typescript
// src/utils/auspiciousScan.ts
import { Solar } from 'lunar-javascript';

export interface AuspiciousResult {
  date: { year: number; month: number; day: number };
  lunarDate: string;
  ganzhiDay: string;
  weekDay: number;
  yi: string[];
  ji: string[];
  tianShen: string;
  tianShenType: string;
}

export interface ScanResult {
  results: AuspiciousResult[];
  hasMore: boolean;
  nextStartDate: Date;
}

export function scanChunk(
  activity: string,
  zodiac: string | null,
  startDate: Date,
  chunkSize: number,
  maxDate: Date,
): ScanResult {
  const results: AuspiciousResult[] = [];
  const current = new Date(startDate);
  let daysScanned = 0;

  while (daysScanned < chunkSize && current <= maxDate) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const day = current.getDate();

    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    const yi: string[] = lunar.getDayYi();

    if (yi.includes(activity)) {
      const clashAnimal: string = lunar.getDayChongShengXiao();

      if (!zodiac || clashAnimal !== zodiac) {
        results.push({
          date: { year, month, day },
          lunarDate: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
          ganzhiDay: lunar.getDayInGanZhi(),
          weekDay: solar.getWeek(),
          yi,
          ji: lunar.getDayJi(),
          tianShen: lunar.getDayTianShen(),
          tianShenType: lunar.getDayTianShenType(),
        });
      }
    }

    current.setDate(current.getDate() + 1);
    daysScanned++;
  }

  return {
    results,
    hasMore: current <= maxDate,
    nextStartDate: new Date(current),
  };
}
```

- [ ] **Step 2: Verify the scan engine works by checking the import resolves**

Run: `npx tsc --noEmit src/utils/auspiciousScan.ts 2>&1 | head -20`

(May show errors from other files — focus on whether `auspiciousScan.ts` itself has type errors.)

- [ ] **Step 3: Commit**

```bash
git add src/utils/auspiciousScan.ts
git commit -m "feat: add chunked auspicious date scan engine"
```

---

### Task 4: ZodiacPicker Component

**Files:**
- Create: `src/components/ZodiacPicker.tsx`
- Reference: `src/constants/colors.ts`, `src/constants/typography.ts`, `src/context/ThemeContext.tsx`

- [ ] **Step 1: Create the ZodiacPicker component**

A 4x3 grid of zodiac animals. Each cell shows emoji + Chinese label. Selected animal is highlighted with `primary` color. Calls `onSelect(animal)` on tap.

```typescript
// src/components/ZodiacPicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';

const ZODIAC_ANIMALS = [
  { name: '鼠', emoji: '🐀' }, { name: '牛', emoji: '🐂' },
  { name: '虎', emoji: '🐅' }, { name: '兔', emoji: '🐇' },
  { name: '龍', emoji: '🐉' }, { name: '蛇', emoji: '🐍' },
  { name: '馬', emoji: '🐴' }, { name: '羊', emoji: '🐏' },
  { name: '猴', emoji: '🐒' }, { name: '雞', emoji: '🐓' },
  { name: '狗', emoji: '🐕' }, { name: '豬', emoji: '🐖' },
];

interface ZodiacPickerProps {
  selected: string | null;
  onSelect: (animal: string) => void;
}

export function ZodiacPicker({ selected, onSelect }: ZodiacPickerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.grid}>
      {ZODIAC_ANIMALS.map(({ name, emoji }) => {
        const isSelected = selected === name;
        return (
          <TouchableOpacity
            key={name}
            style={[
              styles.cell,
              { backgroundColor: isSelected ? colors.primaryLight : colors.surface },
              isSelected && { borderColor: colors.primary, borderWidth: 2 },
            ]}
            onPress={() => onSelect(name)}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={[
              styles.label,
              { color: isSelected ? colors.primary : colors.foreground },
            ]}>
              {name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 13,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ZodiacPicker.tsx
git commit -m "feat: add ZodiacPicker component"
```

---

### Task 5: ActivityPicker Component

**Files:**
- Create: `src/components/ActivityPicker.tsx`
- Reference: `src/constants/activities.ts`, `src/constants/colors.ts`, `src/constants/typography.ts`

- [ ] **Step 1: Create the ActivityPicker component**

Collapsible category rows. Each category shows its label; tapping expands to reveal activity chips. Exactly one activity can be selected. A "Show all" section at the bottom shows every activity from all categories in a flat chip grid.

```typescript
// src/components/ActivityPicker.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { ACTIVITY_CATEGORIES, ALL_ACTIVITIES } from '../constants/activities';

interface ActivityPickerProps {
  selected: string | null;
  onSelect: (activity: string) => void;
}

export function ActivityPicker({ selected, onSelect }: ActivityPickerProps) {
  const { colors } = useTheme();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggleCategory = (key: string) => {
    setExpandedKey(prev => (prev === key ? null : key));
  };

  return (
    <View style={styles.container}>
      {ACTIVITY_CATEGORIES.map(category => {
        const isExpanded = expandedKey === category.key;
        return (
          <View key={category.key}>
            <TouchableOpacity
              style={[styles.categoryRow, { borderBottomColor: colors.divider }]}
              onPress={() => toggleCategory(category.key)}
            >
              <Text style={[styles.categoryLabel, { color: colors.foreground }]}>
                {category.label}
              </Text>
              <Text style={[styles.arrow, { color: colors.muted }]}>
                {isExpanded ? '▾' : '▸'}
              </Text>
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.chipGrid}>
                {category.activities.map(activity => {
                  const isSelected = selected === activity;
                  return (
                    <TouchableOpacity
                      key={activity}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                        },
                      ]}
                      onPress={() => onSelect(activity)}
                    >
                      <Text style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.foreground },
                      ]}>
                        {activity}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}

      {/* Show all */}
      <TouchableOpacity
        style={[styles.categoryRow, { borderBottomColor: colors.divider }]}
        onPress={() => toggleCategory('all')}
      >
        <Text style={[styles.categoryLabel, { color: colors.muted }]}>
          顯示全部
        </Text>
        <Text style={[styles.arrow, { color: colors.muted }]}>
          {expandedKey === 'all' ? '▾' : '▸'}
        </Text>
      </TouchableOpacity>
      {expandedKey === 'all' && (
        <View style={styles.chipGrid}>
          {ALL_ACTIVITIES.map(activity => {
            const isSelected = selected === activity;
            return (
              <TouchableOpacity
                key={activity}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                  },
                ]}
                onPress={() => onSelect(activity)}
              >
                <Text style={[
                  styles.chipText,
                  { color: isSelected ? '#FFFFFF' : colors.foreground },
                ]}>
                  {activity}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  categoryLabel: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 15,
  },
  arrow: {
    fontSize: 14,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 12,
  },
  chip: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chipText: {
    fontFamily: Fonts.interMedium,
    fontSize: 13,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ActivityPicker.tsx
git commit -m "feat: add ActivityPicker component with collapsible categories"
```

---

### Task 6: AuspiciousResultCard Component

**Files:**
- Create: `src/components/AuspiciousResultCard.tsx`
- Reference: `src/utils/auspiciousScan.ts` (for `AuspiciousResult` type)

- [ ] **Step 1: Create the result card component**

Compact card showing: solar date + weekday (left), lunar date + ganzhi (right), yi chips with matched activity highlighted (bottom), tianShen luck indicator (footer). Calls `onPress` on tap.

```typescript
// src/components/AuspiciousResultCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { AuspiciousResult } from '../utils/auspiciousScan';

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface AuspiciousResultCardProps {
  result: AuspiciousResult;
  matchedActivity: string;
  onPress: () => void;
}

export function AuspiciousResultCard({ result, matchedActivity, onPress }: AuspiciousResultCardProps) {
  const { colors } = useTheme();
  const luckColor = result.tianShenType === '吉' ? '#4ade80' : colors.muted;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.solarDate, { color: colors.foreground }]}>
            {MONTH_NAMES[result.date.month]} {result.date.day}
          </Text>
          <Text style={[styles.weekday, { color: colors.muted }]}>
            {WEEKDAY_NAMES[result.weekDay]}
          </Text>
        </View>
        <View style={styles.rightColumn}>
          <Text style={[styles.lunarDate, { color: colors.primary }]}>
            {result.lunarDate}
          </Text>
          <Text style={[styles.ganzhi, { color: colors.subtleText }]}>
            {result.ganzhiDay}
          </Text>
        </View>
      </View>

      <View style={styles.chipRow}>
        {result.yi.slice(0, 6).map((item, idx) => {
          const isMatch = item === matchedActivity;
          return (
            <View
              key={idx}
              style={[
                styles.yiChip,
                {
                  backgroundColor: isMatch
                    ? `${colors.primary}26`
                    : `${colors.primary}14`,
                },
              ]}
            >
              <Text style={[
                styles.yiChipText,
                {
                  color: isMatch ? colors.primary : `${colors.primary}B3`,
                  fontFamily: isMatch ? Fonts.outfitSemiBold : Fonts.inter,
                },
              ]}>
                {item}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={[styles.luck, { color: luckColor }]}>
        {result.tianShenType} · {result.tianShen}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  solarDate: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 16,
  },
  weekday: {
    fontFamily: Fonts.inter,
    fontSize: 12,
  },
  rightColumn: {
    alignItems: 'flex-end',
  },
  lunarDate: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 13,
  },
  ganzhi: {
    fontFamily: Fonts.inter,
    fontSize: 11,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  yiChip: {
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  yiChipText: {
    fontSize: 10,
  },
  luck: {
    fontFamily: Fonts.inter,
    fontSize: 10,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AuspiciousResultCard.tsx
git commit -m "feat: add AuspiciousResultCard component"
```

---

### Task 7: AuspiciousFinderScreen

**Files:**
- Create: `src/screens/AuspiciousFinderScreen.tsx`
- Reference: `src/components/ActivityPicker.tsx`, `src/components/ZodiacPicker.tsx`, `src/components/AuspiciousResultCard.tsx`, `src/utils/auspiciousScan.ts`, `src/utils/zodiacStorage.ts`

- [ ] **Step 1: Create the main finder screen**

Full-screen overlay with:
- Header (back arrow + title)
- ScrollView containing: ActivityPicker, ZodiacPicker, range selector (segmented control), search button
- FlatList for results with onEndReached pagination
- Empty/loading states

```typescript
// src/screens/AuspiciousFinderScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { ActivityPicker } from '../components/ActivityPicker';
import { ZodiacPicker } from '../components/ZodiacPicker';
import { AuspiciousResultCard } from '../components/AuspiciousResultCard';
import { scanChunk, AuspiciousResult } from '../utils/auspiciousScan';
import { getZodiac, setZodiac } from '../utils/zodiacStorage';

const RANGE_OPTIONS = [30, 60, 90, 180];

interface AuspiciousFinderScreenProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (year: number, month: number, day: number) => void;
}

export function AuspiciousFinderScreen({ visible, onClose, onSelectDate }: AuspiciousFinderScreenProps) {
  const { colors } = useTheme();

  const [activity, setActivity] = useState<string | null>(null);
  const [zodiac, setZodiacState] = useState<string | null>(null);
  const [range, setRange] = useState(90);
  const [results, setResults] = useState<AuspiciousResult[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const nextStartDate = useRef<Date>(new Date());

  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(1000)).current;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      getZodiac().then(saved => {
        if (saved) setZodiacState(saved);
      });
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 1000,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [visible]);

  const handleZodiacSelect = useCallback((animal: string) => {
    setZodiacState(animal);
    setZodiac(animal);
  }, []);

  const handleSearch = useCallback(() => {
    if (!activity) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + range);

    setLoading(true);
    setSearched(true);

    // Use setTimeout to let the UI update before scanning
    setTimeout(() => {
      const result = scanChunk(activity, zodiac, today, 30, maxDate);
      setResults(result.results);
      setHasMore(result.hasMore);
      nextStartDate.current = result.nextStartDate;
      setLoading(false);
    }, 50);
  }, [activity, zodiac, range]);

  const handleLoadMore = useCallback(() => {
    if (!activity || loading || !hasMore) return;

    const maxDate = new Date();
    maxDate.setHours(0, 0, 0, 0);
    maxDate.setDate(maxDate.getDate() + range);

    setLoading(true);
    setTimeout(() => {
      const result = scanChunk(activity, zodiac, nextStartDate.current, 30, maxDate);
      setResults(prev => [...prev, ...result.results]);
      setHasMore(result.hasMore);
      nextStartDate.current = result.nextStartDate;
      setLoading(false);
    }, 50);
  }, [activity, zodiac, range, loading, hasMore]);

  const handleResultPress = useCallback((result: AuspiciousResult) => {
    onSelectDate(result.date.year, result.date.month, result.date.day);
    onClose();
  }, [onSelectDate, onClose]);

  const handleClose = useCallback(() => {
    // Reset search state on close
    setResults([]);
    setSearched(false);
    setHasMore(false);
    setActivity(null);
    onClose();
  }, [onClose]);

  const renderFooter = () => {
    if (loading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.footerText, { color: colors.muted }]}>Loading more...</Text>
        </View>
      );
    }
    if (searched && !hasMore && results.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.muted }]}>No more dates in range</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <Modal visible={modalVisible} animationType="none" transparent>
      <Animated.View style={[
        styles.container,
        { backgroundColor: colors.background, transform: [{ translateY: slideAnim }] },
      ]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.backButton}>
            <Text style={[styles.backArrow, { color: colors.primary }]}>{'◀'}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>擇吉日</Text>
          <View style={styles.backButton} />
        </View>

        {!searched ? (
          <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent}>
            {/* Activity Picker */}
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>選擇活動</Text>
            <ActivityPicker selected={activity} onSelect={setActivity} />

            {/* Zodiac Picker */}
            <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: 24 }]}>你的生肖</Text>
            <ZodiacPicker selected={zodiac} onSelect={handleZodiacSelect} />

            {/* Range Selector */}
            <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: 24 }]}>搜索範圍</Text>
            <View style={styles.rangeRow}>
              {RANGE_OPTIONS.map(option => {
                const isSelected = range === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.rangeChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                      },
                    ]}
                    onPress={() => setRange(option)}
                  >
                    <Text style={[
                      styles.rangeText,
                      { color: isSelected ? '#FFFFFF' : colors.foreground },
                    ]}>
                      {option} days
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Search Button */}
            <TouchableOpacity
              style={[
                styles.searchButton,
                { backgroundColor: activity ? colors.primary : colors.badgeBg },
              ]}
              onPress={handleSearch}
              disabled={!activity}
            >
              <Text style={[
                styles.searchButtonText,
                { color: activity ? '#FFFFFF' : colors.muted },
              ]}>
                搜索吉日
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.resultsContainer}>
            {/* Filter summary */}
            <View style={styles.filterSummary}>
              <View style={[styles.filterChip, { backgroundColor: colors.surface }]}>
                <Text style={[styles.filterChipText, { color: colors.primary }]}>{activity}</Text>
              </View>
              {zodiac && (
                <View style={[styles.filterChip, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.filterChipText, { color: colors.primary }]}>{zodiac}</Text>
                </View>
              )}
              <View style={[styles.filterChip, { backgroundColor: colors.surface }]}>
                <Text style={[styles.filterChipText, { color: colors.muted }]}>{range} days</Text>
              </View>
              <TouchableOpacity onPress={() => { setSearched(false); setResults([]); setHasMore(false); }}>
                <Text style={[styles.modifyText, { color: colors.primary }]}>修改</Text>
              </TouchableOpacity>
            </View>

            {results.length === 0 && !loading ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  找不到吉日
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                  在未來 {range} 天內沒有適合「{activity}」的吉日，試試延長搜索範圍
                </Text>
              </View>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => `${item.date.year}-${item.date.month}-${item.date.day}`}
                renderItem={({ item }) => (
                  <AuspiciousResultCard
                    result={item}
                    matchedActivity={activity!}
                    onPress={() => handleResultPress(item)}
                  />
                )}
                contentContainerStyle={styles.resultsList}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                ListHeaderComponent={
                  <Text style={[styles.resultCount, { color: colors.muted }]}>
                    找到 {results.length} 個吉日{hasMore ? '...' : ''}
                  </Text>
                }
                ListFooterComponent={renderFooter}
              />
            )}
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 18,
  },
  title: {
    fontFamily: Fonts.outfitBold,
    fontSize: 18,
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rangeChip: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rangeText: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 13,
  },
  searchButton: {
    marginTop: 32,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchButtonText: {
    fontFamily: Fonts.outfitBold,
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  filterSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 12,
    flexWrap: 'wrap',
  },
  filterChip: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  filterChipText: {
    fontFamily: Fonts.interMedium,
    fontSize: 12,
  },
  modifyText: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 13,
  },
  resultCount: {
    fontFamily: Fonts.inter,
    fontSize: 12,
    marginBottom: 12,
  },
  resultsList: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: Fonts.outfitBold,
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: Fonts.inter,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontFamily: Fonts.inter,
    fontSize: 12,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/AuspiciousFinderScreen.tsx
git commit -m "feat: add AuspiciousFinderScreen with form, results, and pagination"
```

---

### Task 8: Integrate into App.tsx

**Files:**
- Modify: `App.tsx:1-230`

- [ ] **Step 1: Add finder state and header icon to App.tsx**

Changes to make:
1. Import `AuspiciousFinderScreen`
2. Add `finderVisible` state
3. Add compass icon button in the header (positioned absolute right, before the conditional 今天 button)
4. Render `AuspiciousFinderScreen` with `onSelectDate` callback that sets year/month/day, switches to daily tab, and closes the finder

In `App.tsx`, add the import at the top (after TodayWidget import):

```typescript
import { AuspiciousFinderScreen } from './src/screens/AuspiciousFinderScreen';
```

Add state in `AppContent`:

```typescript
const [finderVisible, setFinderVisible] = useState(false);
```

Add handler:

```typescript
const handleFinderSelectDate = useCallback((y: number, m: number, d: number) => {
  setYear(y);
  setMonth(m);
  setSelectedDay(d);
  setActiveTab('daily');
}, []);
```

In the `toggleWrapper` View, add a compass button. Place it positioned absolute right at 60 (to leave room for the 今天 button at right: 24):

```tsx
<TouchableOpacity onPress={() => setFinderVisible(true)} style={styles.finderButton}>
  <Text style={[styles.themeIcon, { color: colors.muted }]}>{'🧭'}</Text>
</TouchableOpacity>
```

Add style for `finderButton`:

```typescript
finderButton: {
  position: 'absolute',
  right: 60,
},
```

After the `TodayWidget` component, add:

```tsx
<AuspiciousFinderScreen
  visible={finderVisible}
  onClose={() => setFinderVisible(false)}
  onSelectDate={handleFinderSelectDate}
/>
```

- [ ] **Step 2: Verify the app builds**

Run: `npx tsc --noEmit 2>&1 | head -30`

Fix any type errors.

- [ ] **Step 3: Commit**

```bash
git add App.tsx
git commit -m "feat: integrate auspicious date finder into main app"
```

---

### Task 9: Manual Testing & Polish

**Files:**
- Potentially modify any of the above files

- [ ] **Step 1: Start the dev server and test the full flow**

Run: `npx expo start`

Test checklist:
1. Compass icon visible in header
2. Tapping compass opens finder screen with slide animation
3. Activity categories expand/collapse, chips select correctly
4. Zodiac grid selects and highlights correctly
5. Range selector toggles between 30/60/90/180
6. Search button disabled when no activity selected
7. Search returns results as compact cards
8. Scrolling near bottom loads more results
9. Tapping a result navigates to that date in Daily Detail
10. Back button dismisses the finder
11. Zodiac persists across sessions (close and reopen finder)
12. Empty state shows when no results found
13. Light/dark theme renders correctly throughout
14. "修改" link returns to form view

- [ ] **Step 2: Fix any issues found during testing**

Address visual, functional, or interaction issues.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: polish auspicious date finder"
```
