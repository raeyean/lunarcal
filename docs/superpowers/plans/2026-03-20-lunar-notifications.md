# Lunar 1st/15th Notification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send local notifications the evening before every lunar 1st and 15th, with user-configurable time and background re-scheduling.

**Architecture:** Use `expo-notifications` for scheduling, `expo-task-manager` + `expo-background-fetch` for background re-scheduling, and `@react-native-async-storage/async-storage` for persisting settings. A utility computes the next 12 months of lunar 1st/15th solar dates using `lunar-javascript`. A settings modal (gear icon in header) lets users toggle notifications and pick reminder time.

**Tech Stack:** expo-notifications, expo-task-manager, expo-background-fetch, @react-native-async-storage/async-storage, lunar-javascript (existing), DateTimePicker (@react-native-community/datetimepicker)

**Known limitation:** Leap lunar months (e.g. leap 4th month) are not scheduled. Only the 12 standard months are covered. This can be enhanced later.

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/constants/tasks.ts` | Background task name constant (avoids circular imports) |
| Create | `src/utils/notificationSettings.ts` | Read/write notification preferences (enabled, hour, minute) from AsyncStorage |
| Create | `src/utils/lunarNotifications.ts` | Compute upcoming lunar 1st/15th solar dates, schedule/cancel notifications |
| Create | `src/components/SettingsModal.tsx` | Modal with theme toggle, notification toggle + time picker |
| Modify | `src/types/lunar-javascript.d.ts` | Add `Lunar.fromYmd`, `Lunar.getYear`, `Lunar.getSolar()` type declarations |
| Modify | `App.tsx` | Replace theme button with gear icon, mount SettingsModal, init notifications on launch |
| Modify | `app.json` | Add `expo-notifications` plugin config |
| Modify | `index.ts` | Register background task for notification re-scheduling |
| Modify | `package.json` | (via npm install -- new dependencies) |

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `app.json:33` (plugins array)

- [ ] **Step 1: Install packages**

```bash
npx expo install expo-notifications expo-task-manager expo-background-fetch @react-native-async-storage/async-storage @react-native-community/datetimepicker
```

- [ ] **Step 2: Add expo-notifications plugin to app.json**

In `app.json`, add to the `plugins` array:

```json
"plugins": [
  "expo-font",
  "./plugins/withWidget",
  [
    "expo-notifications",
    {
      "icon": "./assets/icon.png",
      "color": "#f04324"
    }
  ]
]
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json app.json
git commit -m "feat: add notification dependencies (expo-notifications, expo-task-manager, expo-background-fetch, async-storage, datetimepicker)"
```

---

## Task 2: Update lunar-javascript type declarations

**Files:**
- Modify: `src/types/lunar-javascript.d.ts`

- [ ] **Step 1: Add Lunar.fromYmd, getYear, and getSolar types**

Add to the `Lunar` class in the type declarations:

```typescript
static fromYmd(year: number, month: number, day: number): Lunar;
getYear(): number;
getSolar(): Solar;
```

- [ ] **Step 2: Commit**

```bash
git add src/types/lunar-javascript.d.ts
git commit -m "feat: add Lunar.fromYmd, getYear, and getSolar type declarations"
```

---

## Task 3: Create background task name constant

**Files:**
- Create: `src/constants/tasks.ts`

- [ ] **Step 1: Create tasks.ts**

```typescript
export const BACKGROUND_NOTIFICATION_TASK = 'LUNAR_NOTIFICATION_RESCHEDULE';
```

- [ ] **Step 2: Commit**

```bash
git add src/constants/tasks.ts
git commit -m "feat: add background task name constant"
```

---

## Task 4: Implement notification settings persistence

**Files:**
- Create: `src/utils/notificationSettings.ts`

- [ ] **Step 1: Create notificationSettings.ts**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'lunar_notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  hour: number;   // 0-23
  minute: number;  // 0-59
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  hour: 20,     // 8 PM default
  minute: 0,
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/notificationSettings.ts
git commit -m "feat: add notification settings persistence with AsyncStorage"
```

---

## Task 5: Implement lunar date computation and notification scheduling

**Files:**
- Create: `src/utils/lunarNotifications.ts`

- [ ] **Step 1: Create lunarNotifications.ts**

