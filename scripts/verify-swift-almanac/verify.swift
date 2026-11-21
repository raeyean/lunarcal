// Compares the Swift engine (targets/shared) against lunar-javascript for
// every day in expected.json. Built and run by verify.sh.
import Foundation

struct Expected: Decodable {
    let date: String
    let month: String
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
    if !diffs.isEmpty {
        mismatches += 1
        if mismatches <= 20 { print("\(e.date): " + diffs.joined(separator: "; ")) }
    }
}

// Outside the solar-term table, 宜/忌 must be empty, never a guess.
var outOfRange = 0
for (y, m, d) in [(2019, 6, 1), (2061, 6, 1), (1990, 1, 1)] {
    let info = LunarCalculator.calculate(year: y, month: m, day: d)
    if info.hasYiJi {
        outOfRange += 1
        print("\(y)-\(m)-\(d): expected no 宜/忌 outside the table, got \(info.yi) / \(info.ji)")
    }
}

print("checked \(days.count) days (\(days.first?.date ?? "-") to \(days.last?.date ?? "-")): \(mismatches) mismatches; out-of-range checks failed: \(outOfRange)")
exit(mismatches == 0 && outOfRange == 0 ? 0 : 1)
