import SwiftUI

struct DriverHomeView: View {
    let profile: DriverProfile
    @State private var selectedTask: FuelTask?
    @State private var activeTasks: [FuelTask] = []

    var body: some View {
        VStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    headerSection
                    TaskListSection(title: "Active Tasks", tasks: activeTasks) { task in
                        selectedTask = task
                    }
                    HistorySummarySection()
                }
                .padding()
            }
            .sheet(item: $selectedTask) { task in
                NavigationStack {
                    TaskDetailView(task: task)
                }
            }
        }
        .navigationTitle("Tasks")
        .navigationBarTitleDisplayMode(.large)
    }

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Welcome back")
                .font(.caption)
                .foregroundColor(.secondary)
            Text(profile.displayName)
                .font(.title.weight(.semibold))
        }
    }
}

#Preview {
    DriverHomeView(profile: DriverProfile(
        id: UUID(),
        supabaseUserId: "demo",
        firstName: "Jordan",
        lastName: "Lee",
        phoneNumber: "555-0123",
        certificationNumber: "CERT-41"
    ))
}
