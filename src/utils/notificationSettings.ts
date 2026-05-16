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
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.warn('Failed to parse notification settings; using defaults:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
