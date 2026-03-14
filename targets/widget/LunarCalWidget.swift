import WidgetKit
import SwiftUI

// MARK: - Timeline Entry

struct LunarCalEntry: TimelineEntry {
    let date: Date
    let info: LunarDayInfo
}

// MARK: - Timeline Provider

struct LunarCalProvider: TimelineProvider {
    func placeholder(in context: Context) -> LunarCalEntry {
        let info = LunarCalculator.calculate(year: 2026, month: 3, day: 1)
        return LunarCalEntry(date: Date(), info: info)
    }

    func getSnapshot(in context: Context, completion: @escaping (LunarCalEntry) -> Void) {
        let entry = makeEntry(for: Date())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<LunarCalEntry>) -> Void) {
        let now = Date()
        let entry = makeEntry(for: now)

        // Refresh at midnight
        let calendar = Calendar.current
        let tomorrow = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: now)!)
        let timeline = Timeline(entries: [entry], policy: .after(tomorrow))
        completion(timeline)
    }

    private func makeEntry(for date: Date) -> LunarCalEntry {
        let cal = Calendar.current
        let year = cal.component(.year, from: date)
        let month = cal.component(.month, from: date)
        let day = cal.component(.day, from: date)
        let info = LunarCalculator.calculate(year: year, month: month, day: day)
        return LunarCalEntry(date: date, info: info)
    }
}

// MARK: - Widget Definition

struct LunarCalWidget: Widget {
    let kind: String = "LunarCalWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LunarCalProvider()) { entry in
            LunarCalWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    Color.clear
                }
        }
        .configurationDisplayName("風水日曆")
        .description("今日農曆、天干地支、宜忌一覽")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .contentMarginsDisabled()
    }
}

// MARK: - Entry View (routes to correct size)

struct LunarCalWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: LunarCalEntry

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(info: entry.info)
        case .systemMedium:
            MediumWidgetView(info: entry.info)
        case .systemLarge:
            LargeWidgetView(info: entry.info)
        default:
            SmallWidgetView(info: entry.info)
        }
    }
}

// MARK: - Widget Bundle

@main
struct LunarCalWidgetBundle: WidgetBundle {
    var body: some Widget {
        LunarCalWidget()
    }
}

// MARK: - Preview

#if DEBUG
struct LunarCalWidget_Previews: PreviewProvider {
    static var previews: some View {
        let info = LunarCalculator.calculate(year: 2026, month: 3, day: 1)
        let entry = LunarCalEntry(date: Date(), info: info)

        SmallWidgetView(info: entry.info)
            .previewContext(WidgetPreviewContext(family: .systemSmall))

        MediumWidgetView(info: entry.info)
            .previewContext(WidgetPreviewContext(family: .systemMedium))

        LargeWidgetView(info: entry.info)
            .previewContext(WidgetPreviewContext(family: .systemLarge))
    }
}
#endif
