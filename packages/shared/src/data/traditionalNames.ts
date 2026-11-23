import ZODIAC from './zodiacNamesTraditional.json';
import SOLAR_TERMS from './solarTermNamesTraditional.json';
import FESTIVALS from './festivalNamesTraditional.json';

/**
 * Clash Animal, solar-term and festival names as the app shows them (#52).
 *
 * lunar-javascript returns these in simplified characters (马, 惊蛰, 腊八节),
 * while the app and its own data are traditional: the zodiac the user picks,
 * the event descriptions, the watch's Swift engine. Comparing or looking up
 * the raw names fails silently, so they are converted where they enter the
 * app. Like the Activity table (#42), each table maps whole names, so
 * word-level choices hold (龙头节 → 龍抬頭, 谷日 → 穀日). Tests keep the tables
 * in step with lunar-javascript.
 *
 * The solar-term JSON is shared with the watch data generator.
 */
export const ZODIAC_NAMES_TRADITIONAL: Readonly<Record<string, string>> = ZODIAC;
export const SOLAR_TERM_NAMES_TRADITIONAL: Readonly<Record<string, string>> = SOLAR_TERMS;
export const FESTIVAL_NAMES_TRADITIONAL: Readonly<Record<string, string>> = FESTIVALS;

/** A lunar-javascript Clash Animal (e.g. 马) in traditional characters; unknown names pass through. */
export function toTraditionalZodiac(name: string): string {
  return ZODIAC_NAMES_TRADITIONAL[name] ?? name;
}

/** A lunar-javascript solar-term or festival name in traditional characters; unknown names pass through. */
export function toTraditionalEventName(name: string): string {
  return SOLAR_TERM_NAMES_TRADITIONAL[name] ?? FESTIVAL_NAMES_TRADITIONAL[name] ?? name;
}
