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
