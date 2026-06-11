import { getDayData } from './lunar';
import { setWidgetData } from '../../modules/widget-bridge';

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const DAYS_AHEAD = 7;

/** Shape consumed by LunarCalculator.swift (SharedDayInfo). Keys must match. */
interface WidgetDayInfo {
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  weekdayCn: string;
  lunarMonthCn: string;
  lunarDayCn: string;
  yearGanzhi: string;
  monthGanzhi: string;
  dayGanzhi: string;
  clashAnimal: string;
  clashEmoji: string;
  clashBranch: string;
  sha: string;
  nayin: string;
  nextJieqi: string | null;
  nextJieqiDate: string | null;
  yi: string[];
  ji: string[];
}

const pad = (n: number) => String(n).padStart(2, '0');

function buildEntry(year: number, month: number, day: number): WidgetDayInfo {
  const data = getDayData(year, month, day);
  // clash.animal looks like "沖羊 (未)" — pull the branch out of the parens.
  const clashBranch = data.clash.animal.match(/\((.+?)\)/)?.[1] ?? '';
  // clash.element looks like "五行：桑柘木" — the nayin is everything after the colon.
  const nayin = data.clash.element.replace(/^五行[:：]/, '');

  // Mirror the widget's jieqi semantics: a jieqi falling *today* shows just its
  // name; otherwise show the upcoming one ("X將至").
  const todayJieqi = data.jieqi ?? null;
  const nextJieqi = todayJieqi ?? data.nextJieqi?.name ?? null;
  const nextJieqiDate = todayJieqi ? null : (data.nextJieqi?.date ?? null);

  return {
    solarYear: year,
    solarMonth: month,
    solarDay: day,
    weekdayCn: WEEKDAYS[data.solar.weekDay] ?? '',
    lunarMonthCn: data.lunar.monthCn,
    lunarDayCn: data.lunar.dayCn,
    yearGanzhi: data.ganzhi.year,
    monthGanzhi: data.ganzhi.month,
    dayGanzhi: data.ganzhi.day,
    clashAnimal: data.clash.zodiac,
    clashEmoji: data.clash.emoji,
    clashBranch,
    sha: data.clash.sha,
    nayin,
    nextJieqi,
    nextJieqiDate,
    yi: data.yi,
    ji: data.ji,
  };
}

/**
 * Compute the real lunar data (from lunar-javascript, the same engine the app
 * UI uses) for today and the next several days, and hand it to the home-screen
 * widget via the App Group. The widget reads this instead of its own fallback
 * calculator, so the widget and the app never disagree.
 */
export function syncWidget(): void {
  try {
    const payload: Record<string, WidgetDayInfo> = {};
    const start = new Date();
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const day = d.getDate();
      payload[`${y}-${pad(m)}-${pad(day)}`] = buildEntry(y, m, day);
    }
    setWidgetData(JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to sync widget data:', err);
  }
}
