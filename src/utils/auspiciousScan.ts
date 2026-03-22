import { Solar } from 'lunar-javascript';

export interface AuspiciousResult {
  date: { year: number; month: number; day: number };
  lunarDate: string;
  ganzhiDay: string;
  weekDay: number;
  yi: string[];
  ji: string[];
  tianShen: string;
  tianShenType: string;
}

export interface ScanResult {
  results: AuspiciousResult[];
  hasMore: boolean;
  nextStartDate: Date;
}

export function scanChunk(
  activity: string,
  zodiac: string | null,
  startDate: Date,
  chunkSize: number,
  maxDate: Date,
): ScanResult {
  const results: AuspiciousResult[] = [];
  const current = new Date(startDate);
  let daysScanned = 0;

  while (daysScanned < chunkSize && current <= maxDate) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const day = current.getDate();

    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    const yi: string[] = lunar.getDayYi();

    if (yi.includes(activity)) {
      const clashAnimal: string = lunar.getDayChongShengXiao();

      if (!zodiac || clashAnimal !== zodiac) {
        results.push({
          date: { year, month, day },
          lunarDate: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
          ganzhiDay: lunar.getDayInGanZhi(),
          weekDay: solar.getWeek(),
          yi,
          ji: lunar.getDayJi(),
          tianShen: lunar.getDayTianShen(),
          tianShenType: lunar.getDayTianShenType(),
        });
      }
    }

    current.setDate(current.getDate() + 1);
    daysScanned++;
  }

  return {
    results,
    hasMore: current <= maxDate,
    nextStartDate: new Date(current),
  };
}
