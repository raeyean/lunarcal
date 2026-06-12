import ExpoModulesCore
import WatchConnectivity

final class WatchSyncSessionDelegate: NSObject, WCSessionDelegate {
    static let shared = WatchSyncSessionDelegate()
    var pendingZodiac: String?

    func session(_ session: WCSession,
                 activationDidCompleteWith activationState: WCSessionActivationState,
                 error: Error?) {
        if activationState == .activated, let z = pendingZodiac {
            try? session.updateApplicationContext(["zodiac": z])
            pendingZodiac = nil
        }
    }

    func sessionDidBecomeInactive(_ session: WCSession) {}
    func sessionDidDeactivate(_ session: WCSession) { session.activate() }
}

public class WatchSyncModule: Module {
    public func definition() -> ModuleDefinition {
        Name("WatchSync")

        Function("syncZodiac") { (zodiac: String) -> Bool in
            guard WCSession.isSupported() else { return false }
            let session = WCSession.default
            if session.delegate == nil {
                session.delegate = WatchSyncSessionDelegate.shared
            }
            if session.activationState != .activated {
                WatchSyncSessionDelegate.shared.pendingZodiac = zodiac
                session.activate()
                return true
            }
            do {
                try session.updateApplicationContext(["zodiac": zodiac])
                return true
            } catch {
                return false
            }
        }
    }
}
