import SwiftUI

struct HistorySummarySection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("History")
                .font(.title3.weight(.semibold))
            VStack(spacing: 12) {
                HistoryRow(title: "Completed This Week", value: "5 tasks", systemImage: "checkmark.seal.fill")
                HistoryRow(title: "Fuel Dispensed", value: "1,240 gal", systemImage: "fuelpump.fill")
                HistoryRow(title: "Average Duration", value: "42 min", systemImage: "clock")
            }
        }
    }
}

private struct HistoryRow: View {
    let title: String
    let value: String
    let systemImage: String

    var body: some View {
        HStack {
            Image(systemName: systemImage)
                .frame(width: 32, height: 32)
                .foregroundColor(.accentColor)
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Text(value)
                    .font(.headline)
            }
            Spacer()
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

#Preview {
    HistorySummarySection()
        .padding()
}
