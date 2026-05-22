import type { CompatReason } from './types';

export const COMPAT_REASONS_ZH_HANT: Record<CompatReason, string> = {
  tianHe_diHe: '日柱天合地合 · 大利',
  tianHe:      '天干相合 · 順遂',
  sanHe:       '地支三合 · 助力',
  liuHe:       '地支六合 · 親和',
  shengWo:     '貴人扶持 · 利合作',
  biHe:        '比和 · 平穩',
  neutral:     '無特殊關係',
  keWo:        '受剋 · 行事保守',
  xiang:       '相刑 · 慎防口角',
  xiangPo:     '相破 · 不宜開新事',
  xiangHai:    '相害 · 小心暗虧',
  xiangChong:  '日柱相沖 · 避免大事',
};
