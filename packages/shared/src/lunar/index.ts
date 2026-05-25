/// <reference path="../types/lunar-javascript.d.ts" />
import { Solar } from 'lunar-javascript';
import { getSpecialEvents } from '../data/specialEvents';
import { getDeityDay, type DeityDay } from '../data/deityDays';

export interface TongshuData {
  taishen: string;
  pengzuGan: string;
  pengzuZhi: string;
  jiShen: string[];
  xiongSha: string[];
  tianShen: string;
  tianShenType: string;
  tianShenLuck: string;
  zhiXing: string;
  xiu: string;
  xiuLuck: string;
  xiuSong: string;
  positionXi: string;
  positionCai: string;
  positionFu: string;
  dayLu: string;
  yueXiang: string;
  liuYao: string;
  wuHou: string;
}

export interface ShichenSlot {
  name: string;
  range: string;
  label: string;
  luck: '吉' | '凶' | '中';
  ganzhi: string;
}

export interface DayData {
  solar: { year: number; month: number; day: number; weekDay: number };
  lunar: {
    monthCn: string;
    dayCn: string;
    yearCn: string;
    monthNum: number;
    dayNum: number;
  };
  ganzhi: {
    year: string;
    month: string;
    day: string;
  };
  yi: string[];
  ji: string[];
  clash: {
    animal: string;
    emoji: string;
    description: string;
    direction: string;
    element: string;
    taishen: string;
    zodiac: string;
    sha: string;
  };
  tongshu: TongshuData;
  jieqi: string | null;
  nextJieqi: { name: string; date: string } | null;
  festivals: string[];
  festivalShort: string | null;
  isCurrentMonth: boolean;
  deity: DeityDay | null;
  phase: number;
  score: number;
  wuxing: string;
  xingxiu: string;
  directions: Record<string, string>;
  shichen: ShichenSlot[];
  luckyHours: ShichenSlot[];
  pengzu: string[];
}

const ANIMAL_EMOJI: Record<string, string> = {
  '鼠': '🐀', '牛': '🐂', '虎': '🐅', '兔': '🐇',
  '龍': '🐉', '龙': '🐉', '蛇': '🐍',
  '馬': '🐴', '马': '🐴', '羊': '🐏',
  '猴': '🐒', '雞': '🐓', '鸡': '🐓',
  '狗': '🐕', '豬': '🐖', '猪': '🐖',
};

function getAnimalEmoji(chong: string): string {
  for (const [animal, emoji] of Object.entries(ANIMAL_EMOJI)) {
    if (chong.includes(animal)) return emoji;
  }
  return '🔴';
}

const TIANGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const DIZHI   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const SHICHEN_NAMES = [
  { name: '子時', range: '23:00–01:00', label: '夜半' },
  { name: '丑時', range: '01:00–03:00', label: '雞鳴' },
  { name: '寅時', range: '03:00–05:00', label: '平旦' },
  { name: '卯時', range: '05:00–07:00', label: '日出' },
  { name: '辰時', range: '07:00–09:00', label: '食時' },
  { name: '巳時', range: '09:00–11:00', label: '隅中' },
  { name: '午時', range: '11:00–13:00', label: '日中' },
  { name: '未時', range: '13:00–15:00', label: '日昳' },
  { name: '申時', range: '15:00–17:00', label: '晡時' },
  { name: '酉時', range: '17:00–19:00', label: '日入' },
  { name: '戌時', range: '19:00–21:00', label: '黃昏' },
  { name: '亥時', range: '21:00–23:00', label: '人定' },
];
const STEM_ELEMENT = ['木','木','火','火','土','土','金','金','水','水'];
const SHICHEN_START_STEM = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];

