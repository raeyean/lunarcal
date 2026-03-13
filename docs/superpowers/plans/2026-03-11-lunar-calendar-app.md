# LunarCal - Lunar Calendar App Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chinese lunar calendar React Native app with monthly calendar view and daily detail view, matching the lunarCal.pen design.

**Architecture:** Two-screen app toggled by a pill control. Calendar screen shows a monthly grid with lunar dates; daily detail screen shows Ganzhi pillars, Jieqi info, Yi/Ji activities, and zodiac clash data. All Chinese calendar calculations come from `lunar-javascript` library.

**Tech Stack:** Expo 54, React Native 0.81, TypeScript, lunar-javascript, expo-font (for Outfit + Inter fonts)

---

## File Structure

```
src/
  constants/
    colors.ts              - Design color tokens
    typography.ts          - Font family/weight/size presets
  utils/
    lunar.ts               - Wrapper around lunar-javascript for all calendar data
  components/
    CalendarCell.tsx        - Day cell variants (Default/Active/Jieqi/Empty)
    TogglePill.tsx          - Two-tab toggle control
    MonthHeader.tsx         - Month title with left/right nav arrows
    WeekHeader.tsx          - 日一二三四五六 row
    CalendarGrid.tsx        - 5-week grid of CalendarCells
    BottomPanel.tsx         - Calendar view bottom summary (date info + Yi/Ji compact)
    GanzhiHero.tsx          - Red hero card with year/month/day pillars
    JieqiBanner.tsx         - Solar term banner with dot
    YiJiCard.tsx            - Yi or Ji activity list card
    ClashSection.tsx        - Zodiac clash card with emoji, description, badges
    Badge.tsx               - Small rounded badge
    ClashInfo.tsx            - Small clash pill (emoji + text)
  screens/
    CalendarScreen.tsx      - Monthly calendar view
    DailyDetailScreen.tsx   - Daily detail view
App.tsx                     - Root component with view toggle state + font loading
```

---

## Chunk 1: Foundation & Data Layer

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install lunar-javascript and fonts**

```bash
cd /Users/ryanwong/Documents/Personal/project/react-native/LunarCal
npx expo install expo-font @expo-google-fonts/outfit @expo-google-fonts/inter
npm install lunar-javascript
```

- [ ] **Step 2: Verify installation**

```bash
cat package.json | grep -E "lunar|font|outfit|inter"
```

Expected: All packages listed in dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install lunar-javascript and font dependencies"
```

---

### Task 2: Design Tokens

**Files:**
- Create: `src/constants/colors.ts`
- Create: `src/constants/typography.ts`

- [ ] **Step 1: Create color tokens**

`src/constants/colors.ts`:
```typescript
export const Colors = {
  primary: '#f04324',
  primaryLight: '#FEF0EC',
  foreground: '#000000',
  surface: '#F4F4F5',
  jiDark: '#27272A',
  badgeBg: '#E4E4E7',
  muted: '#A1A1AA',
  subtleText: '#71717A',
  white: '#FFFFFF',
  background: '#FFFFFF',
  bottomPanelBg: '#FAFAFA',
  divider: '#F4F4F5',
  whiteTranslucent80: 'rgba(255,255,255,0.8)',
  whiteTranslucent50: 'rgba(255,255,255,0.5)',
  whiteOverlay: 'rgba(255,255,255,0.1)',
} as const;
```

- [ ] **Step 2: Create typography presets**

`src/constants/typography.ts`:
```typescript
import { TextStyle } from 'react-native';

export const Fonts = {
  outfit: 'Outfit_400Regular',
  outfitSemiBold: 'Outfit_600SemiBold',
  outfitBold: 'Outfit_700Bold',
  outfitExtraBold: 'Outfit_800ExtraBold',
  outfitBlack: 'Outfit_900Black',
  inter: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
} as const;

