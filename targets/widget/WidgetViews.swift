import SwiftUI
import WidgetKit

// MARK: - Design Tokens

struct WidgetColors {
    let primary: Color
    let background: Color
    let divider: Color
    let textPrimary: Color
    let textSecondary: Color
    let textMuted: Color
    let jiDark: Color

    static func forScheme(_ scheme: ColorScheme) -> WidgetColors {
        if scheme == .dark {
            return WidgetColors(
                primary: Color(red: 255/255, green: 107/255, blue: 74/255),
                background: Color(red: 18/255, green: 18/255, blue: 18/255),
                divider: Color(red: 42/255, green: 42/255, blue: 42/255),
                textPrimary: Color(red: 240/255, green: 240/255, blue: 240/255),
                textSecondary: Color(red: 160/255, green: 160/255, blue: 160/255),
                textMuted: Color(red: 128/255, green: 128/255, blue: 128/255),
                jiDark: Color(red: 212/255, green: 212/255, blue: 216/255)
            )
        } else {
            return WidgetColors(
                primary: Color(red: 240/255, green: 67/255, blue: 36/255),
                background: Color.white,
                divider: Color(red: 244/255, green: 244/255, blue: 245/255),
                textPrimary: Color.black,
                textSecondary: Color(red: 113/255, green: 113/255, blue: 122/255),
                textMuted: Color(red: 161/255, green: 161/255, blue: 170/255),
                jiDark: Color(red: 39/255, green: 39/255, blue: 42/255)
            )
        }
    }
}

// MARK: - Small Widget (170×170)

struct SmallWidgetView: View {
    let info: LunarDayInfo
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        let c = WidgetColors.forScheme(colorScheme)

