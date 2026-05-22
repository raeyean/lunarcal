import {
  TIAN_HE,
  DI_LIU_HE,
  DI_SAN_HE_GROUPS,
  DI_CHONG,
  DI_XING_PAIRS,
  DI_HAI,
  DI_PO,
  WUXING_OF_GAN,
  WUXING_OF_ZHI,
  WUXING_GENERATES,
  WUXING_CONTROLS,
} from './tables';
import { COMPAT_REASONS_ZH_HANT } from './compatReasons.zh-Hant';
import type { CompatScore, GanRelation, ZhiRelation, CompatReason } from './types';

export function ganRelation(userGan: string, targetGan: string): GanRelation {
  if (TIAN_HE[userGan as keyof typeof TIAN_HE] === targetGan) return '相合';
  if (userGan === targetGan) return '比和';
  const userE = WUXING_OF_GAN[userGan as keyof typeof WUXING_OF_GAN];
  const targetE = WUXING_OF_GAN[targetGan as keyof typeof WUXING_OF_GAN];
  if (!userE || !targetE) return '無關';
  if (userE === targetE) return '比和';
  if (WUXING_GENERATES[targetE as keyof typeof WUXING_GENERATES] === userE) return '生我';
  if (WUXING_GENERATES[userE as keyof typeof WUXING_GENERATES] === targetE) return '我生';
  if (WUXING_CONTROLS[targetE as keyof typeof WUXING_CONTROLS] === userE) return '剋我';
  if (WUXING_CONTROLS[userE as keyof typeof WUXING_CONTROLS] === targetE) return '我剋';
  return '無關';
}

export function zhiRelation(userZhi: string, targetZhi: string): ZhiRelation {
  if (DI_CHONG[userZhi as keyof typeof DI_CHONG] === targetZhi) return '相沖';
  for (const group of DI_SAN_HE_GROUPS) {
    if (group.includes(userZhi as never) && group.includes(targetZhi as never) && userZhi !== targetZhi) {
      return '三合';
    }
  }
  if (DI_LIU_HE[userZhi as keyof typeof DI_LIU_HE] === targetZhi) return '六合';
  if (DI_XING_PAIRS.has(`${userZhi}${targetZhi}`)) return '相刑';
  if (DI_HAI[userZhi as keyof typeof DI_HAI] === targetZhi) return '相害';
  if (DI_PO[userZhi as keyof typeof DI_PO] === targetZhi) return '相破';
  return '無關';
}

function isValidGanZhi(gz: string): boolean {
  if (gz.length !== 2) return false;
  return (
    Boolean(WUXING_OF_GAN[gz[0] as keyof typeof WUXING_OF_GAN]) &&
    Boolean(WUXING_OF_ZHI[gz[1] as keyof typeof WUXING_OF_ZHI])
  );
}

export function computeCompat(userDayGanZhi: string, targetDayGanZhi: string): CompatScore {
  if (!isValidGanZhi(userDayGanZhi) || !isValidGanZhi(targetDayGanZhi)) {
    // In dev, log without exposing user data. In prod, silent.
    // __DEV__ is a React Native global; use globalThis to avoid TS errors in Node.
    if ((globalThis as Record<string, unknown>).__DEV__) {
      console.warn('[computeCompat] invalid ganzhi input shapes');
    }
    return {
      stars: 3,
      reasonKey: 'neutral',
      reasonText: COMPAT_REASONS_ZH_HANT.neutral,
      detail: { ganRelation: '無關', zhiRelation: '無關' },
    };
  }

  const userGan = userDayGanZhi[0];
  const userZhi = userDayGanZhi[1];
  const targetGan = targetDayGanZhi[0];
  const targetZhi = targetDayGanZhi[1];

  const gRel = ganRelation(userGan, targetGan);
  const zRel = zhiRelation(userZhi, targetZhi);

  let stars: CompatScore['stars'] = 3;
  let reasonKey: CompatReason = 'neutral';

  // Priority order: most specific (and most extreme) wins.
  if (gRel === '相合' && (zRel === '三合' || zRel === '六合')) {
    stars = 5; reasonKey = 'tianHe_diHe';
  } else if (zRel === '相沖') {
    stars = 1; reasonKey = 'xiangChong';
  } else if (gRel === '相合') {
    stars = 4; reasonKey = 'tianHe';
  } else if (zRel === '三合') {
    stars = 4; reasonKey = 'sanHe';
  } else if (zRel === '六合') {
    stars = 4; reasonKey = 'liuHe';
  } else if (gRel === '生我') {
    stars = 4; reasonKey = 'shengWo';
  } else if (zRel === '相刑') {
    stars = 2; reasonKey = 'xiang';
  } else if (zRel === '相破') {
    stars = 2; reasonKey = 'xiangPo';
  } else if (zRel === '相害') {
    stars = 2; reasonKey = 'xiangHai';
  } else if (gRel === '剋我') {
    stars = 2; reasonKey = 'keWo';
  } else if (gRel === '比和') {
    stars = 3; reasonKey = 'biHe';
  } else {
    stars = 3; reasonKey = 'neutral';
  }

  return {
    stars,
    reasonKey,
    reasonText: COMPAT_REASONS_ZH_HANT[reasonKey],
    detail: { ganRelation: gRel, zhiRelation: zRel },
  };
}
