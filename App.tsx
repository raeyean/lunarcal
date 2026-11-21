import React, { useState, useCallback, useEffect, useRef } from 'react';
import Animated, { ReduceMotion, withTiming, type EntryExitAnimationFunction } from 'react-native-reanimated';
import { Duration, EASE_OUT, Offset } from './src/constants/motion';
import { View, Text, StyleSheet, ActivityIndicator, AppState, Platform, AppStateStatus, useColorScheme } from 'react-native';

// Cap accessibility text scaling so layouts don't break, while still respecting the OS setting.
// Applied via Text.defaultProps so every <Text> inherits it without per-call boilerplate.
const TextAny = Text as unknown as { defaultProps?: { maxFontSizeMultiplier?: number } };
TextAny.defaultProps = TextAny.defaultProps || {};
TextAny.defaultProps.maxFontSizeMultiplier = 1.3;
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/api/queryClient';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from '@expo-google-fonts/outfit';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { DailyDetailScreen } from './src/screens/DailyDetailScreen';
import { BottomTabBar } from './src/components/BottomTabBar';
import type { TabKey } from './src/components/BottomTabBar';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { BirthProfileProvider } from './src/context/BirthProfileContext';
import * as BackgroundFetch from 'expo-background-fetch';
import { scheduleAllLunarNotifications } from './src/utils/lunarNotifications';
import { BACKGROUND_NOTIFICATION_TASK } from './src/constants/tasks';
import { syncWidget } from './src/utils/widgetSync';
import { SettingsModal } from './src/components/SettingsModal';
import { DeityListModal } from './src/components/DeityListModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TodayWidget } from './src/components/TodayWidget';
import { AuspiciousFinderScreen } from './src/screens/AuspiciousFinderScreen';
import { MeScreen } from './src/screens/MeScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ActionMenuHost } from './src/components/ActionMenu';
import { IconButton } from './src/components/IconButton';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from './src/constants/spacing';
import { Radius } from './src/constants/radius';
import { LightColors, DarkColors } from './src/constants/colors';
import { Fonts } from './src/constants/typography';