export const Typography = {
  heroGanzhi: {
    fontFamily: 'Outfit_900Black',
    fontSize: 40,
    letterSpacing: -1,
    lineHeight: 38,
  } as TextStyle,
  screenHeader: {
    fontFamily: 'Outfit_800ExtraBold',
    fontSize: 20,
    letterSpacing: -0.5,
  } as TextStyle,
  calendarDay: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
  } as TextStyle,
  calendarDayActive: {
    fontFamily: 'Outfit_800ExtraBold',
    fontSize: 18,
  } as TextStyle,
  cardTitle: {
    fontFamily: 'Outfit_800ExtraBold',
    fontSize: 20,
  } as TextStyle,
  sectionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    letterSpacing: 1,
  } as TextStyle,
  toggleActive: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
  } as TextStyle,
  toggleInactive: {
    fontFamily: 'Outfit_500Medium' as string,
    fontSize: 13,
  } as TextStyle,
  weekDay: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
  } as TextStyle,
  lunarDateCell: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
  } as TextStyle,
  jieqiBanner: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  } as TextStyle,
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  } as TextStyle,
  bodyMedium: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  } as TextStyle,
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  } as TextStyle,
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  } as TextStyle,
  monthEnglish: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  } as TextStyle,
  dateSummary: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
  } as TextStyle,
  clashName: {
    fontFamily: 'Outfit_800ExtraBold',
    fontSize: 16,
  } as TextStyle,
  badgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  } as TextStyle,
} as const;
```

- [ ] **Step 3: Commit**

```bash
git add src/constants/
git commit -m "feat: add design tokens for colors and typography"
```

---

### Task 3: Lunar Calendar Utility

**Files:**
- Create: `src/utils/lunar.ts`

- [ ] **Step 1: Create lunar calendar wrapper**

`src/utils/lunar.ts` - wraps `lunar-javascript` to provide all data the UI needs:

```typescript
import { Solar, Lunar, SolarMonth } from 'lunar-javascript';

export interface DayData {
  solar: { year: number; month: number; day: number; weekDay: number };
  lunar: { monthCn: string; dayCn: string; yearCn: string };
  ganzhi: {
    year: string;
    month: string;
    day: string;
    yearLabel: string;
    monthLabel: string;
    dayLabel: string;
  };
  yi: string[];
  ji: string[];
  clash: {
    animal: string;
    emoji: string;
    description: string;
    direction: string;
    element: string;
  };
  jieqi: string | null;
  nextJieqi: { name: string; date: string } | null;
  isCurrentMonth: boolean;
}

const ANIMAL_EMOJI: Record<string, string> = {
  '鼠': '🐀', '牛': '🐂', '虎': '🐅', '兔': '🐇',
  '龍': '🐉', '蛇': '🐍', '馬': '🐴', '羊': '🐏',
  '猴': '🐒', '雞': '🐓', '狗': '🐕', '豬': '🐖',
  '龙': '🐉', '鸡': '🐓',
};

function getAnimalEmoji(chong: string): string {
  for (const [animal, emoji] of Object.entries(ANIMAL_EMOJI)) {
    if (chong.includes(animal)) return emoji;
  }
  return '🔴';
}

export function getDayData(year: number, month: number, day: number, currentMonth?: number): DayData {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const dayObj = lunar.getDay ? lunar : lunar;

  const chong = lunar.getDayChong();
  const chongAnimal = lunar.getDayChongShengXiao();
  const sha = lunar.getDaySha();
  const wuxing = lunar.getDayNaYin();

  // Get jieqi for this exact day
  const jieqi = lunar.getJieQi();

  // Find next jieqi
  let nextJieqi: { name: string; date: string } | null = null;
  for (let i = 1; i <= 45; i++) {
    const future = solar.next(i);
    const futureLunar = future.getLunar();
    const futureJq = futureLunar.getJieQi();
    if (futureJq) {
      nextJieqi = {
        name: futureJq,
        date: `${future.getMonth()}月${future.getDay()}日`,
      };
      break;
    }
  }

  const chongDesc = `${lunar.getDayChongDesc()}，屬${chongAnimal}者今日不宜動土、出行`;

  return {
    solar: {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      weekDay: solar.getWeek(),
    },
    lunar: {
      monthCn: lunar.getMonthInChinese(),
      dayCn: lunar.getDayInChinese(),
      yearCn: lunar.getYearInChinese(),
    },
    ganzhi: {
      year: lunar.getYearInGanZhi(),
      month: lunar.getMonthInGanZhi(),
      day: lunar.getDayInGanZhi(),
      yearLabel: '年',
      monthLabel: '月',
      dayLabel: '日',
    },
    yi: lunar.getDayYi(),
    ji: lunar.getDayJi(),
    clash: {
      animal: `沖${chongAnimal} (${chong})`,
      emoji: getAnimalEmoji(chongAnimal),
      description: chongDesc,
      direction: `煞${sha}`,
      element: `五行：${wuxing}`,
    },
    jieqi: jieqi || null,
    nextJieqi,
    isCurrentMonth: currentMonth ? month === currentMonth : true,
  };
}

