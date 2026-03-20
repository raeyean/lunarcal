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
    getPengZuGan(): string;
    getPengZuZhi(): string;
    getDayPositionTai(): string;
    getDayJiShen(): string[];
    getDayXiongSha(): string[];
    getDayTianShen(): string;
    getDayTianShenType(): string;
    getDayTianShenLuck(): string;
    getZhiXing(): string;
    getXiu(): string;
    getXiuLuck(): string;
    getXiuSong(): string;
    getDayPositionXiDesc(): string;
    getDayPositionCaiDesc(): string;
    getDayPositionFuDesc(): string;
    getDayLu(): string;
    getYueXiang(): string;
    getLiuYao(): string;
    getWuHou(): string;
    static fromYmd(year: number, month: number, day: number): Lunar;
    getYear(): number;
    getSolar(): Solar;
  }

  export class SolarMonth {
    static fromYm(year: number, month: number): SolarMonth;
    getDaysCount(): number;
  }
}
