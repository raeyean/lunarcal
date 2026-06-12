import SwiftUI

extension Color {
    static let lunarAccent = Color(red: 240/255, green: 67/255, blue: 36/255) // #f04324
    static let yiChip = Color(red: 126/255, green: 212/255, blue: 146/255)
    static let jiChip = Color(red: 240/255, green: 153/255, blue: 123/255)
}

struct GlanceView: View {
    let offset: Int

    private var info: LunarDayInfo {
        let date = Calendar.current.date(byAdding: .day, value: offset, to: Date()) ?? Date()
        let c = Calendar.current.dateComponents([.year, .month, .day], from: date)
        return LunarCalculator.calculate(year: c.year!, month: c.month!, day: c.day!)
    }

    private var headerText: String {
        // weekdayCn is e.g. "星期五" — suffix(1) gives "五"
        let base = "\(info.solarMonth)月\(info.solarDay)日 \(info.weekdayCn.suffix(1))"
        switch offset {
        case 0: return base
        case 1: return "明天 · " + base
        case -1: return "昨天 · " + base
        default: return base
        }
    }

    var body: some View {
        let info = self.info
        ScrollView {
            VStack(alignment: .leading, spacing: 6) {
                Text(headerText)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(offset == 0 ? .lunarAccent : .secondary)

                // lunarMonthCn does NOT include 月 (e.g. "四"), so we append it explicitly.
                // Same pattern used in all widget views: "\(info.lunarMonthCn)月\(info.lunarDayCn)"
                Text("\(info.lunarMonthCn)月\(info.lunarDayCn)")
                    .font(.system(size: 28, weight: .medium))

                Text("\(info.yearGanzhi)年 \(info.monthGanzhi)月 \(info.dayGanzhi)日")
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)

                chipRow(label: "宜", items: info.yi, chip: .yiChip)
                chipRow(label: "忌", items: info.ji, chip: .jiChip)

                Divider().padding(.top, 4)

                // clashBranch is a single earthly branch character (e.g. "亥").
                // Format mirrors LargeWidgetView: "沖豬(亥) 煞西"
                Text("沖\(info.clashAnimal)(\(info.clashBranch)) 煞\(info.sha)")
                    .font(.system(size: 13))
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 4)
        }
    }

    private func chipRow(label: String, items: [String], chip: Color) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 5) {
            Text(label)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.black)
                .padding(.horizontal, 7)
                .padding(.vertical, 2)
                .background(chip)
                .clipShape(Capsule())
            Text(items.prefix(3).joined(separator: " "))
                .font(.system(size: 13))
                .lineLimit(1)
        }
    }
}