export function getMonthDays(year: number, month: number): DayData[][] {
  const solarMonth = SolarMonth.fromYm(year, month);
  const weeks: DayData[][] = [];

  // Get first day of month
  const firstDay = Solar.fromYmd(year, month, 1);
  const firstWeekDay = firstDay.getWeek(); // 0=Sunday

  // Get days in month
  const daysInMonth = solarMonth.getDaysCount ? solarMonth.getDaysCount() :
    new Date(year, month, 0).getDate();

  let currentWeek: DayData[] = [];

  // Pad first week with empty slots
  for (let i = 0; i < firstWeekDay; i++) {
    currentWeek.push(getDayData(year, month, 1, month)); // placeholder, will mark empty
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(getDayData(year, month, day, month));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Pad last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(getDayData(year, month, 1, month)); // placeholder empty
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

export function getChineseMonthName(year: number, month: number): string {
  const numCn = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const yearStr = year.toString().split('').map(d => numCn[parseInt(d)]).join('');
  const monthNames = ['', '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return `${yearStr}年 ${monthNames[month]}`;
}

export function getEnglishMonthName(year: number, month: number): string {
  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[month]} ${year}`;
}

export function getChineseDayName(year: number, month: number, day: number): string {
  const months = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const solar = Solar.fromYmd(year, month, day);
  return `${months[month]}月${numToChinese(day)}日 ${weekDays[solar.getWeek()]}`;
}

function numToChinese(num: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (num <= 10) return digits[num];
  if (num < 20) return `十${digits[num - 10]}`;
  if (num === 20) return '二十';
  if (num < 30) return `二十${digits[num - 20]}`;
  if (num === 30) return '三十';
  return `三十${digits[num - 30]}`;
}

export function getEnglishDayName(year: number, month: number, day: number): string {
  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[month]} ${day}, ${year}`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/
git commit -m "feat: add lunar calendar utility with full Chinese calendar data"
```

---

## Chunk 2: UI Components

### Task 4: Small Reusable Components

**Files:**
- Create: `src/components/Badge.tsx`
- Create: `src/components/ClashInfo.tsx`
- Create: `src/components/TogglePill.tsx`

- [ ] **Step 1: Create Badge component**

`src/components/Badge.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface BadgeProps {
  label: string;
}

export function Badge({ label }: BadgeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.badgeBg,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Typography.badgeText,
    color: Colors.subtleText,
  },
});
```

- [ ] **Step 2: Create ClashInfo pill**

`src/components/ClashInfo.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface ClashInfoProps {
  emoji: string;
  label: string;
}

export function ClashInfo({ emoji, label }: ClashInfoProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  emoji: { fontSize: 14 },
  label: {
    ...Typography.badgeText,
    color: Colors.subtleText,
  },
});
```

- [ ] **Step 3: Create TogglePill component**

`src/components/TogglePill.tsx`:
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface TogglePillProps {
  activeTab: 'daily' | 'calendar';
  onToggle: (tab: 'daily' | 'calendar') => void;
}

export function TogglePill({ activeTab, onToggle }: TogglePillProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'daily' && styles.tabActive]}
        onPress={() => onToggle('daily')}
      >
        <Text style={[styles.tabText, activeTab === 'daily' && styles.tabTextActive]}>
          日詳
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'calendar' && styles.tabActive]}
        onPress={() => onToggle('calendar')}
      >
        <Text style={[styles.tabText, activeTab === 'calendar' && styles.tabTextActive]}>
          月曆
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 4,
    width: 240,
    height: 40,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.toggleActive,
    fontFamily: 'Outfit_500Medium',
    color: Colors.muted,
  },
  tabTextActive: {
    ...Typography.toggleActive,
    color: Colors.white,
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Badge.tsx src/components/ClashInfo.tsx src/components/TogglePill.tsx
git commit -m "feat: add Badge, ClashInfo, and TogglePill components"
```

---

### Task 5: Calendar Components

