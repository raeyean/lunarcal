import TABLE from './activityNamesTraditional.json';

/**
 * Activity names (宜忌事項) as the app shows them (issue #42).
 *
 * lunar-javascript returns 宜/忌 Activities in simplified characters
 * (开市, 修饰垣墙), while the app is in traditional Chinese. This table maps
 * each of lunar-javascript's `LunarUtil.YI_JI` names, whole, to its
 * traditional form. It works per Activity, not per character, so word-level
 * choices hold (e.g. 启钻 → 啟攢). A test keeps it in step with lunar-javascript.
 *
 * The JSON is shared with tooling outside this package (the watch data
 * generator, #45).
 */
export const ACTIVITY_NAMES_TRADITIONAL: Readonly<Record<string, string>> = TABLE;

/** The traditional name of a lunar-javascript Activity; unknown names pass through. */
export function toTraditionalActivity(name: string): string {
  return ACTIVITY_NAMES_TRADITIONAL[name] ?? name;
}

interface YiJiSource {
  getDayYi(): string[];
  getDayJi(): string[];
}

/** The day's 宜 Activities, in traditional characters. */
export function dayYi(lunar: YiJiSource): string[] {
  return lunar.getDayYi().map(toTraditionalActivity);
}

/** The day's 忌 Activities, in traditional characters. */
export function dayJi(lunar: YiJiSource): string[] {
  return lunar.getDayJi().map(toTraditionalActivity);
}
