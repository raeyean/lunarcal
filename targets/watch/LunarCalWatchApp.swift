import SwiftUI

@main
struct LunarCalWatchApp: App {
    @StateObject private var connectivity = ConnectivityManager.shared

    var body: some Scene {
        WindowGroup {
            DayPagerView()
                .environmentObject(connectivity)
        }
    }
}
