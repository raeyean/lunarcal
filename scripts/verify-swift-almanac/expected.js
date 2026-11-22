#!/usr/bin/env node
/**
 * Prints, as JSON, what the phone app shows for every day in a range: Month
 * Pillar, 宜 and 忌. verify.sh feeds it to verify.swift.
 *
 * 宜/忌 go through the shared Activity table exactly as dayYi()/dayJi() in
 * @lunarcal/shared do (lunar-javascript names, converted to traditional).
 *
 *   node scripts/verify-swift-almanac/expected.js [from=2020-01-01] [to=2060-12-31]
 */
const { Solar } = require('lunar-javascript');
const ACTIVITY_TRADITIONAL = require('../../packages/shared/src/data/activityNamesTraditional.json');
const toTraditionalActivity = (name) => ACTIVITY_TRADITIONAL[name] ?? name;

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
    yi: lunar.getDayYi().map(toTraditionalActivity),
    ji: lunar.getDayJi().map(toTraditionalActivity),
  });
}
process.stdout.write(JSON.stringify(days));