```typescript
import * as Notifications from 'expo-notifications';
import { Solar, Lunar } from 'lunar-javascript';
import { getNotificationSettings } from './notificationSettings';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const LUNAR_MONTH_NAMES = [
  '', '正', '二', '三', '四', '五', '六',
  '七', '八', '九', '十', '十一', '臘',
];

interface LunarDate {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  solarDate: Date;
  label: string;
}

/**
 * Compute the solar dates for the next ~12 months of lunar 1st and 15th days.
 * Returns the day BEFORE each lunar date (the eve) for notification scheduling.
 * Note: Leap lunar months are not included.
 */
export function getUpcomingLunarDates(): LunarDate[] {
  const results: LunarDate[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const currentSolar = Solar.fromYmd(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const currentLunar = currentSolar.getLunar();
  const startYear = currentLunar.getYear();
  const startMonth = currentLunar.getMonth();

  for (let i = 0; i < 13; i++) {
    let lunarMonth = startMonth + i;
    let lunarYear = startYear;
    while (lunarMonth > 12) {
      lunarMonth -= 12;
      lunarYear += 1;
    }

    for (const lunarDay of [1, 15]) {
      try {
        const lunar = Lunar.fromYmd(lunarYear, lunarMonth, lunarDay);
        const solar = lunar.getSolar();
        const solarDate = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());

        const eveDate = new Date(solarDate);
        eveDate.setDate(eveDate.getDate() - 1);

        if (eveDate > today) {
          const dayName = lunarDay === 1 ? '初一' : '十五';
          results.push({
            lunarYear,
            lunarMonth,
            lunarDay,
            solarDate: eveDate,
            label: `農曆${LUNAR_MONTH_NAMES[lunarMonth]}月${dayName}`,
          });
        }
      } catch {
        continue;
      }
    }
  }

  results.sort((a, b) => a.solarDate.getTime() - b.solarDate.getTime());
  return results;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleAllLunarNotifications(): Promise<void> {
  const settings = await getNotificationSettings();

  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!settings.enabled) return;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const dates = getUpcomingLunarDates();

  for (const entry of dates) {
    const trigger = new Date(entry.solarDate);
    trigger.setHours(settings.hour, settings.minute, 0, 0);

    if (trigger <= new Date()) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '農曆提醒',
        body: `明天是${entry.label}`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/lunarNotifications.ts
git commit -m "feat: implement lunar 1st/15th notification scheduling logic"
```

---

## Task 6: Register background task for re-scheduling

**Files:**
- Modify: `index.ts`

- [ ] **Step 1: Add background task registration**

Replace the contents of `index.ts` with:

```typescript
import { registerRootComponent } from 'expo';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { scheduleAllLunarNotifications } from './src/utils/lunarNotifications';
import { BACKGROUND_NOTIFICATION_TASK } from './src/constants/tasks';

import App from './App';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    await scheduleAllLunarNotifications();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

registerRootComponent(App);
```

- [ ] **Step 2: Commit**

```bash
git add index.ts
git commit -m "feat: register background task for notification re-scheduling"
```

---

## Task 7: Initialize notifications on app launch

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Add notification initialization in App.tsx**

Add imports at the top of `App.tsx` (merge `useEffect` into the existing React import):

```typescript
import React, { useState, useCallback, useEffect } from 'react';
import * as BackgroundFetch from 'expo-background-fetch';
import { scheduleAllLunarNotifications } from './src/utils/lunarNotifications';
import { BACKGROUND_NOTIFICATION_TASK } from './src/constants/tasks';
```

Add inside `AppContent`, after the state declarations and before the handlers:

```typescript
useEffect(() => {
  async function initNotifications() {
    await scheduleAllLunarNotifications();
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
        minimumInterval: 60 * 60 * 24, // once per day
        stopOnTerminate: false,
        startOnBoot: true,
      });
    } catch {
      // Background fetch registration may fail on some platforms (e.g., web)
    }
  }
  initNotifications();
}, []);
```

- [ ] **Step 2: Commit**

```bash
git add App.tsx
git commit -m "feat: initialize notification scheduling on app launch"
```

---

## Task 8: Create SettingsModal and wire it into App.tsx

This task creates the SettingsModal component (with theme toggle, notification toggle, and time picker) and replaces the old standalone theme button with a gear icon that opens the modal.

