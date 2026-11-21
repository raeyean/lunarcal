#!/usr/bin/env node
/**
 * Prints, as JSON, what the phone app (lunar-javascript) gives for every day
 * in a range: Month Pillar, 宜 and 忌. verify.sh feeds it to verify.swift.
 *
 *   node scripts/verify-swift-almanac/expected.js [from=2020-01-01] [to=2060-12-31]
 */
const { Solar } = require('lunar-javascript');

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
    yi: lunar.getDayYi(),
    ji: lunar.getDayJi(),
  });
}
process.stdout.write(JSON.stringify(days));
