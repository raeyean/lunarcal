import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  Switch,
  StyleSheet,
  Platform,
  Animated,
  Alert,
  Linking,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { Fonts, Typography } from '../constants/typography';
import {
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
} from '../utils/notificationSettings';
import { scheduleAllLunarNotifications, requestNotificationPermissions, PermissionResult } from '../utils/lunarNotifications';
import { IconButton } from './IconButton';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';

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
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      getNotificationSettings().then(setSettings);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [visible, slideAnim]);

  const handleToggle = useCallback(async (value: boolean) => {
    if (value) {
      const result: PermissionResult = await requestNotificationPermissions();
      if (result === 'blocked') {
        Alert.alert(
          '需要通知權限',
          '請前往系統設定，允許「LunarCal」傳送通知。',
          [
            { text: '取消', style: 'cancel' },
            { text: '前往設定', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
      if (result === 'denied') return;
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
    <Modal visible={modalVisible} animationType="none" transparent statusBarTranslucent>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.sheet, { backgroundColor: colors.background, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>設定</Text>
            <IconButton
              onPress={onClose}
              accessibilityLabel="關閉設定"
              variant="ghost"
            >
              <Text style={[styles.closeButton, { color: colors.primary }]}>完成</Text>
            </IconButton>
          </View>

          <Text style={[styles.sectionHeader, { color: colors.muted }]}>外觀</Text>

          <View style={[styles.row, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>深色模式</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ true: colors.primary }}
              accessibilityLabel="深色模式"
              accessibilityRole="switch"
              accessibilityState={{ checked: isDark }}
            />
          </View>

          <Text style={[styles.sectionHeader, { color: colors.muted }]}>通知</Text>

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
              accessibilityLabel="初一十五提醒"
              accessibilityRole="switch"
              accessibilityState={{ checked: settings.enabled }}
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
                  <IconButton
                    onPress={() => setShowTimePicker(true)}
                    accessibilityLabel={`提醒時間 ${timeDisplay}`}
                    variant="ghost"
                  >
                    <Text style={[styles.timeText, { color: colors.primary }]}>{timeDisplay}</Text>
                  </IconButton>
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
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: Fonts.outfitBold,
    fontSize: 20,
  },
  closeButton: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 16,
  },
  sectionHeader: {
    ...Typography.sectionTitle,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  rowLabel: {
    flex: 1,
    marginRight: Spacing.lg,
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
