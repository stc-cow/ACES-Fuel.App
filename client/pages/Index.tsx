import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { AppShell } from "@/components/layout/AppSidebar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

const statusData = [
  { name: "Creation", value: 71.5, color: "#f43f5e" },
  { name: "Finished by Driver", value: 22.2, color: "#fb923c" },
  { name: "Task approved", value: 3.5, color: "#22c55e" },
  { name: "Rejected by driver", value: 1.3, color: "#06b6d4" },
  { name: "Canceled", value: 1.5, color: "#a3a3a3" },
];

const zoneData = [
  { name: "COW East Region", value: 45.8, color: "#8b5cf6" },
  { name: "COW West Region", value: 21.9, color: "#06b6d4" },
  { name: "Mobily Central Region", value: 31.5, color: "#f59e0b" },
  { name: "stc-cow", value: 0.8, color: "#22c55e" },
];

const metricCards = [
  {
    title: "Total Liters Added Today",
    value: "0.00 liters",
    bg: "bg-rose-500",
  },
  {
    title: "Total Liters Added in Last 30 Days",
    value: "0.00 liters",
    bg: "bg-sky-500",
  },
  {
    title: "Stc-cow – Last 30 Days",
    value: "0.00 liters",
    bg: "bg-green-500",
  },
];

export default function Index() {
  return (
    <AppShell>
      <Header />
      <div className="px-4 pb-10 pt-4">
        <div className="mb-4 text-sm text-muted-foreground">Dashboard</div>

        <div className="grid gap-4 md:grid-cols-3">
          {metricCards.map((m) => (
            <Card key={m.title} className="overflow-hidden">
              <CardContent className={`${m.bg} p-4 text-white`}>
                <div className="text-sm/6 opacity-90">{m.title}</div>
                <div className="mt-2 text-2xl font-semibold">{m.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="mb-3 text-base font-medium">Total tasks status count</div>
              <ChartContainer config={{}} className="aspect-[4/3]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                      {statusData.map((entry, index) => (
                        <Cell key={`s-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-3 text-base font-medium">Total tasks zones count</div>
              <ChartContainer config={{}} className="aspect-[4/3]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={zoneData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                      {zoneData.map((entry, index) => (
                        <Cell key={`z-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="text-base font-medium">Total Status Count in Last 7 Days</div>
              <div className="mt-3 text-sm text-muted-foreground">No data yet</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-base font-medium">Total Liters in Last 7 Days</div>
              <div className="mt-3 text-sm text-muted-foreground">No data yet</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
