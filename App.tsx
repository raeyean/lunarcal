import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
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
import { TogglePill } from './src/components/TogglePill';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import * as BackgroundFetch from 'expo-background-fetch';
import { scheduleAllLunarNotifications } from './src/utils/lunarNotifications';
import { BACKGROUND_NOTIFICATION_TASK } from './src/constants/tasks';
import { SettingsModal } from './src/components/SettingsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TodayWidget } from './src/components/TodayWidget';
import { AuspiciousFinderScreen } from './src/screens/AuspiciousFinderScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';

function AppContent() {
  const { colors, isDark, toggleTheme } = useTheme();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [activeTab, setActiveTab] = useState<'daily' | 'calendar'>('daily');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [finderVisible, setFinderVisible] = useState(false);

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

  const appState = useRef(AppState.currentState);

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

    // Reschedule when the app comes to the foreground in case background fetch
    // was killed by the OS (common on Android with battery optimisation).
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        scheduleAllLunarNotifications();
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

  const handleToggle = useCallback((tab: 'daily' | 'calendar') => {
    setActiveTab(tab);
  }, []);

  const handleGoToday = useCallback(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setSelectedDay(now.getDate());
  }, []);

  const isToday = (() => {
    const now = new Date();
    return year === now.getFullYear() && month === now.getMonth() + 1 && selectedDay === now.getDate();
  })();

  const handleFinderSelectDate = useCallback((y: number, m: number, d: number) => {
    setYear(y);
    setMonth(m);
    setSelectedDay(d);
    setActiveTab('daily');
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.toggleWrapper}>
        <TouchableOpacity
          onPress={() => setSettingsVisible(true)}
          style={styles.themeButton}
          accessibilityRole="button"
          accessibilityLabel="設定"
        >
          <Text style={[styles.themeIcon, { color: colors.muted }]}>{'⚙'}</Text>
        </TouchableOpacity>
        <TogglePill activeTab={activeTab} onToggle={handleToggle} />
        <TouchableOpacity
          onPress={() => setFinderVisible(true)}
          style={styles.finderButton}
          accessibilityRole="button"
          accessibilityLabel="擇吉日曆"
        >
          <Text style={[styles.themeIcon, { color: colors.muted }]}>{'🧭'}</Text>
        </TouchableOpacity>
      </View>
      <ErrorBoundary>
        {activeTab === 'calendar' ? (
          <CalendarScreen
            key={`${year}-${month}`}
            year={year}
            month={month}
            selectedDay={selectedDay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onSelectDay={setSelectedDay}
          />
        ) : (
          <DailyDetailScreen
            key={`${year}-${month}-${selectedDay}`}
            year={year}
            month={month}
            day={selectedDay}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
          />
        )}
      </ErrorBoundary>
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
      <TodayWidget
        visible={showWidget}
        onDismiss={handleWidgetDismiss}
        onDismissToday={handleWidgetDismissToday}
      />
      <AuspiciousFinderScreen
        visible={finderVisible}
        onClose={() => setFinderVisible(false)}
        onSelectDate={handleFinderSelectDate}
      />
      {!isToday && (
        <TouchableOpacity
          style={[styles.todayFab, { backgroundColor: colors.primary }]}
          onPress={handleGoToday}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="回到今天"
        >
          <Text style={styles.todayText}>今天</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

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

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f04324" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
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
    paddingVertical: 8,
    paddingHorizontal: 24,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  themeButton: {
    position: 'absolute',
    left: 24,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeIcon: {
    fontSize: 20,
  },
  todayFab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  todayText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  finderButton: {
    position: 'absolute',
    right: 24,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
