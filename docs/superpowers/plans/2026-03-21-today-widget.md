# Today Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a swipe-down-dismissable "Today at a Glance" overlay card showing Yi/Ji and Ganzhi info on app cold start.

**Architecture:** New `TodayWidget` modal component rendered in `App.tsx`. Uses `Animated` + `PanResponder` for swipe-down dismiss, `AsyncStorage` for "don't show today" persistence, `expo-linear-gradient` for card background, and existing `getDayData` + `ThemeContext` for data/theming.

**Tech Stack:** React Native (Modal, Animated, PanResponder), expo-linear-gradient, AsyncStorage, TypeScript

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/TodayWidget.tsx` | Create | Self-contained modal overlay: layout, gradient card, Yi/Ji sub-cards, swipe-down dismiss animation |
| `App.tsx` | Modify | Add widget visibility state, AsyncStorage check on mount, dismiss handlers, render `<TodayWidget>` |

---

### Task 1: Install expo-linear-gradient

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the dependency**

```bash
npx expo install expo-linear-gradient
```

- [ ] **Step 2: Verify installation**

```bash
node -e "require('expo-linear-gradient'); console.log('OK')"
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add expo-linear-gradient dependency for Today widget"
```

---

### Task 2: Create TodayWidget component

**Files:**
- Create: `src/components/TodayWidget.tsx`

**Reference files (read before implementing):**
- `src/utils/lunar.ts` — `getDayData()` signature and `DayData` interface
- `src/context/ThemeContext.tsx` — `useTheme()` and `ThemeColors` shape
- `src/constants/colors.ts` — `LightColors` and `DarkColors` for theme-aware colors
- `src/constants/typography.ts` — `Typography` and `Fonts` for text styles
- `src/components/GanzhiHero.tsx` — reference for how Ganzhi data is displayed

- [ ] **Step 1: Create the component file with props and data**

Create `src/components/TodayWidget.tsx`:

```tsx
import React, { useRef, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { getDayData } from '../utils/lunar';
import { Fonts, Typography } from '../constants/typography';

interface TodayWidgetProps {
  visible: boolean;
  onDismiss: () => void;
  onDismissToday: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_THRESHOLD = 150;

export function TodayWidget({ visible, onDismiss, onDismissToday }: TodayWidgetProps) {
  const { colors, isDark } = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const today = useMemo(() => {
    const now = new Date();
    return getDayData(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          opacity.setValue(1 - gestureState.dy / (SCREEN_HEIGHT * 0.5));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD) {
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: SCREEN_HEIGHT,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start(() => {
            translateY.setValue(0);
            opacity.setValue(1);
            onDismiss();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          Animated.spring(opacity, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const { ganzhi, lunar, yi, ji } = today;
  const yiItems = yi.slice(0, 3);
  const jiItems = ji.slice(0, 3);

  const gradientColors: [string, string] = isDark
    ? ['rgba(240,67,36,0.15)', 'rgba(18,18,18,0.95)']
    : ['rgba(240,67,36,0.12)', 'rgba(255,255,255,0.95)'];

  const subCardYiBg = isDark ? 'rgba(240,67,36,0.12)' : 'rgba(240,67,36,0.08)';
  const subCardYiBorder = isDark ? 'rgba(240,67,36,0.25)' : 'rgba(240,67,36,0.2)';
  const subCardJiBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
  const subCardJiBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.backdrop, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }]}>
        <Animated.View
          style={[styles.cardWrapper, { transform: [{ translateY }], opacity }]}
          {...panResponder.panHandlers}
        >
          <LinearGradient colors={gradientColors} style={[styles.card, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
            <Text style={[styles.label, { color: colors.muted }]}>TODAY AT A GLANCE</Text>

            <Text style={[styles.heroGanzhi, { color: colors.primary }]}>
              {ganzhi.day}日
            </Text>

            <Text style={[styles.subtitle, { color: colors.subtleText }]}>
              {ganzhi.year}年 {ganzhi.month}月 | 農曆{lunar.monthCn}月{lunar.dayCn}
            </Text>

            <View style={styles.yiJiRow}>
              <View style={[styles.subCard, { backgroundColor: subCardYiBg, borderColor: subCardYiBorder }]}>
                <Text style={[styles.subCardTitle, { color: colors.primary }]}>宜</Text>
                {yiItems.map((item, idx) => (
                  <Text key={idx} style={[styles.subCardItem, { color: colors.foreground }]}>{item}</Text>
                ))}
              </View>
              <View style={[styles.subCard, { backgroundColor: subCardJiBg, borderColor: subCardJiBorder }]}>
                <Text style={[styles.subCardTitle, { color: colors.jiDark }]}>忌</Text>
                {jiItems.map((item, idx) => (
                  <Text key={idx} style={[styles.subCardItem, { color: colors.foreground }]}>{item}</Text>
                ))}
              </View>
            </View>

            <Text style={[styles.hint, { color: colors.muted }]}>
              Swipe down to dismiss
            </Text>

            <TouchableOpacity onPress={onDismissToday}>
              <Text style={[styles.dismissToday, { color: colors.subtleText }]}>
                Don't show again today
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 380,
  },
  card: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    gap: 8,
  },
  label: {
    fontFamily: Fonts.interMedium,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroGanzhi: {
    fontFamily: Fonts.outfitBlack,
    fontSize: 36,
    letterSpacing: 4,
  },
  subtitle: {
    fontFamily: Fonts.inter,
    fontSize: 12,
    marginBottom: 16,
  },
  yiJiRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  subCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    gap: 6,
  },
  subCardTitle: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 18,
    marginBottom: 4,
  },
  subCardItem: {
    fontFamily: Fonts.interMedium,
    fontSize: 13,
    lineHeight: 20,
  },
  hint: {
    fontFamily: Fonts.inter,
    fontSize: 11,
    marginTop: 16,
  },
  dismissToday: {
    fontFamily: Fonts.interMedium,
    fontSize: 12,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
});
```

- [ ] **Step 2: Verify the file compiles**

```bash
npx tsc --noEmit src/components/TodayWidget.tsx
```
Expected: No errors (or run full `npx tsc --noEmit` if single-file check isn't supported)

- [ ] **Step 3: Commit**

```bash
git add src/components/TodayWidget.tsx
git commit -m "feat: add TodayWidget overlay component with swipe-down dismiss"
```

---

### Task 3: Integrate TodayWidget into App.tsx

**Files:**
- Modify: `App.tsx`

**Reference files (read before implementing):**
- `App.tsx` — current state, imports, `AppContent` component structure
- `src/components/TodayWidget.tsx` — the component just created

- [ ] **Step 1: Add imports to App.tsx**

Add at the top of `App.tsx`, after existing imports:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TodayWidget } from './src/components/TodayWidget';
```

- [ ] **Step 2: Add widget state and dismiss logic to AppContent**

Inside `AppContent()`, after the existing `useState` declarations (after `const [settingsVisible, setSettingsVisible] = useState(false);`), add:

```tsx
const [showWidget, setShowWidget] = useState(false);

useEffect(() => {
  AsyncStorage.getItem('todayWidgetDismissedDate').then(val => {
    const todayStr = new Date().toISOString().split('T')[0];
    setShowWidget(val !== todayStr);
  });
}, []);

const handleWidgetDismiss = useCallback(() => {
  setShowWidget(false);
}, []);

const handleWidgetDismissToday = useCallback(() => {
  const todayStr = new Date().toISOString().split('T')[0];
  AsyncStorage.setItem('todayWidgetDismissedDate', todayStr);
  setShowWidget(false);
}, []);
```

- [ ] **Step 3: Render TodayWidget in AppContent JSX**

After the `<SettingsModal ... />` closing tag and before the closing `</SafeAreaView>`, add:

```tsx
<TodayWidget
  visible={showWidget}
  onDismiss={handleWidgetDismiss}
  onDismissToday={handleWidgetDismissToday}
/>
```

- [ ] **Step 4: Verify compilation**

```bash
npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add App.tsx
git commit -m "feat: integrate TodayWidget into app with dismiss-today persistence"
```

---

### Task 4: Manual smoke test

- [ ] **Step 1: Start the app**

```bash
npm start
```

Open on iOS simulator or device.

- [ ] **Step 2: Verify widget appears on launch**

Expected: The gradient "Today at a Glance" card appears centered on screen with:
- Day Ganzhi as large hero text
- Year/month Ganzhi and lunar date as subtitle
- Yi (宜) sub-card with up to 3 items, warm accent border
- Ji (忌) sub-card with up to 3 items, neutral border
- "Swipe down to dismiss" hint
- "Don't show again today" link

- [ ] **Step 3: Verify swipe down dismiss**

Swipe the card down. Expected:
- Card follows finger, fades as it moves
- Past ~150px, card animates off-screen
- Normal app content visible underneath

- [ ] **Step 4: Verify widget reappears on restart**

Kill and relaunch the app. Expected: Widget appears again.

- [ ] **Step 5: Verify "don't show again today"**

Tap "Don't show again today". Kill and relaunch. Expected: Widget does NOT appear.

- [ ] **Step 6: Verify dark mode**

Toggle dark mode in settings. Kill and relaunch. Expected: Widget renders with dark theme colors.

- [ ] **Step 7: Commit any fixes if needed**

If any visual tweaks are needed during smoke testing, make them and commit:

```bash
git add -A
git commit -m "fix: polish TodayWidget styling from smoke test"
```
