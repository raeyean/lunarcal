import ExpoModulesCore
import WidgetKit

// Bridges the React Native app to the LunarCalWidgetExtension. The app writes
// today's (and the next few days') real lunar-javascript data into the shared
// App Group UserDefaults; the widget reads it from there. After writing, we ask
// WidgetKit to reload so the home-screen widget reflects the latest data.
public class WidgetBridgeModule: Module {
  private static let appGroup = "group.com.raeyean.LunarCal"
  private static let dataKey = "widgetData"

  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    Function("setWidgetData") { (json: String) -> Void in
      let defaults = UserDefaults(suiteName: WidgetBridgeModule.appGroup)
      defaults?.set(json, forKey: WidgetBridgeModule.dataKey)
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }
  }
}
