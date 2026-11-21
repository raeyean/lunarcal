import Foundation
import WatchConnectivity

final class ConnectivityManager: NSObject, WCSessionDelegate, ObservableObject {
    static let shared = ConnectivityManager()

    @Published var zodiac: String? = UserDefaults.standard.string(forKey: "userZodiac")

    private override init() {
        super.init()
        guard WCSession.isSupported() else { return }
        WCSession.default.delegate = self
        WCSession.default.activate()
    }

    func session(_ session: WCSession,
                 activationDidCompleteWith activationState: WCSessionActivationState,
                 error: Error?) {
        applyContext(session.receivedApplicationContext)
    }

    func session(_ session: WCSession,
                 didReceiveApplicationContext applicationContext: [String: Any]) {
        applyContext(applicationContext)
    }

    private func applyContext(_ context: [String: Any]) {
        guard let z = context["zodiac"] as? String, !z.isEmpty else { return }
        DispatchQueue.main.async {
            self.zodiac = z
            UserDefaults.standard.set(z, forKey: "userZodiac")
        }
    }
}
