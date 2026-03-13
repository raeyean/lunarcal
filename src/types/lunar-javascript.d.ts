declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getWeek(): number;
    getLunar(): Lunar;
    next(days: number): Solar;
  }

  export class Lunar {
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getYearInChinese(): string;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getDayChong(): string;
    getDayChongShengXiao(): string;
    getDayChongDesc(): string;
    getDaySha(): string;
    getDayNaYin(): string;
    getJieQi(): string;
    getFestivals(): string[];
    getOtherFestivals(): string[];
    getMonth(): number;
    getDay(): number;
  }

  export class SolarMonth {
    static fromYm(year: number, month: number): SolarMonth;
    getDaysCount(): number;
  }
}
