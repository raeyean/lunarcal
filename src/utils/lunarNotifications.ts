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
