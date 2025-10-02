import Combine
import SwiftUI

@MainActor
final class AppViewModel: ObservableObject {
    enum SessionState: Equatable {
        case loading
        case unauthenticated
        case authenticated(DriverProfile)
    }

    @Published var sessionState: SessionState = .loading
    @Published var navigationPath = NavigationPath()

    init() {
        // Deferred initialization to SupabaseService in subsequent tasks
    }
}
