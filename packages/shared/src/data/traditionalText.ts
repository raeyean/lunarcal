import TABLE from './traditionalChars.json';

/**
 * Free text from lunar-javascript in traditional characters (#51).
 *
 * The Tongshu fields, 煞 and 方位 directions, the 彭祖 lines and the Bazi chart
 * terms come from lunar-javascript in simplified characters. They are converted
 * here, character by character, with a table checked by hand:
 *
 * - `chars` maps only the simplified characters lunar-javascript actually
 *   returns in those fields. Where Taiwan and Hong Kong forms differ, it uses
 *   the Taiwan form (床, 群, 溫, 戶), as the rest of the app does. Characters
 *   that are already right are left out on purpose: 斗 (宿), 征 (鳥), 占 (門),
 *   凶, 合, 丑, 咸, 于, 周.
 * - `phrases` covers the few words whose characters need another form than
 *   the table's (天后 keeps 后, while 之后 becomes 之後). They are matched first.
 * - `unchanged` lists every other character lunar-javascript returns in those
 *   fields. A test fails if a new lunar-javascript version returns a character
 *   that is in neither list, so it gets checked before it reaches the app.
 *
 * Why not a converter library: opencc-js adds about 1.1 MB at runtime and picks
 * the wrong character for this vocabulary (斗星 → 鬥星, 征鳥 → 徵鳥, 占門 → 佔門,
 * 凶 → 兇). Why not lunar-javascript's I18n: it only covers part of this text,
 * and switching its language also changes the Activity names that the #42
 * table is keyed on.
 *
 * Names that need word-level choices keep their own whole-name tables:
 * Activities (#42), the Lunar Month (#48), and Clash Animals, solar terms and
 * festivals (#52).
 */
export const TRADITIONAL_CHARS: Readonly<Record<string, string>> = TABLE.chars;
export const TRADITIONAL_PHRASES: Readonly<Record<string, string>> = TABLE.phrases;
/** Characters lunar-javascript returns that need no conversion. */
export const TRADITIONAL_UNCHANGED: string = TABLE.unchanged;

const PHRASES = Object.entries(TRADITIONAL_PHRASES);

/** lunar-javascript free text in traditional characters; unknown characters pass through. */
export function toTraditionalText(text: string): string {
  let out = '';
  for (let i = 0; i < text.length; ) {
    const phrase = PHRASES.find(([from]) => text.startsWith(from, i));
    if (phrase) {
      out += phrase[1];
      i += phrase[0].length;
    } else {
      out += TRADITIONAL_CHARS[text[i]] ?? text[i];
      i += 1;
    }
  }
  return out;
}

/** `toTraditionalText` for each item of a list. */
export function toTraditionalTexts(texts: readonly string[]): string[] {
  return texts.map(toTraditionalText);
}
