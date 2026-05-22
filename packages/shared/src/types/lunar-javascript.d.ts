declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
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
    getDayPositionYangGuiDesc(): string;
    getDayPositionYinGuiDesc(): string;
    getTimeGanZhi?(hour: number): string;
    getDayLu(): string;
    getYueXiang(): string;
    getLiuYao(): string;
    getWuHou(): string;
    static fromYmd(year: number, month: number, day: number): Lunar;
    getYear(): number;
    getSolar(): Solar;
    getEightChar(): EightChar;
  }

  export class SolarMonth {
    static fromYm(year: number, month: number): SolarMonth;
    getDaysCount(): number;
  }

  export class EightChar {
    // Per-slot getters used by buildPillar via dynamic dispatch:
    // get{Year|Month|Day|Time}(): string — full ganzhi
    // get{Slot}Gan(): string
    // get{Slot}Zhi(): string
    // get{Slot}HideGan(): string[]
    // get{Slot}NaYin(): string
    // get{Slot}ShiShenGan(): string
    // get{Slot}ShiShenZhi(): string[]
    // get{Slot}DiShi(): string
    getYear(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getYearHideGan(): string[];
    getYearNaYin(): string;
    getYearShiShenGan(): string;
    getYearShiShenZhi(): string[];
    getYearDiShi(): string;
    getMonth(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getMonthHideGan(): string[];
    getMonthNaYin(): string;
    getMonthShiShenGan(): string;
    getMonthShiShenZhi(): string[];
    getMonthDiShi(): string;
    getDay(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getDayHideGan(): string[];
    getDayNaYin(): string;
    getDayShiShenGan(): string;
    getDayShiShenZhi(): string[];
    getDayDiShi(): string;
    getTime(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getTimeHideGan(): string[];
    getTimeNaYin(): string;
    getTimeShiShenGan(): string;
    getTimeShiShenZhi(): string[];
    getTimeDiShi(): string;
    getTaiYuan(): string;
    getMingGong(): string;
    getYun(gender: 0 | 1): Yun;
  }

  export class Yun {
    getDaYun(): DaYun[];
  }

  export class DaYun {
    getStartAge(): number;
    getStartYear(): number;
    getEndYear(): number;
    getEndAge(): number;
    getGanZhi(): string;
  }
}
