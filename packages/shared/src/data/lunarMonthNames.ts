import TABLE from './lunarMonthTraditional.json';

/**
 * Lunar month labels as the app shows them (issue #48).
 *
 * lunar-javascript's `getMonthInChinese()` uses simplified characters for a
 * Leap Month (闰二) and the 12th month (腊), while the app is in traditional
 * Chinese. Every other character in a month or day label is the same in both
 * scripts, so this maps single characters.
 *
 * The JSON is shared with tooling outside this package (the watch data
 * generator, #43).
 */
export const LUNAR_MONTH_TRADITIONAL: Readonly<Record<string, string>> = TABLE;

/** A lunar-javascript month label in traditional characters: 闰二 → 閏二, 腊 → 臘. */
export function toTraditionalLunarMonth(label: string): string {
  return Array.from(label, (ch) => LUNAR_MONTH_TRADITIONAL[ch] ?? ch).join('');
}
