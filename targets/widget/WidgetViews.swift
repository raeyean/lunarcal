import SwiftUI
import WidgetKit

// MARK: - Design Tokens

struct WidgetColors {
    static let primary = Color(red: 240/255, green: 67/255, blue: 36/255)
    static let background = Color.white
    static let divider = Color(red: 244/255, green: 244/255, blue: 245/255) // #F4F4F5
    static let textPrimary = Color.black
    static let textSecondary = Color(red: 113/255, green: 113/255, blue: 122/255) // #71717A
    static let textMuted = Color(red: 161/255, green: 161/255, blue: 170/255) // #A1A1AA
    static let jiDark = Color(red: 39/255, green: 39/255, blue: 42/255) // #27272A
}

// MARK: - Small Widget (170×170)

struct SmallWidgetView: View {
    let info: LunarDayInfo

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Top: Day + date info
            VStack(alignment: .leading, spacing: 1) {
                Text("\(info.solarDay)")
                    .font(.system(size: 36, weight: .black))
                    .foregroundColor(WidgetColors.textPrimary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)

                Text("\(monthName) · \(info.dayGanzhi)日")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(WidgetColors.textSecondary)
            }

            Spacer(minLength: 4)

            // Divider
            Rectangle()
                .fill(WidgetColors.divider)
                .frame(height: 1)

            Spacer(minLength: 4)

            // Yi/Ji columns
            HStack(alignment: .top, spacing: 12) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("宜")
                        .font(.system(size: 12, weight: .heavy))
                        .foregroundColor(WidgetColors.primary)
                    ForEach(info.yi.prefix(3), id: \.self) { item in
                        Text(item)
                            .font(.system(size: 9))
                            .foregroundColor(WidgetColors.textSecondary)
                    }
                }
                VStack(alignment: .leading, spacing: 3) {
                    Text("忌")
                        .font(.system(size: 12, weight: .heavy))
                        .foregroundColor(WidgetColors.textMuted)
                    ForEach(info.ji.prefix(3), id: \.self) { item in
                        Text(item)
                            .font(.system(size: 9))
                            .foregroundColor(WidgetColors.textMuted)
                    }
                }
            }

            Spacer(minLength: 4)

            // Footer: clash + lunar date
            HStack(spacing: 4) {
                Text(info.clashEmoji)
                    .font(.system(size: 9))
                Text("沖\(info.clashAnimal) · 農曆\(info.lunarMonthCn)月\(info.lunarDayCn)")
                    .font(.system(size: 8))
                    .foregroundColor(WidgetColors.textMuted)
                    .lineLimit(1)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(WidgetColors.background)
    }

    private var monthName: String {
        let months = ["","一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
        let idx = min(max(info.solarMonth, 1), 12)
        return months[idx]
    }
}

// MARK: - Medium Widget (364×170)

struct MediumWidgetView: View {
    let info: LunarDayInfo

