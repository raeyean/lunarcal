import SwiftUI

@main
struct LunarCalWatchApp: App {
    var body: some Scene {
        WindowGroup {
            VStack {
                Text("LunarCal")
                    .font(.headline)
                Text(LunarCalculator.calculate(year: 2026, month: 6, day: 12).dayGanzhi)
                    .foregroundColor(.secondary)
            }
        }
    }
}