function dayHash(year: number, month: number, day: number): number {
  const s = `${year}-${month}-${day}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function moonPhase(year: number, month: number, day: number): number {
  const synodic = 29.530588;
  const ref = Date.UTC(2000, 0, 6, 18, 14) / 86400000;
  const now = Date.UTC(year, month - 1, day) / 86400000;
  const phaseDays = ((now - ref) % synodic + synodic) % synodic;
  return phaseDays / synodic;
}

function buildShichen(dayGanzhi: string, seed: number): ShichenSlot[] {
  const stemIdx = TIANGAN.indexOf(dayGanzhi[0] ?? '');
  const startStem = stemIdx >= 0 ? SHICHEN_START_STEM[stemIdx % 10] : 0;
  return SHICHEN_NAMES.map((s, i) => {
    const r = (seed >> ((i % 10) * 2)) & 7;
    const luck: ShichenSlot['luck'] = r < 3 ? '吉' : r < 5 ? '凶' : '中';
    const ganzhi = TIANGAN[(startStem + i) % 10] + DIZHI[i];
    return { ...s, luck, ganzhi };
  });
}

export function getDayData(year: number, month: number, day: number, currentMonth?: number): DayData {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  const chong = lunar.getDayChong();
  const chongAnimal = lunar.getDayChongShengXiao();
  const sha = lunar.getDaySha();
  const wuxing = lunar.getDayNaYin();
  const jieqi = lunar.getJieQi();

  let nextJieqi: { name: string; date: string } | null = null;
  for (let i = 1; i <= 45; i++) {
    const future = solar.next(i);
    const futureLunar = future.getLunar();
    const futureJq = futureLunar.getJieQi();
    if (futureJq) {
      nextJieqi = {
        name: futureJq,
        date: `${future.getMonth()}月${future.getDay()}日`,
      };
      break;
    }
  }

  const festivals: string[] = [
    ...lunar.getFestivals(),
    ...lunar.getOtherFestivals(),
  ];
  const specialEvents = getSpecialEvents(lunar.getMonth(), lunar.getDay());
  for (const evt of specialEvents) {
    festivals.push(evt.name);
  }
  const festivalShort = specialEvents.length > 0
    ? specialEvents[0].shortName
    : festivals.length > 0
      ? festivals[0]
      : null;

  const chongDesc = `${lunar.getDayChongDesc()}，屬${chongAnimal}者今日不宜動土、出行`;
  const taishen = lunar.getDayPositionTai();
  const pengzuGan = lunar.getPengZuGan();
  const pengzuZhi = lunar.getPengZuZhi();

  const tongshu: TongshuData = {
    taishen,
    pengzuGan,
    pengzuZhi,
    jiShen: lunar.getDayJiShen(),
    xiongSha: lunar.getDayXiongSha(),
    tianShen: lunar.getDayTianShen(),
    tianShenType: lunar.getDayTianShenType(),
    tianShenLuck: lunar.getDayTianShenLuck(),
    zhiXing: lunar.getZhiXing(),
    xiu: lunar.getXiu(),
    xiuLuck: lunar.getXiuLuck(),
    xiuSong: lunar.getXiuSong(),
    positionXi: lunar.getDayPositionXiDesc(),
    positionCai: lunar.getDayPositionCaiDesc(),
    positionFu: lunar.getDayPositionFuDesc(),
    dayLu: lunar.getDayLu(),
    yueXiang: lunar.getYueXiang(),
    liuYao: lunar.getLiuYao(),
    wuHou: lunar.getWuHou(),
  };

  const lunarMonth = lunar.getMonth();
  const lunarDay = lunar.getDay();
  const deity = lunarMonth > 0 ? getDeityDay(lunarMonth, lunarDay) : null;
  const phase = moonPhase(year, month, day);
  const dayGanzhi = lunar.getDayInGanZhi();
  const seed = dayHash(year, month, day);
  const stemIdx = TIANGAN.indexOf(dayGanzhi[0] ?? '');
  const wuxingChar = stemIdx >= 0 ? STEM_ELEMENT[stemIdx] : (wuxing[0] ?? '');
  const xingxiu = (lunar.getXiu() ?? '').slice(0, 1);
  const yi = lunar.getDayYi();
  const ji = lunar.getDayJi();
  const xiuLuck = lunar.getXiuLuck();
  const score = Math.max(
    20,
    Math.min(
      99,
      50 + Math.min(yi.length * 3, 30) - Math.min(ji.length * 2, 20)
        + (xiuLuck === '吉' ? 10 : xiuLuck === '凶' ? -10 : 0),
    ),
  );
  const directions: Record<string, string> = {
    財神: lunar.getDayPositionCaiDesc(),
    喜神: lunar.getDayPositionXiDesc(),
    福神: lunar.getDayPositionFuDesc(),
    陽貴: lunar.getDayPositionYangGuiDesc(),
    陰貴: lunar.getDayPositionYinGuiDesc(),
  };
  const shichen = buildShichen(dayGanzhi, seed);
  const luckyHours = shichen.filter(s => s.luck === '吉').slice(0, 4);
  const pengzu = [pengzuGan, pengzuZhi].filter(Boolean) as string[];

  return {
    solar: {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      weekDay: solar.getWeek(),
    },
    lunar: {
      monthCn: lunar.getMonthInChinese(),
      dayCn: lunar.getDayInChinese(),
      yearCn: lunar.getYearInChinese(),
      monthNum: lunarMonth,
      dayNum: lunarDay,
    },
    ganzhi: {
      year: lunar.getYearInGanZhi(),
      month: lunar.getMonthInGanZhi(),
      day: dayGanzhi,
    },
    yi,
    ji,
    clash: {
      animal: `沖${chongAnimal} (${chong})`,
      emoji: getAnimalEmoji(chongAnimal),
      description: chongDesc,
      direction: `煞${sha}`,
      element: `五行：${wuxing}`,
      taishen,
      zodiac: chongAnimal,
      sha,
    },
    tongshu,
    jieqi: jieqi || null,
    nextJieqi,
    festivals,
    festivalShort,
    isCurrentMonth: currentMonth ? month === currentMonth : true,
    deity,
    phase,
    score,
    wuxing: wuxingChar,
    xingxiu,
    directions,
    shichen,
    luckyHours,
    pengzu,
  };
}

export function findUpcomingDeity(
  from: Date,
  withinDays: number = 60,
): { day: DayData; daysAway: number } | null {
  for (let i = 1; i <= withinDays; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const data = getDayData(d.getFullYear(), d.getMonth() + 1, d.getDate());
    if (data.deity) return { day: data, daysAway: i };
  }
  return null;
}

export function getMonthDays(year: number, month: number): DayData[][] {
  const weeks: DayData[][] = [];
  const firstDay = Solar.fromYmd(year, month, 1);
  const firstWeekDay = firstDay.getWeek(); // 0=Sun … 6=Sat
  const daysInMonth = new Date(year, month, 0).getDate();
  let currentWeek: DayData[] = [];

  // Leading cells: days from the previous month
  if (firstWeekDay > 0) {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
    const startDay = daysInPrevMonth - firstWeekDay + 1;
    for (let d = startDay; d <= daysInPrevMonth; d++) {
      currentWeek.push(getDayData(prevYear, prevMonth, d, month));
    }
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(getDayData(year, month, day, month));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Trailing cells: days from the next month
  if (currentWeek.length > 0) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    let nextDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push(getDayData(nextYear, nextMonth, nextDay, month));
      nextDay++;
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

export function getChineseMonthName(year: number, month: number): string {
  const numCn = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const yearStr = year.toString().split('').map(d => numCn[parseInt(d)]).join('');
  const monthNames = ['', '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return `${yearStr}年 ${monthNames[month]}`;
}

function numToChinese(num: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (num <= 10) return digits[num];
  if (num < 20) return `十${digits[num - 10]}`;
  if (num === 20) return '二十';
  if (num < 30) return `二十${digits[num - 20]}`;
  if (num === 30) return '三十';
  return `三十${digits[num - 30]}`;
}

export function getChineseDayName(year: number, month: number, day: number): string {
  const months = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const solar = Solar.fromYmd(year, month, day);
  return `${months[month]}月${numToChinese(day)}日 ${weekDays[solar.getWeek()]}`;
}
