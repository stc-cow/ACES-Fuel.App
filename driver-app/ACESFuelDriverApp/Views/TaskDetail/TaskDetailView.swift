import SwiftUI

struct TaskDetailView: View {
    let task: FuelTask

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 12) {
                    Text(task.siteName)
                        .font(.title.weight(.semibold))
                    Text(task.instructions)
                        .font(.body)
                        .foregroundColor(.secondary)
                }

                TaskMetadataSection(task: task)
                ActionButtonsSection(task: task)
            }
            .padding()
        }
        .navigationTitle("Task Details")
        .navigationBarTitleDisplayMode(.large)
    }
}

private struct TaskMetadataSection: View {
    let task: FuelTask

    var body: some View {
        VStack(spacing: 12) {
            InfoRow(title: "Vehicle", value: task.vehicleIdentifier, systemImage: "car.fill")
            InfoRow(title: "Fuel Type", value: task.fuelType, systemImage: "fuelpump.fill")
            InfoRow(title: "Scheduled", value: task.scheduledAt.formatted(date: .complete, time: .shortened), systemImage: "calendar")
            InfoRow(title: "Capacity", value: "\(Int(task.capacityGallons)) gal", systemImage: "gauge" )
            InfoRow(title: "Priority", value: "#\(task.priority)", systemImage: "flag.fill")
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

private struct InfoRow: View {
    let title: String
    let value: String
    let systemImage: String

    var body: some View {
        HStack {
            Image(systemName: systemImage)
                .frame(width: 28)
                .foregroundColor(.accentColor)
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Text(value)
                    .font(.body.weight(.medium))
            }
            Spacer()
        }
    }
}

private struct ActionButtonsSection: View {
    let task: FuelTask

    var body: some View {
        VStack(spacing: 16) {
            Button {
                // Start task action to be wired
            } label: {
                Text("Start Task")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)

            Button {
                // Log fuel action to be wired
            } label: {
                Text("Submit Fuel Log")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
        }
    }
}

#Preview {
    TaskDetailView(task: FuelTask(
        id: UUID(),
        siteName: "Terminal 5",
        vehicleIdentifier: "Fleet 102",
        scheduledAt: .now,
        status: .pending,
        instructions: "Confirm hazardous materials protocols and capture before/after photos.",
        fuelType: "Diesel",
        capacityGallons: 120,
        priority: 1,
        assignedDriverId: UUID(),
        startedAt: nil,
        completedAt: nil,
        lastUpdatedAt: .now
    ))
}
