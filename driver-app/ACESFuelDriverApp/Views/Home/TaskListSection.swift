import SwiftUI

struct TaskListSection: View {
    let title: String
    let tasks: [FuelTask]
    let onSelect: (FuelTask) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.title3.weight(.semibold))
            VStack(spacing: 12) {
                ForEach(tasks) { task in
                    Button {
                        onSelect(task)
                    } label: {
                        TaskRow(task: task)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(Color(.secondarySystemBackground))
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                    .buttonStyle(.plain)
                }

                if tasks.isEmpty {
                    EmptyContentView(message: "No tasks available.")
                }
            }
        }
    }
}

#Preview {
    TaskListSection(
        title: "Active Tasks",
        tasks: [
            FuelTask(
                id: UUID(),
                siteName: "Site 12 - Storage Yard",
                vehicleIdentifier: "Truck 24",
                scheduledAt: .now,
                status: .pending,
                instructions: "Confirm vehicle is offline before fueling.",
                fuelType: "Diesel",
                capacityGallons: 125,
                priority: 2,
                assignedDriverId: UUID(),
                startedAt: nil,
                completedAt: nil,
                lastUpdatedAt: .now
            )
        ],
        onSelect: { _ in }
    )
}
