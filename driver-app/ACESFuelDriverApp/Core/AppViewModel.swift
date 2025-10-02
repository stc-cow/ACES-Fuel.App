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
    @Published var isAuthenticating = false
    @Published var authErrorMessage: String?

    private let supabaseService = SupabaseService.shared
    private var authenticatedDriver: DriverProfile? {
        if case let .authenticated(profile) = sessionState {
            return profile
        }
        return nil
    }

    init() {
        Task {
            await bootstrapSession()
        }
    }

    func bootstrapSession() async {
        sessionState = .loading
        do {
            let profile = try await supabaseService.restoreSession()
            sessionState = .authenticated(profile)
            navigationPath = NavigationPath()
        } catch {
            sessionState = .unauthenticated
        }
    }

    func signIn(email: String, password: String) async {
        guard !email.isEmpty, !password.isEmpty else {
            authErrorMessage = "Email and password are required."
            return
        }

        isAuthenticating = true
        authErrorMessage = nil

        do {
            let profile = try await supabaseService.signIn(email: email, password: password)
            sessionState = .authenticated(profile)
            navigationPath = NavigationPath()
        } catch {
            authErrorMessage = error.localizedDescription
            sessionState = .unauthenticated
        }

        isAuthenticating = false
    }

    func signOut() async {
        do {
            try await supabaseService.signOut()
        } catch {
            // Surfaceable error handling can be added as needed
        }
        sessionState = .unauthenticated
        navigationPath = NavigationPath()
    }

    func requireAuthenticatedDriver() -> DriverProfile? {
        authenticatedDriver
    }
}
