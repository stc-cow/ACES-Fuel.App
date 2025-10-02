import SwiftUI

struct LoginView: View {
    @EnvironmentObject private var appViewModel: AppViewModel
    @State private var email: String = ""
    @State private var password: String = ""

    var body: some View {
        VStack {
            NavigationStack {
                ScrollView {
                    VStack(spacing: 24) {
                        VStack(spacing: 8) {
                            Text("ACES Fuel Driver")
                                .font(.largeTitle.weight(.bold))
                                .frame(maxWidth: .infinity, alignment: .leading)
                            Text("Sign in with your driver credentials to access fueling assignments.")
                                .font(.body)
                                .foregroundColor(.secondary)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }

                        VStack(spacing: 16) {
                            TextField("Email", text: $email)
                                .textContentType(.username)
                                .keyboardType(.emailAddress)
                                .textInputAutocapitalization(.never)
                                .padding()
                                .background(Color(.secondarySystemBackground))
                                .clipShape(RoundedRectangle(cornerRadius: 12))

                            SecureField("Password", text: $password)
                                .textContentType(.password)
                                .padding()
                                .background(Color(.secondarySystemBackground))
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }

                        Button("Sign In") {
                            // Authentication logic implemented in later task
                        }
                        .buttonStyle(.borderedProminent)
                        .frame(maxWidth: .infinity)
                    }
                    .padding()
                }
                .navigationTitle("Sign In")
                .navigationBarTitleDisplayMode(.large)
            }
        }
        .background(Color(.systemBackground))
    }
}

#Preview {
    LoginView()
        .environmentObject(AppViewModel())
}
