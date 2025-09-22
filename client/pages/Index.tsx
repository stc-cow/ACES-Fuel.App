import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { useI18n } from "@/i18n";
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
  { key: "totalLitersToday", value: "0.00 liters", bg: "bg-rose-500" },
  { key: "totalLiters30", value: "0.00 liters", bg: "bg-sky-500" },
  { key: "stcCow30", value: "0.00 liters", bg: "bg-green-500" },
];

export default function Index() {
  const { t } = useI18n();
  const { t } = useI18n();
  return (
    <AppShell>
      <Header />
      <div className="px-4 pb-10 pt-4">
        <div className="mb-4 text-sm text-muted-foreground">{t("dashboard")}</div>

        <div className="grid gap-4 md:grid-cols-3">
          {metricCards.map((m) => (
            <Card key={m.key} className="overflow-hidden">
              <CardContent className={`${m.bg} p-4 text-white`}>
                <div className="text-sm/6 opacity-90">{t(m.key as any)}</div>
                <div className="mt-2 text-2xl font-semibold">{m.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="mb-3 text-base font-medium">{t("totalTasksStatusCount")}</div>
              <ChartContainer config={{}} className="aspect-[4/3]">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`s-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-3 text-base font-medium">
                Total tasks zones count
              </div>
              <ChartContainer config={{}} className="aspect-[4/3]">
                <PieChart>
                  <Pie
                    data={zoneData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {zoneData.map((entry, index) => (
                      <Cell key={`z-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="text-base font-medium">
                Total Status Count in Last 7 Days
              </div>
              <div className="mt-3 text-sm text-muted-foreground">{t("noDataYet")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-base font-medium">
                Total Liters in Last 7 Days
              </div>
              <div className="mt-3 text-sm text-muted-foreground">{t("noDataYet")}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