**Files:**
- Create: `src/components/SettingsModal.tsx`
- Modify: `App.tsx`

- [ ] **Step 1: Create SettingsModal.tsx**

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import {
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
} from '../utils/notificationSettings';
import { scheduleAllLunarNotifications, requestNotificationPermissions } from '../utils/lunarNotifications';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export function SettingsModal({ visible, onClose, isDark, toggleTheme }: SettingsModalProps) {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    hour: 20,
    minute: 0,
  });
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      getNotificationSettings().then(setSettings);
    }
  }, [visible]);

  const handleToggle = useCallback(async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) return;
    }
    const updated = { ...settings, enabled: value };
    setSettings(updated);
    await saveNotificationSettings(updated);
    await scheduleAllLunarNotifications();
  }, [settings]);

  const handleTimeChange = useCallback(async (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      const updated = { ...settings, hour: date.getHours(), minute: date.getMinutes() };
      setSettings(updated);
      await saveNotificationSettings(updated);
      await scheduleAllLunarNotifications();
    }
  }, [settings]);

  const timeDisplay = `${settings.hour.toString().padStart(2, '0')}:${settings.minute.toString().padStart(2, '0')}`;

  const pickerDate = new Date();
  pickerDate.setHours(settings.hour, settings.minute, 0, 0);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>設定</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: colors.primary }]}>完成</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.row, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>深色模式</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ true: colors.primary }}
            />
          </View>

          <View style={[styles.row, { borderBottomColor: colors.divider }]}>
            <View style={styles.rowLabel}>
              <Text style={[styles.rowTitle, { color: colors.foreground }]}>初一十五提醒</Text>
              <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                農曆初一、十五前一晚提醒
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleToggle}
              trackColor={{ true: colors.primary }}
            />
          </View>

          {settings.enabled && (
            <View style={[styles.row, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.rowTitle, { color: colors.foreground }]}>提醒時間</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={pickerDate}
                  mode="time"
                  display="compact"
                  onChange={handleTimeChange}
                  themeVariant={isDark ? 'dark' : 'light'}
                />
              ) : (
                <>
                  <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                    <Text style={[styles.timeText, { color: colors.primary }]}>{timeDisplay}</Text>
                  </TouchableOpacity>
                  {showTimePicker && (
                    <DateTimePicker
                      value={pickerDate}
                      mode="time"
                      display="default"
                      onChange={handleTimeChange}
                    />
                  )}
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.outfitBold,
    fontSize: 20,
  },
  closeButton: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  rowLabel: {
    flex: 1,
    marginRight: 16,
  },
  rowTitle: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 16,
  },
  rowSubtitle: {
    fontFamily: Fonts.inter,
    fontSize: 12,
    marginTop: 2,
  },
  timeText: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 16,
  },
});
```

- [ ] **Step 2: Wire up gear icon and SettingsModal in App.tsx**

Add import:

```typescript
import { SettingsModal } from './src/components/SettingsModal';
```

Add state inside `AppContent`:

```typescript
const [settingsVisible, setSettingsVisible] = useState(false);
```

Replace the existing theme `TouchableOpacity` (the sun/moon button at `styles.themeButton`):

```tsx
<TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.themeButton}>
  <Text style={styles.themeIcon}>{'⚙️'}</Text>
</TouchableOpacity>
```

Add SettingsModal just before the closing `</SafeAreaView>`:

```tsx
<SettingsModal
  visible={settingsVisible}
  onClose={() => setSettingsVisible(false)}
  isDark={isDark}
  toggleTheme={toggleTheme}
/>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SettingsModal.tsx App.tsx
git commit -m "feat: add settings modal with gear icon, theme toggle, and notification settings"
```

---

## Task 9: Manual verification

- [ ] **Step 1: Run the app**

```bash
npx expo start
```

- [ ] **Step 2: Verify gear icon appears in header and opens settings modal**

- [ ] **Step 3: Verify theme toggle works inside settings modal**

- [ ] **Step 4: Verify toggling notifications requests permissions**

- [ ] **Step 5: Verify time picker works on both iOS and Android**

- [ ] **Step 6: Verify notifications are scheduled (check via Expo dev tools or add temporary console.log in scheduleAllLunarNotifications)**

- [ ] **Step 7: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues found during manual verification"
```