        VStack(alignment: .leading, spacing: 0) {
            // Top: Day + date info
            VStack(alignment: .leading, spacing: 1) {
                Text("\(info.solarDay)")
                    .font(.system(size: 36, weight: .black))
                    .foregroundColor(c.textPrimary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)

                Text("\(monthName) · \(info.dayGanzhi)日")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(c.textSecondary)
            }

            Spacer(minLength: 4)

            // Divider
            Rectangle()
                .fill(c.divider)
                .frame(height: 1)

            Spacer(minLength: 4)

            // Yi/Ji columns
            HStack(alignment: .top, spacing: 12) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("宜")
                        .font(.system(size: 12, weight: .heavy))
                        .foregroundColor(c.primary)
                    ForEach(info.yi.prefix(3), id: \.self) { item in
                        Text(item)
                            .font(.system(size: 9))
                            .foregroundColor(c.textSecondary)
                    }
                }
                VStack(alignment: .leading, spacing: 3) {
                    Text("忌")
                        .font(.system(size: 12, weight: .heavy))
                        .foregroundColor(c.textMuted)
                    ForEach(info.ji.prefix(3), id: \.self) { item in
                        Text(item)
                            .font(.system(size: 9))
                            .foregroundColor(c.textMuted)
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
                    .foregroundColor(c.textMuted)
                    .lineLimit(1)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(c.background)
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
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        let c = WidgetColors.forScheme(colorScheme)

        VStack(spacing: 0) {
            // Top row
            HStack(alignment: .bottom) {
                // Left: Day number + date
                HStack(alignment: .bottom, spacing: 10) {
                    Text("\(info.solarDay)")
                        .font(.system(size: 48, weight: .black))
                        .foregroundColor(c.textPrimary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)

                    VStack(alignment: .leading, spacing: 1) {
                        Text("\(monthName) · \(info.weekdayCn)")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(c.textSecondary)
                        Text("農曆 \(info.lunarMonthCn)月\(info.lunarDayCn)")
                            .font(.system(size: 9))
                            .foregroundColor(c.textMuted)
                    }
                }

                Spacer()

                // Right: Ganzhi + clash + jieqi
                VStack(alignment: .trailing, spacing: 1) {
                    Text("\(info.dayGanzhi) · \(info.monthGanzhi) · \(info.yearGanzhi)")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(c.primary)

                    HStack(spacing: 4) {
                        Text(info.clashEmoji).font(.system(size: 9))
                        Text("沖\(info.clashAnimal)")
                            .font(.system(size: 9))
                            .foregroundColor(c.textMuted)
                    }

                    if let jq = info.nextJieqi {
                        Text(info.nextJieqiDate != nil ? "\(jq)將至" : jq)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(c.primary)
                    }
                }
            }

            Spacer(minLength: 6)

            // Divider
            Rectangle()
                .fill(c.divider)
                .frame(height: 1)

            Spacer(minLength: 6)

            // Bottom: Yi/Ji
            HStack(alignment: .top, spacing: 20) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("宜")
                        .font(.system(size: 14, weight: .heavy))
                        .foregroundColor(c.primary)
                    Text(info.yi.prefix(6).joined(separator: " · "))
                        .font(.system(size: 10))
                        .foregroundColor(c.textSecondary)
                        .lineLimit(2)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                VStack(alignment: .leading, spacing: 4) {
                    Text("忌")
                        .font(.system(size: 14, weight: .heavy))
                        .foregroundColor(c.textMuted)
                    Text(info.ji.prefix(6).joined(separator: " · "))
                        .font(.system(size: 10))
                        .foregroundColor(c.textMuted)
                        .lineLimit(2)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(c.background)
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
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        let c = WidgetColors.forScheme(colorScheme)

        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(info.solarDay)")
                        .font(.system(size: 56, weight: .black))
                        .foregroundColor(c.textPrimary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)

                    Text("\(monthName) · \(info.weekdayCn)")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(c.textSecondary)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(info.dayGanzhi)日 · \(info.monthGanzhi)月 · \(info.yearGanzhi)年")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(c.primary)
                    Text("農曆\(info.lunarMonthCn)月\(info.lunarDayCn)")
                        .font(.system(size: 10))
                        .foregroundColor(c.textMuted)
                }
            }

            Spacer(minLength: 8)
            Rectangle().fill(c.divider).frame(height: 1)
            Spacer(minLength: 8)

            // Ganzhi pillars row
            HStack(spacing: 20) {
                GanzhiPillar(label: "年", value: info.yearGanzhi, colors: c)
                GanzhiPillar(label: "月", value: info.monthGanzhi, colors: c)
                GanzhiPillar(label: "日", value: info.dayGanzhi, colors: c)

                Spacer()

                if let jq = info.nextJieqi {
                    HStack(spacing: 6) {
                        Circle()
                            .fill(c.primary)
                            .frame(width: 6, height: 6)
                        Text(info.nextJieqiDate != nil ? "\(jq)將至" : jq)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(c.primary)
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(c.divider)
                    .cornerRadius(12)
                }
            }

            Spacer(minLength: 8)
            Rectangle().fill(c.divider).frame(height: 1)
            Spacer(minLength: 8)

            // Yi/Ji section
            HStack(alignment: .top, spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("宜")
                        .font(.system(size: 16, weight: .heavy))
                        .foregroundColor(c.primary)
                    ForEach(yiPairs, id: \.self) { pair in
                        Text(pair)
                            .font(.system(size: 11))
                            .foregroundColor(c.textSecondary)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                VStack(alignment: .leading, spacing: 6) {
                    Text("忌")
                        .font(.system(size: 16, weight: .heavy))
                        .foregroundColor(c.textMuted)
                    ForEach(jiPairs, id: \.self) { pair in
                        Text(pair)
                            .font(.system(size: 11))
                            .foregroundColor(c.textMuted)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            Spacer(minLength: 8)
            Rectangle().fill(c.divider).frame(height: 1)
            Spacer(minLength: 8)

            // Clash footer
            HStack(spacing: 10) {
                Text(info.clashEmoji)
                    .font(.system(size: 18))

                VStack(alignment: .leading, spacing: 2) {
                    Text("沖\(info.clashAnimal) (\(info.clashBranch))")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(c.textPrimary)
                    Text("屬\(info.clashAnimal)者今日不宜動土、出行 · 煞\(info.sha) · \(info.nayin)")
                        .font(.system(size: 10))
                        .foregroundColor(c.textMuted)
                        .lineLimit(2)
                }
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(c.background)
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
    let colors: WidgetColors

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(label)
                .font(.system(size: 9))
                .foregroundColor(colors.textMuted)
            Text(value)
                .font(.system(size: 28, weight: .black))
                .foregroundColor(colors.textPrimary)
        }
    }
}
