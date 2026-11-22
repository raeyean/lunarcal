#!/usr/bin/env node
/**
 * Prints, as JSON, what the phone app shows for every day in a range: Month
 * Pillar, 宜, 忌, year pillar and Lunar Date. verify.sh feeds it to verify.swift.
 *
 * 宜/忌 go through the shared Activity table exactly as dayYi()/dayJi() in
 * @lunarcal/shared do (lunar-javascript names, converted to traditional).
 * The lunar month label goes through the shared month table the same way
 * toTraditionalLunarMonth() does (闰 → 閏, 腊 → 臘; #48).
 *
 *   node scripts/verify-swift-almanac/expected.js [from=2020-01-01] [to=2060-12-31]
 */
const { Solar } = require('lunar-javascript');
const ACTIVITY_TRADITIONAL = require('../../packages/shared/src/data/activityNamesTraditional.json');
const toTraditionalActivity = (name) => ACTIVITY_TRADITIONAL[name] ?? name;
const LUNAR_MONTH_TRADITIONAL = require('../../packages/shared/src/data/lunarMonthTraditional.json');
const toTraditionalLunarMonth = (label) => Array.from(label, (ch) => LUNAR_MONTH_TRADITIONAL[ch] ?? ch).join('');

const [from = '2020-01-01', to = '2060-12-31'] = process.argv.slice(2);
const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const pad = (n) => String(n).padStart(2, '0');

const days = [];
for (let d = parse(from); d <= parse(to); d.setUTCDate(d.getUTCDate() + 1)) {
  const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
  const lunar = Solar.fromYmd(y, m, day).getLunar();
  days.push({
    date: `${y}-${pad(m)}-${pad(day)}`,
    month: lunar.getMonthInGanZhi(),
    year: lunar.getYearInGanZhi(),
    lunarMonth: toTraditionalLunarMonth(lunar.getMonthInChinese()),
    lunarDay: lunar.getDayInChinese(),
    yi: lunar.getDayYi().map(toTraditionalActivity),
    ji: lunar.getDayJi().map(toTraditionalActivity),
  });
}
process.stdout.write(JSON.stringify(days));
