import { Solar } from 'lunar-javascript';
import { BaziError } from './errors';
import { WUXING_OF_GAN, WUXING_OF_ZHI } from './tables';
import type {
  BirthProfile,
  BaziChart,
  BaziPillar,
} from './types';

type Slot = 'Year' | 'Month' | 'Day' | 'Time';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPillar(slot: Slot, ec: any): BaziPillar {
  // lunar-javascript exposes per-slot getters: getYearGan, getYearZhi, etc.
  const gan: string = ec[`get${slot}Gan`]();
  const zhi: string = ec[`get${slot}Zhi`]();
  const ganZhi: string = ec[`get${slot}`]();
  const hideGan: string[] = ec[`get${slot}HideGan`]() ?? [];
  const naYin: string = ec[`get${slot}NaYin`]();
  const shiShenGan: string = ec[`get${slot}ShiShenGan`]();
  const shiShenZhi: string[] = ec[`get${slot}ShiShenZhi`]() ?? [];
  const diShi: string = ec[`get${slot}DiShi`]();
  const wuXing = `${WUXING_OF_GAN[gan as keyof typeof WUXING_OF_GAN] ?? ''}${WUXING_OF_ZHI[zhi as keyof typeof WUXING_OF_ZHI] ?? ''}`;

  return { gan, zhi, ganZhi, wuXing, hideGan, naYin, shiShenGan, shiShenZhi, diShi };
}

function countWuXing(pillars: BaziPillar[]): Record<'木' | '火' | '土' | '金' | '水', number> {
  const counts: Record<'木' | '火' | '土' | '金' | '水', number> = {
    木: 0, 火: 0, 土: 0, 金: 0, 水: 0,
  };
  for (const p of pillars) {
    const ganE = WUXING_OF_GAN[p.gan as keyof typeof WUXING_OF_GAN];
    const zhiE = WUXING_OF_ZHI[p.zhi as keyof typeof WUXING_OF_ZHI];
    if (ganE) counts[ganE]++;
    if (zhiE) counts[zhiE]++;
  }
  return counts;
}

export function computeBazi(profile: BirthProfile): BaziChart {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(profile.solarDate);
  if (!dateMatch) {
    throw new BaziError('INVALID_DATE', `solarDate is malformed: ${profile.solarDate}`);
  }
  const y = Number(dateMatch[1]);
  const m = Number(dateMatch[2]);
  const d = Number(dateMatch[3]);
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) {
    throw new BaziError('INVALID_DATE', `solarDate out of range: ${profile.solarDate}`);
  }

  const hasTime = profile.solarTime !== null;
  let hh = 12;
  let mm = 0;
  if (hasTime) {
    const timeMatch = /^(\d{2}):(\d{2})$/.exec(profile.solarTime as string);
    if (!timeMatch) {
      throw new BaziError('INVALID_TIME', `solarTime is malformed: ${profile.solarTime}`);
    }
    hh = Number(timeMatch[1]);
    mm = Number(timeMatch[2]);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
      throw new BaziError('INVALID_TIME', `solarTime out of range: ${profile.solarTime}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ec: any;
  try {
    ec = Solar.fromYmdHms(y, m, d, hh, mm, 0).getLunar().getEightChar();
  } catch (e) {
    throw new BaziError('ENGINE_FAILURE', `lunar-javascript threw: ${(e as Error).message}`);
  }

  const year = buildPillar('Year', ec);
  const month = buildPillar('Month', ec);
  const day = buildPillar('Day', ec);
  const time = hasTime ? buildPillar('Time', ec) : null;

  const pillars = time ? [year, month, day, time] : [year, month, day];
  const wuXingCounts = countWuXing(pillars);

  // taiYuan/mingGong: return null if engine method missing or returns empty string.
  const taiYuanRaw: string | undefined =
    typeof ec.getTaiYuan === 'function' ? ec.getTaiYuan() : undefined;
  const mingGongRaw: string | undefined =
    typeof ec.getMingGong === 'function' ? ec.getMingGong() : undefined;

  return {
    source: profile,
    hasTime,
    year,
    month,
    day,
    time,
    dayMaster: day.gan,
    dayMasterWuXing: WUXING_OF_GAN[day.gan as keyof typeof WUXING_OF_GAN] ?? '',
    wuXingCounts,
    daYun: null,                  // populated in Task 7
    taiYuan: taiYuanRaw ? taiYuanRaw : null,
    mingGong: mingGongRaw ? mingGongRaw : null,
  };
}