function AppContent() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [activeTab, setActiveTab] = useState<TabKey>('daily');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [finderVisible, setFinderVisible] = useState(false);
  const [deityListVisible, setDeityListVisible] = useState(false);
  const [pendingGlossary, setPendingGlossary] = useState<'yi' | 'ji' | null>(null);
  // Bumped by direct date jumps (今天, finder, 我的), never by prev/next steps.
  // The calendar and daily screens are keyed by it: a step keeps them mounted
  // so the swiped-in panel's entrance runs on across the swap; a jump remounts
  // them with the plain entrance (#29).
  const [jumpId, setJumpId] = useState(0);
  const changeTab = useCallback((tab: TabKey) => {
    setActiveTab(tab);
  }, []);
  const jumpTo = useCallback((y: number, m: number, d: number) => {
    setYear(y);
    setMonth(m);
    setSelectedDay(d);
    setJumpId(id => id + 1);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('todayWidgetDismissedDate')
      .then(val => {
        const todayStr = new Date().toISOString().split('T')[0];
        setShowWidget(val !== todayStr);
      })
      .catch(err => {
        console.warn('Failed to load widget dismiss state:', err);
        setShowWidget(true);
      });
  }, []);

  const handleWidgetDismiss = useCallback(() => {
    setShowWidget(false);
  }, []);

  const handleWidgetDismissToday = useCallback(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    AsyncStorage.setItem('todayWidgetDismissedDate', todayStr).catch(err =>
      console.warn('Failed to save widget dismiss state:', err),
    );
    setShowWidget(false);
  }, []);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Notifications, background fetch and the home-screen widget are native-only.
    if (Platform.OS === 'web') return;

    async function initNotifications() {
      try {
        await scheduleAllLunarNotifications();
      } catch {
        // notifications unavailable; app continues without them
      }
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

    // Push today's real almanac data to the home-screen widget on launch.
    syncWidget();

    // Reschedule when the app comes to the foreground in case background fetch
    // was killed by the OS (common on Android with battery optimisation).
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current?.match(/inactive|background/) && nextState === 'active') {
        scheduleAllLunarNotifications().catch(err =>
          console.warn('Failed to reschedule notifications on resume:', err),
        );
        // Refresh widget data too (handles date rollover while backgrounded).
        syncWidget();
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);

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

  const handleGoToday = useCallback(() => {
    const now = new Date();
    jumpTo(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }, [jumpTo]);

  const isToday = (() => {
    const now = new Date();
    return year === now.getFullYear() && month === now.getMonth() + 1 && selectedDay === now.getDate();
  })();

  const handleFinderSelectDate = useCallback((y: number, m: number, d: number) => {
    jumpTo(y, m, d);
    changeTab('daily');
  }, [jumpTo, changeTab]);

  const handleGlossaryOpened = useCallback(() => setPendingGlossary(null), []);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.toggleWrapper}>
        <IconButton
          onPress={() => setSettingsVisible(true)}
          accessibilityLabel="設定"
          variant="ghost"
          style={styles.themeButton}
        >
          <Ionicons name="settings-outline" size={20} color={colors.muted} />
        </IconButton>
        <IconButton
          onPress={() => setFinderVisible(true)}
          accessibilityLabel="擇吉日曆"
          variant="ghost"
          style={styles.finderButton}
        >
          <Ionicons name="search-outline" size={20} color={colors.muted} />
        </IconButton>
      </View>
      <ErrorBoundary>
        <Animated.View key={activeTab} entering={tabEntering} style={{ flex: 1 }}>
        {activeTab === 'calendar' ? (
          <CalendarScreen
            key={jumpId}
            year={year}
            month={month}
            selectedDay={selectedDay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onSelectDay={setSelectedDay}
          />
        ) : activeTab === 'me' ? (
          <MeScreen
            onNavigateToDate={(y, m, d) => {
              jumpTo(y, m, d);
              changeTab('daily');
            }}
          />
        ) : (
          <DailyDetailScreen
            key={jumpId}
            year={year}
            month={month}
            day={selectedDay}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            openGlossaryTerm={pendingGlossary}
            onGlossaryOpened={handleGlossaryOpened}
          />
        )}
        </Animated.View>
      </ErrorBoundary>
      <BottomTabBar active={activeTab} onChange={changeTab} />
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onOpenDeityList={() => setDeityListVisible(true)}
      />
      <DeityListModal
        visible={deityListVisible}
        onClose={() => setDeityListVisible(false)}
      />
      <TodayWidget
        visible={showWidget}
        onDismiss={handleWidgetDismiss}
        onDismissToday={handleWidgetDismissToday}
        onOpenGlossary={(term) => {
          changeTab('daily');
          setPendingGlossary(term);
        }}
      />
      <AuspiciousFinderScreen
        visible={finderVisible}
        onClose={() => setFinderVisible(false)}
        onSelectDate={handleFinderSelectDate}
      />
      <ActionMenuHost />
      {!isToday && (
        <IconButton
          onPress={handleGoToday}
          accessibilityLabel="回到今天"
          variant="primary"
          style={[styles.todayFab, { bottom: insets.bottom + Spacing.xl + Spacing.md }]}
        >
          <Text style={[styles.todayText, { color: colors.onPrimary }]}>今天</Text>
        </IconButton>
      )}
    </SafeAreaView>
  );
}

const tabEntering: EntryExitAnimationFunction = () => {
  'worklet';
  const config = { duration: Duration.tabIn, easing: EASE_OUT, reduceMotion: ReduceMotion.System };
  return {
    initialValues: { opacity: 0, transform: [{ translateY: Offset.tabY }] },
    animations: {
      opacity: withTiming(1, config),
      transform: [{ translateY: withTiming(0, config) }],
    },
  };
};

export default function App() {
  const systemScheme = useColorScheme();
  const isDark = systemScheme === 'dark';
  const [fontsLoaded, fontError] = useFonts({
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

  if (!fontsLoaded && !fontError) {
    const palette = isDark ? DarkColors : LightColors;
    return (
      <View style={[styles.loadingContainer, { backgroundColor: palette.background }]}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <BirthProfileProvider>
              <AppContent />
            </BirthProfileProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeButton: {
    position: 'absolute',
    left: 24,
  },
  todayFab: {
    position: 'absolute',
    right: 24,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  todayText: {
    fontFamily: Fonts.outfitBold,
    fontSize: 14,
  },
  finderButton: {
    position: 'absolute',
    right: 24,
  },
});
