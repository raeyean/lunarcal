import { Solar } from 'lunar-javascript';

export interface DayData {
  solar: { year: number; month: number; day: number; weekDay: number };
  lunar: { monthCn: string; dayCn: string; yearCn: string };
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
  };
  jieqi: string | null;
  nextJieqi: { name: string; date: string } | null;
  isCurrentMonth: boolean;
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

  const chongDesc = `${lunar.getDayChongDesc()}，屬${chongAnimal}者今日不宜動土、出行`;

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
    },
    ganzhi: {
      year: lunar.getYearInGanZhi(),
      month: lunar.getMonthInGanZhi(),
      day: lunar.getDayInGanZhi(),
    },
    yi: lunar.getDayYi(),
    ji: lunar.getDayJi(),
    clash: {
      animal: `沖${chongAnimal} (${chong})`,
      emoji: getAnimalEmoji(chongAnimal),
      description: chongDesc,
      direction: `煞${sha}`,
      element: `五行：${wuxing}`,
    },
    jieqi: jieqi || null,
    nextJieqi,
    isCurrentMonth: currentMonth ? month === currentMonth : true,
  };
}

export function getMonthDays(year: number, month: number): DayData[][] {
  const weeks: DayData[][] = [];

  const firstDay = Solar.fromYmd(year, month, 1);
  const firstWeekDay = firstDay.getWeek();
  const daysInMonth = new Date(year, month, 0).getDate();

  let currentWeek: DayData[] = [];

  // Pad first week with empty placeholder slots
  for (let i = 0; i < firstWeekDay; i++) {
    currentWeek.push(getDayData(year, month, 1, month));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(getDayData(year, month, day, month));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Pad last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(getDayData(year, month, 1, month));
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

export function getEnglishMonthName(year: number, month: number): string {
  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[month]} ${year}`;
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

export function getEnglishDayName(year: number, month: number, day: number): string {
  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[month]} ${day}, ${year}`;
}
