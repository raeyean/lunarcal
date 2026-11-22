// Compares the Swift engine (targets/shared) against lunar-javascript for
// every day in expected.json. Built and run by verify.sh.
import Foundation

struct Expected: Decodable {
    let date: String
    let month: String
    let year: String
    let lunarMonth: String
    let lunarDay: String
    let yi: [String]
    let ji: [String]
}

let path = CommandLine.arguments[1]
let days = try JSONDecoder().decode([Expected].self, from: Data(contentsOf: URL(fileURLWithPath: path)))

var mismatches = 0
for e in days {
    let p = e.date.split(separator: "-").map { Int($0)! }
    let info = LunarCalculator.calculate(year: p[0], month: p[1], day: p[2])
    var diffs: [String] = []
    if info.monthGanzhi != e.month { diffs.append("month \(info.monthGanzhi) != \(e.month)") }
    if info.yi != e.yi { diffs.append("宜 \(info.yi) != \(e.yi)") }
    if info.ji != e.ji { diffs.append("忌 \(info.ji) != \(e.ji)") }
    if info.yearGanzhi != e.year { diffs.append("year \(info.yearGanzhi) != \(e.year)") }
    if info.lunarMonthCn != e.lunarMonth || info.lunarDayCn != e.lunarDay {
        diffs.append("lunar \(info.lunarDateCn) != \(e.lunarMonth)月\(e.lunarDay)")
    }
    if !diffs.isEmpty {
        mismatches += 1
        if mismatches <= 20 { print("\(e.date): " + diffs.joined(separator: "; ")) }
    }
}

// Outside the generated tables, 宜/忌 and the Lunar Date must be empty, never
// a guess. 2019 has a Lunar Date but no Month Pillar (that needs 2018's 大雪).
var outOfRange = 0
for (y, m, d, hasLunarDate) in [(2019, 6, 1, true), (2061, 6, 1, false), (1990, 1, 1, false)] {
    let info = LunarCalculator.calculate(year: y, month: m, day: d)
    if info.hasYiJi {
        outOfRange += 1
        print("\(y)-\(m)-\(d): expected no 宜/忌 outside the table, got \(info.yi) / \(info.ji)")
    }
    if info.lunarDateCn.isEmpty == hasLunarDate {
        outOfRange += 1
        print("\(y)-\(m)-\(d): expected \(hasLunarDate ? "a" : "no") Lunar Date, got '\(info.lunarDateCn)'")
    }
}

// Spot checks from issue #43.
for (y, m, d, want) in [(2023, 4, 1, "閏二月十一"), (2057, 9, 28, "八月三十")] {
    let got = LunarCalculator.calculate(year: y, month: m, day: d).lunarDateCn
    if got != want {
        outOfRange += 1
        print("\(y)-\(m)-\(d): expected \(want), got \(got)")
    }
}

print("checked \(days.count) days (\(days.first?.date ?? "-") to \(days.last?.date ?? "-")): \(mismatches) mismatches; out-of-range checks failed: \(outOfRange)")
exit(mismatches == 0 && outOfRange == 0 ? 0 : 1)