**Files:**
- Create: `src/components/CalendarCell.tsx`
- Create: `src/components/WeekHeader.tsx`
- Create: `src/components/MonthHeader.tsx`
- Create: `src/components/CalendarGrid.tsx`

- [ ] **Step 1: Create CalendarCell**

`src/components/CalendarCell.tsx`:
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface CalendarCellProps {
  day: number;
  lunarText: string;
  isActive: boolean;
  isJieqi: boolean;
  isEmpty: boolean;
  onPress: () => void;
}

export function CalendarCell({ day, lunarText, isActive, isJieqi, isEmpty, onPress }: CalendarCellProps) {
  if (isEmpty) {
    return <View style={styles.container} />;
  }

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onPress}
    >
      <Text style={[
        styles.dayNumber,
        isActive && styles.dayNumberActive,
      ]}>
        {day}
      </Text>
      <Text style={[
        styles.lunarText,
        isActive && styles.lunarTextActive,
        isJieqi && !isActive && styles.lunarTextJieqi,
      ]}>
        {lunarText}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  activeContainer: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  dayNumber: {
    ...Typography.calendarDay,
    color: Colors.foreground,
  },
  dayNumberActive: {
    ...Typography.calendarDayActive,
    color: Colors.white,
  },
  lunarText: {
    ...Typography.lunarDateCell,
    color: Colors.muted,
  },
  lunarTextActive: {
    color: Colors.white,
  },
  lunarTextJieqi: {
    color: Colors.primary,
    fontFamily: 'Inter_500Medium',
  },
});
```

- [ ] **Step 2: Create WeekHeader**

`src/components/WeekHeader.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

const DAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function WeekHeader() {
  return (
    <View style={styles.container}>
      {DAYS.map((day) => (
        <Text key={day} style={styles.dayText}>{day}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  dayText: {
    ...Typography.weekDay,
    color: Colors.muted,
    width: 44,
    textAlign: 'center',
  },
});
```

- [ ] **Step 3: Create MonthHeader**

`src/components/MonthHeader.tsx`:
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface MonthHeaderProps {
  titleCn: string;
  titleEn: string;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthHeader({ titleCn, titleEn, onPrev, onNext }: MonthHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrev} hitSlop={12}>
        <Text style={styles.arrow}>‹</Text>
      </TouchableOpacity>
      <View style={styles.titleGroup}>
        <Text style={styles.titleCn}>{titleCn}</Text>
        <Text style={styles.titleEn}>{titleEn}</Text>
      </View>
      <TouchableOpacity onPress={onNext} hitSlop={12}>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  titleGroup: {
    alignItems: 'center',
    gap: 2,
  },
  titleCn: {
    ...Typography.screenHeader,
    color: Colors.foreground,
  },
  titleEn: {
    ...Typography.monthEnglish,
    color: Colors.muted,
  },
  arrow: {
    fontSize: 28,
    color: Colors.foreground,
    fontWeight: '300',
  },
});
```

- [ ] **Step 4: Create CalendarGrid**

`src/components/CalendarGrid.tsx`:
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CalendarCell } from './CalendarCell';
import { DayData } from '../utils/lunar';

interface CalendarGridProps {
  weeks: DayData[][];
  selectedDay: number;
  currentMonth: number;
  daysInMonth: number;
  firstWeekDay: number;
  onSelectDay: (day: number) => void;
}

export function CalendarGrid({
  weeks,
  selectedDay,
  currentMonth,
  daysInMonth,
  firstWeekDay,
  onSelectDay,
}: CalendarGridProps) {
  let dayCounter = 0;

  return (
    <View style={styles.container}>
      {weeks.map((week, weekIdx) => (
        <View key={weekIdx} style={styles.weekRow}>
          {week.map((dayData, cellIdx) => {
            const globalIdx = weekIdx * 7 + cellIdx;
            const isEmpty = globalIdx < firstWeekDay || globalIdx >= firstWeekDay + daysInMonth;

            if (isEmpty) {
              return (
                <CalendarCell
                  key={cellIdx}
                  day={0}
                  lunarText=""
                  isActive={false}
                  isJieqi={false}
                  isEmpty={true}
                  onPress={() => {}}
                />
              );
            }

            const day = globalIdx - firstWeekDay + 1;
            const lunarText = dayData.jieqi || dayData.lunar.dayCn;
            const isJieqi = !!dayData.jieqi;

            return (
              <CalendarCell
                key={cellIdx}
                day={day}
                lunarText={lunarText}
                isActive={day === selectedDay}
                isJieqi={isJieqi}
                isEmpty={false}
                onPress={() => onSelectDay(day)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 2,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
```

- [ ] **Step 5: Commit**

```bash
git add src/components/CalendarCell.tsx src/components/WeekHeader.tsx src/components/MonthHeader.tsx src/components/CalendarGrid.tsx
git commit -m "feat: add calendar grid components"
```

---

### Task 6: Daily Detail Components

**Files:**
- Create: `src/components/GanzhiHero.tsx`
- Create: `src/components/JieqiBanner.tsx`
- Create: `src/components/YiJiCard.tsx`
- Create: `src/components/ClashSection.tsx`
- Create: `src/components/BottomPanel.tsx`

- [ ] **Step 1: Create GanzhiHero**

`src/components/GanzhiHero.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface GanzhiHeroProps {
  yearGanzhi: string;
  monthGanzhi: string;
  dayGanzhi: string;
  lunarDateString: string;
}

export function GanzhiHero({ yearGanzhi, monthGanzhi, dayGanzhi, lunarDateString }: GanzhiHeroProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>天干地支</Text>
      <View style={styles.pillarsRow}>
        <View style={styles.pillar}>
          <Text style={styles.pillarLabel}>年</Text>
          <Text style={styles.pillarValue}>{yearGanzhi}</Text>
        </View>
        <View style={styles.pillar}>
          <Text style={styles.pillarLabel}>月</Text>
          <Text style={styles.pillarValue}>{monthGanzhi}</Text>
        </View>
        <View style={styles.pillar}>
          <Text style={styles.pillarLabel}>日</Text>
          <Text style={styles.pillarValue}>{dayGanzhi}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>{lunarDateString}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    gap: 8,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.whiteTranslucent50,
  },
  pillarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  pillar: {
    gap: 2,
  },
  pillarLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.whiteTranslucent50,
  },
  pillarValue: {
    ...Typography.heroGanzhi,
    color: Colors.white,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.whiteTranslucent80,
  },
});
```

- [ ] **Step 2: Create JieqiBanner**

`src/components/JieqiBanner.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface JieqiBannerProps {
  text: string;
}

export function JieqiBanner({ text }: JieqiBannerProps) {
  if (!text) return null;

  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  text: {
    ...Typography.jieqiBanner,
    color: Colors.primary,
  },
});
```

- [ ] **Step 3: Create YiJiCard**

`src/components/YiJiCard.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface YiJiCardProps {
  type: 'yi' | 'ji';
  items: string[];
}

export function YiJiCard({ type, items }: YiJiCardProps) {
  const isYi = type === 'yi';
  const accentColor = isYi ? Colors.primary : Colors.jiDark;
  const title = isYi ? '宜' : '忌';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
      </View>
      {items.slice(0, 6).map((item, idx) => (
        <Text key={idx} style={styles.item}>{item}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accentBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  title: {
    ...Typography.cardTitle,
  },
  item: {
    ...Typography.bodyMedium,
    color: Colors.foreground,
  },
});
```

- [ ] **Step 4: Create ClashSection**

`src/components/ClashSection.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Badge } from './Badge';

interface ClashSectionProps {
  animal: string;
  emoji: string;
  description: string;
  direction: string;
  element: string;
}

export function ClashSection({ animal, emoji, description, direction, element }: ClashSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>相冲生肖</Text>
      <View style={styles.animalRow}>
        <View style={styles.emojiCircle}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.clashName}>{animal}</Text>
          <Text style={styles.clashDesc}>{description}</Text>
        </View>
      </View>
      <View style={styles.badges}>
        <Badge label={direction} />
        <Badge label="胎神佔方" />
        <Badge label={element} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
    color: Colors.foreground,
  },
  animalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  detail: {
    flex: 1,
    gap: 4,
  },
  clashName: {
    ...Typography.clashName,
    color: Colors.foreground,
  },
  clashDesc: {
    ...Typography.body,
    color: Colors.subtleText,
    lineHeight: 17,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
});
```

- [ ] **Step 5: Create BottomPanel** (for Calendar View)

`src/components/BottomPanel.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { ClashInfo } from './ClashInfo';
import { DayData } from '../utils/lunar';

interface BottomPanelProps {
  dayData: DayData;
}

export function BottomPanel({ dayData }: BottomPanelProps) {
  const { lunar, ganzhi, yi, ji, clash } = dayData;

  const dateStr = `${lunar.monthCn}月${lunar.dayCn} ${ganzhi.year}年 ${ganzhi.month}月 ${ganzhi.day}日`;
  const ganzhiStr = `天干地支：${ganzhi.day}日 · ${ganzhi.month}月 · ${ganzhi.year}年`;

  const yiStr1 = yi.slice(0, 3).join(' · ');
  const yiStr2 = yi.slice(3, 6).join(' · ');
  const jiStr1 = ji.slice(0, 3).join(' · ');
  const jiStr2 = ji.slice(3, 6).join(' · ');

  return (
    <View style={styles.container}>
      <View style={styles.dateRow}>
        <View style={styles.dateLeft}>
          <Text style={styles.dateNum}>{dateStr}</Text>
          <Text style={styles.ganzhi}>{ganzhiStr}</Text>
        </View>
        <ClashInfo emoji={clash.emoji} label={`沖${clash.animal.split('(')[0].replace('沖', '')}`} />
      </View>
      <View style={styles.yiJiRow}>
        <View style={styles.yiJiCol}>
          <Text style={[styles.yiJiLabel, { color: Colors.primary }]}>宜</Text>
          {yiStr1 ? <Text style={styles.yiJiText}>{yiStr1}</Text> : null}
          {yiStr2 ? <Text style={styles.yiJiText}>{yiStr2}</Text> : null}
        </View>
        <View style={styles.yiJiCol}>
          <Text style={[styles.yiJiLabel, { color: Colors.jiDark }]}>忌</Text>
          {jiStr1 ? <Text style={styles.yiJiText}>{jiStr1}</Text> : null}
          {jiStr2 ? <Text style={styles.yiJiText}>{jiStr2}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bottomPanelBg,
    padding: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLeft: {
    gap: 2,
  },
  dateNum: {
    ...Typography.dateSummary,
    color: Colors.foreground,
  },
  ganzhi: {
    ...Typography.subtitle,
    color: Colors.subtleText,
  },
  yiJiRow: {
    flexDirection: 'row',
    gap: 12,
  },
  yiJiCol: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  yiJiLabel: {
    fontFamily: 'Outfit_800ExtraBold',
    fontSize: 16,
  },
  yiJiText: {
    ...Typography.subtitle,
    color: Colors.subtleText,
  },
});
```

- [ ] **Step 6: Commit**

```bash
git add src/components/GanzhiHero.tsx src/components/JieqiBanner.tsx src/components/YiJiCard.tsx src/components/ClashSection.tsx src/components/BottomPanel.tsx
git commit -m "feat: add daily detail and bottom panel components"
```

---

## Chunk 3: Screens & App Shell

### Task 7: Calendar Screen

**Files:**
- Create: `src/screens/CalendarScreen.tsx`

- [ ] **Step 1: Create CalendarScreen**

`src/screens/CalendarScreen.tsx`:
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MonthHeader } from '../components/MonthHeader';
import { WeekHeader } from '../components/WeekHeader';
import { CalendarGrid } from '../components/CalendarGrid';
import { BottomPanel } from '../components/BottomPanel';
import { Colors } from '../constants/colors';
import { getMonthDays, getChineseMonthName, getEnglishMonthName, getDayData, DayData } from '../utils/lunar';
import { Solar } from 'lunar-javascript';

interface CalendarScreenProps {
  year: number;
  month: number;
  selectedDay: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (day: number) => void;
}

export function CalendarScreen({
  year, month, selectedDay,
  onPrevMonth, onNextMonth, onSelectDay,
}: CalendarScreenProps) {
  const weeks = getMonthDays(year, month);
  const firstDay = Solar.fromYmd(year, month, 1);
  const firstWeekDay = firstDay.getWeek();
  const daysInMonth = new Date(year, month, 0).getDate();

  const selectedDayData = getDayData(year, month, selectedDay, month);

  return (
    <View style={styles.container}>
      <MonthHeader
        titleCn={getChineseMonthName(year, month)}
        titleEn={getEnglishMonthName(year, month)}
        onPrev={onPrevMonth}
        onNext={onNextMonth}
      />
      <WeekHeader />
      <CalendarGrid
        weeks={weeks}
        selectedDay={selectedDay}
        currentMonth={month}
        daysInMonth={daysInMonth}
        firstWeekDay={firstWeekDay}
        onSelectDay={onSelectDay}
      />
      <View style={styles.divider} />
      <BottomPanel dayData={selectedDayData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/CalendarScreen.tsx
git commit -m "feat: add CalendarScreen with month grid and bottom panel"
```

---

### Task 8: Daily Detail Screen

**Files:**
- Create: `src/screens/DailyDetailScreen.tsx`

- [ ] **Step 1: Create DailyDetailScreen**

`src/screens/DailyDetailScreen.tsx`:
```typescript
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { GanzhiHero } from '../components/GanzhiHero';
import { JieqiBanner } from '../components/JieqiBanner';
import { YiJiCard } from '../components/YiJiCard';
import { ClashSection } from '../components/ClashSection';
import { MonthHeader } from '../components/MonthHeader';
import { Colors } from '../constants/colors';
import { getDayData, getChineseDayName, getEnglishDayName } from '../utils/lunar';

interface DailyDetailScreenProps {
  year: number;
  month: number;
  day: number;
  onPrevDay: () => void;
  onNextDay: () => void;
}

export function DailyDetailScreen({ year, month, day, onPrevDay, onNextDay }: DailyDetailScreenProps) {
  const dayData = getDayData(year, month, day);
  const { lunar, ganzhi, yi, ji, clash, jieqi, nextJieqi } = dayData;

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
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <GanzhiHero
          yearGanzhi={ganzhi.year}
          monthGanzhi={ganzhi.month}
          dayGanzhi={ganzhi.day}
          lunarDateString={lunarDateStr}
        />
        <JieqiBanner text={jieqiText} />
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
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/DailyDetailScreen.tsx
git commit -m "feat: add DailyDetailScreen with Ganzhi, Jieqi, Yi/Ji, and Clash"
```

---

### Task 9: App Root with Font Loading and View Toggle

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Update App.tsx**

Replace `App.tsx` entirely:

```typescript
import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold, Outfit_900Black } from '@expo-google-fonts/outfit';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { DailyDetailScreen } from './src/screens/DailyDetailScreen';
import { TogglePill } from './src/components/TogglePill';
import { SafeAreaView } from 'react-native';

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [activeTab, setActiveTab] = useState<'daily' | 'calendar'>('calendar');

  const handlePrevMonth = useCallback(() => {
    if (month === 1) {
      setMonth(12);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
    setSelectedDay(1);
  }, [month]);

  const handleNextMonth = useCallback(() => {
    if (month === 12) {
      setMonth(1);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
    setSelectedDay(1);
  }, [month]);

  const handlePrevDay = useCallback(() => {
    const d = new Date(year, month - 1, selectedDay - 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    setSelectedDay(d.getDate());
  }, [year, month, selectedDay]);

  const handleNextDay = useCallback(() => {
    const d = new Date(year, month - 1, selectedDay + 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    setSelectedDay(d.getDate());
  }, [year, month, selectedDay]);

  const handleToggle = useCallback((tab: 'daily' | 'calendar') => {
    setActiveTab(tab);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.toggleWrapper}>
        <TogglePill activeTab={activeTab} onToggle={handleToggle} />
      </View>
      {activeTab === 'calendar' ? (
        <CalendarScreen
          year={year}
          month={month}
          selectedDay={selectedDay}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSelectDay={setSelectedDay}
        />
      ) : (
        <DailyDetailScreen
          year={year}
          month={month}
          day={selectedDay}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  toggleWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
});
```

- [ ] **Step 2: Run the app to verify**

```bash
npx expo start --ios
```

Expected: App loads with calendar view, toggle works, lunar dates display.

- [ ] **Step 3: Commit**

```bash
git add App.tsx
git commit -m "feat: wire up App root with font loading and view toggle"
```

---

### Task 10: Visual Polish & Bug Fixes

- [ ] **Step 1: Run the app and compare with design screenshots**
- [ ] **Step 2: Fix any spacing, color, or typography mismatches**
- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "fix: visual polish to match design spec"
```