    var body: some View {
        VStack(spacing: 0) {
            // Top row
            HStack(alignment: .bottom) {
                // Left: Day number + date
                HStack(alignment: .bottom, spacing: 10) {
                    Text("\(info.solarDay)")
                        .font(.system(size: 48, weight: .black))
                        .foregroundColor(WidgetColors.textPrimary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)

                    VStack(alignment: .leading, spacing: 1) {
                        Text("\(monthName) · \(info.weekdayCn)")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(WidgetColors.textSecondary)
                        Text("農曆 \(info.lunarMonthCn)月\(info.lunarDayCn)")
                            .font(.system(size: 9))
                            .foregroundColor(WidgetColors.textMuted)
                    }
                }

                Spacer()

                // Right: Ganzhi + clash + jieqi
                VStack(alignment: .trailing, spacing: 1) {
                    Text("\(info.dayGanzhi) · \(info.monthGanzhi) · \(info.yearGanzhi)")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(WidgetColors.primary)

                    HStack(spacing: 4) {
                        Text(info.clashEmoji).font(.system(size: 9))
                        Text("沖\(info.clashAnimal)")
                            .font(.system(size: 9))
                            .foregroundColor(WidgetColors.textMuted)
                    }

                    if let jq = info.nextJieqi {
                        Text(info.nextJieqiDate != nil ? "\(jq)將至" : jq)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(WidgetColors.primary)
                    }
                }
            }

            Spacer(minLength: 6)

            // Divider
            Rectangle()
                .fill(WidgetColors.divider)
                .frame(height: 1)

            Spacer(minLength: 6)

            // Bottom: Yi/Ji
            HStack(alignment: .top, spacing: 20) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("宜")
                        .font(.system(size: 14, weight: .heavy))
                        .foregroundColor(WidgetColors.primary)
                    Text(info.yi.prefix(6).joined(separator: " · "))
                        .font(.system(size: 10))
                        .foregroundColor(WidgetColors.textSecondary)
                        .lineLimit(2)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                VStack(alignment: .leading, spacing: 4) {
                    Text("忌")
                        .font(.system(size: 14, weight: .heavy))
                        .foregroundColor(WidgetColors.textMuted)
                    Text(info.ji.prefix(6).joined(separator: " · "))
                        .font(.system(size: 10))
                        .foregroundColor(WidgetColors.textMuted)
                        .lineLimit(2)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(WidgetColors.background)
    }

    private var monthName: String {
        let months = ["","一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
        let idx = min(max(info.solarMonth, 1), 12)
        return months[idx]
    }
}

// MARK: - Large Widget (364×382)

struct LargeWidgetView: View {
    let info: LunarDayInfo

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(info.solarDay)")
                        .font(.system(size: 56, weight: .black))
                        .foregroundColor(WidgetColors.textPrimary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)

                    Text("\(monthName) · \(info.weekdayCn)")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(WidgetColors.textSecondary)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(info.dayGanzhi)日 · \(info.monthGanzhi)月 · \(info.yearGanzhi)年")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(WidgetColors.primary)
                    Text("農曆\(info.lunarMonthCn)月\(info.lunarDayCn)")
                        .font(.system(size: 10))
                        .foregroundColor(WidgetColors.textMuted)
                }
            }

            Spacer(minLength: 8)
            Rectangle().fill(WidgetColors.divider).frame(height: 1)
            Spacer(minLength: 8)

            // Ganzhi pillars row
            HStack(spacing: 20) {
                GanzhiPillar(label: "年", value: info.yearGanzhi)
                GanzhiPillar(label: "月", value: info.monthGanzhi)
                GanzhiPillar(label: "日", value: info.dayGanzhi)

                Spacer()

                if let jq = info.nextJieqi {
                    HStack(spacing: 6) {
                        Circle()
                            .fill(WidgetColors.primary)
                            .frame(width: 6, height: 6)
                        Text(info.nextJieqiDate != nil ? "\(jq)將至" : jq)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(WidgetColors.primary)
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(WidgetColors.divider)
                    .cornerRadius(12)
                }
            }

            Spacer(minLength: 8)
            Rectangle().fill(WidgetColors.divider).frame(height: 1)
            Spacer(minLength: 8)

            // Yi/Ji section
            HStack(alignment: .top, spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("宜")
                        .font(.system(size: 16, weight: .heavy))
                        .foregroundColor(WidgetColors.primary)
                    ForEach(yiPairs, id: \.self) { pair in
                        Text(pair)
                            .font(.system(size: 11))
                            .foregroundColor(WidgetColors.textSecondary)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                VStack(alignment: .leading, spacing: 6) {
                    Text("忌")
                        .font(.system(size: 16, weight: .heavy))
                        .foregroundColor(WidgetColors.textMuted)
                    ForEach(jiPairs, id: \.self) { pair in
                        Text(pair)
                            .font(.system(size: 11))
                            .foregroundColor(WidgetColors.textMuted)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            Spacer(minLength: 8)
            Rectangle().fill(WidgetColors.divider).frame(height: 1)
            Spacer(minLength: 8)

            // Clash footer
            HStack(spacing: 10) {
                Text(info.clashEmoji)
                    .font(.system(size: 18))

                VStack(alignment: .leading, spacing: 2) {
                    Text("沖\(info.clashAnimal) (\(info.clashBranch))")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(WidgetColors.textPrimary)
                    Text("屬\(info.clashAnimal)者今日不宜動土、出行 · 煞\(info.sha) · \(info.nayin)")
                        .font(.system(size: 10))
                        .foregroundColor(WidgetColors.textMuted)
                        .lineLimit(2)
                }
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(WidgetColors.background)
    }

    private var monthName: String {
        let months = ["","一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
        let idx = min(max(info.solarMonth, 1), 12)
        return months[idx]
    }

    private var yiPairs: [String] {
        stride(from: 0, to: min(info.yi.count, 6), by: 2).map { i in
            let end = min(i + 2, info.yi.count)
            return info.yi[i..<end].joined(separator: " · ")
        }
    }

    private var jiPairs: [String] {
        stride(from: 0, to: min(info.ji.count, 6), by: 2).map { i in
            let end = min(i + 2, info.ji.count)
            return info.ji[i..<end].joined(separator: " · ")
        }
    }
}

// MARK: - Ganzhi Pillar Helper

struct GanzhiPillar: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(label)
                .font(.system(size: 9))
                .foregroundColor(WidgetColors.textMuted)
            Text(value)
                .font(.system(size: 28, weight: .black))
                .foregroundColor(WidgetColors.textPrimary)
        }
    }
}
