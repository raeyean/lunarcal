import SwiftUI

struct DayPagerView: View {
    @State private var selection = 0

    var body: some View {
        TabView(selection: $selection) {
            ForEach(-7...7, id: \.self) { offset in
                GlanceView(offset: offset)
                    .tag(offset)
            }
        }
        .tabViewStyle(.verticalPage)
    }
}
