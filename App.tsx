import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
        <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.themeButton}>
          <Text style={[styles.themeIcon, { color: colors.muted }]}>{'⚙'}</Text>
        </TouchableOpacity>
        <TogglePill activeTab={activeTab} onToggle={handleToggle} />
        <TouchableOpacity onPress={() => setFinderVisible(true)} style={styles.finderButton}>
          <Text style={[styles.themeIcon, { color: colors.muted }]}>{'🧭'}</Text>
        </TouchableOpacity>
        {!isToday && (
          <TouchableOpacity style={[styles.todayButton, { backgroundColor: colors.primary }]} onPress={handleGoToday}>
            <Text style={styles.todayText}>今天</Text>
          </TouchableOpacity>
        )}
      </View>
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
    return null;
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
  themeButton: {
    position: 'absolute',
    left: 24,
  },
  themeIcon: {
    fontSize: 20,
  },
  todayButton: {
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    position: 'absolute',
    right: 60,
  },
  todayText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  finderButton: {
    position: 'absolute',
    right: 24,
  },
});
