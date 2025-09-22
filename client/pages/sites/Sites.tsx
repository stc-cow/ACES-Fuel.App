import { AppShell } from "@/components/layout/AppSidebar";
import Header from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import {
  Columns2,
  Download,
  Printer,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type SiteRow = {
  id: number;
  name: string;
  generator: string;
  currentLiters: number;
  dailyVirtual: number;
  lastAvg: number;
  rateOk: boolean;
  driver: string;
  project: string;
  city: string;
  address: string;
  active: boolean;
};

const initialRows: SiteRow[] = [
  {
    id: 1,
    name: "4425",
    generator: "COWM03",
    currentLiters: 0,
    dailyVirtual: 0,
    lastAvg: 0,
    rateOk: true,
    driver: "-",
    project: "stc-cow",
    city: "Dammam",
    address: "Dammam city",
    active: true,
  },
  {
    id: 2,
    name: "3426",
    generator: "COW6048",
    currentLiters: 0,
    dailyVirtual: 0,
    lastAvg: 0,
    rateOk: true,
    driver: "-",
    project: "stc-cow",
    city: "Riyadh",
    address: "RIYADH",
    active: true,
  },
  {
    id: 3,
    name: "cn4n10 1 5.0069E02",
    generator: "cn4n10",
    currentLiters: 100,
    dailyVirtual: 400,
    lastAvg: 0,
    rateOk: false,
    driver: "Khalid Nizar",
    project: "stc-cow",
    city: "Dammam",
    address: "dammam",
    active: true,
  },
  {
    id: 4,
    name: "3425",
    generator: "t6866",
    currentLiters: 95,
    dailyVirtual: 90,
    lastAvg: 0,
    rateOk: false,
    driver: "SHOBAB JAMIL MUHAMMAD JAMAL",
    project: "Mobily EM",
    city: "Riyadh",
    address: "-",
    active: true,
  },
  {
    id: 5,
    name: "3426-3",
    generator: "COW6148",
    currentLiters: 0,
    dailyVirtual: 20,
    lastAvg: 0,
    rateOk: false,
    driver: "-",
    project: "stc-cow",
    city: "Jubail",
    address: "Jubail",
    active: true,
  },
];

const allColumns = [
  { key: "index", label: "#" },
  { key: "name", label: "Name" },
  { key: "generator", label: "Generator" },
  { key: "currentLiters", label: "Current Liters in Tank" },
  { key: "dailyVirtual", label: "Daily virtual consumption" },
  { key: "lastAvg", label: "Last average consumption" },
  { key: "rateOk", label: "Rate" },
  { key: "driver", label: "Driver" },
  { key: "project", label: "Project" },
  { key: "city", label: "City" },
  { key: "address", label: "Address" },
  { key: "active", label: "Active" },
  { key: "settings", label: "Settings" },
] as const;

type ColumnKey = (typeof allColumns)[number]["key"];

export default function SitesPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<SiteRow[]>(initialRows);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [cols, setCols] = useState<Record<ColumnKey, boolean>>({
    index: true,
    name: true,
    generator: true,
    currentLiters: true,
    dailyVirtual: true,
    lastAvg: true,
    rateOk: true,
    driver: true,
    project: true,
    city: true,
    address: true,
    active: true,
    settings: true,
  });

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) =>
      [r.name, r.generator, r.driver, r.project, r.city, r.address].some((v) =>
        String(v).toLowerCase().includes(q),
      ),
    );
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const exportCsv = () => {
    const visible = allColumns.filter(
      (c) => cols[c.key] && !["index", "settings"].includes(c.key as string),
    );
    const head = visible.map((c) => c.label).join(",");
    const body = filtered
      .map((r, idx) =>
        visible
          .map((c) => {
            const key = c.key as keyof SiteRow;
            const v = (r as any)[key];
            if (key === "active") return r.active ? "Yes" : "No";
            if (key === "rateOk") return r.rateOk ? "OK" : "Alert";
            return v;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([head + "\n" + body], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sites.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const remove = (id: number) => setRows((r) => r.filter((x) => x.id !== id));

  const lessUse = () => {
    const sorted = [...rows].sort((a, b) => a.dailyVirtual - b.dailyVirtual);
    setRows(sorted);
  };
  const mostUse = () => {
    const sorted = [...rows].sort((a, b) => b.dailyVirtual - a.dailyVirtual);
    setRows(sorted);
  };

  return (
    <AppShell>
      <Header />
      <div className="px-4 pb-10 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Manage the site details
          </div>
          <div className="flex items-center gap-2">
            <Button variant="destructive" className="hidden sm:inline-flex">
              Archive
            </Button>
            <Button
              variant="secondary"
              className="hidden sm:inline-flex"
              onClick={exportCsv}
            >
              <Download className="mr-2 h-4 w-4" /> Excel All
            </Button>
            <Button
              variant="outline"
              className="hidden sm:inline-flex"
              onClick={lessUse}
            >
              Less Use
            </Button>
            <Button
              variant="outline"
              className="hidden sm:inline-flex"
              onClick={mostUse}
            >
              Most Use
            </Button>
            <Button
              variant="outline"
              className="hidden sm:inline-flex"
              onClick={() => window.print()}
            >
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden sm:inline-flex">
                  <Columns2 className="mr-2 h-4 w-4" /> Column visibility
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {allColumns.map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.key}
                    checked={cols[c.key]}
                    onCheckedChange={(v) =>
                      setCols((s) => ({ ...s, [c.key]: !!v }))
                    }
                    disabled={c.key === "index"}
                  >
                    {c.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="bg-sky-600 hover:bg-sky-500">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between gap-4 p-4">
              <div className="text-sm text-muted-foreground">
                Print | Column visibility | Show {pageSize} rows
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Search</span>
                <Input
                  value={query}
                  onChange={(e) => {
                    setPage(1);
                    setQuery(e.target.value);
                  }}
                  placeholder=""
                  className="h-9 w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]">
                    {cols.index && (
                      <TableHead className="text-white">#</TableHead>
                    )}
                    {cols.name && (
                      <TableHead className="text-white">Name</TableHead>
                    )}
                    {cols.generator && (
                      <TableHead className="text-white">Generator</TableHead>
                    )}
                    {cols.currentLiters && (
                      <TableHead className="text-white">
                        Current Liters in Tank
                      </TableHead>
                    )}
                    {cols.dailyVirtual && (
                      <TableHead className="text-white">
                        Daily virtual consumption
                      </TableHead>
                    )}
                    {cols.lastAvg && (
                      <TableHead className="text-white">
                        Last average consumption
                      </TableHead>
                    )}
                    {cols.rateOk && (
                      <TableHead className="text-white">Rate</TableHead>
                    )}
                    {cols.driver && (
                      <TableHead className="text-white">Driver</TableHead>
                    )}
                    {cols.project && (
                      <TableHead className="text-white">Project</TableHead>
                    )}
                    {cols.city && (
                      <TableHead className="text-white">City</TableHead>
                    )}
                    {cols.address && (
                      <TableHead className="text-white">Address</TableHead>
                    )}
                    {cols.active && (
                      <TableHead className="text-white">Active</TableHead>
                    )}
                    {cols.settings && (
                      <TableHead className="text-white">Settings</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {current.map((r, idx) => (
                    <TableRow key={r.id}>
                      {cols.index && (
                        <TableCell className="font-medium">
                          {(page - 1) * pageSize + idx + 1}
                        </TableCell>
                      )}
                      {cols.name && (
                        <TableCell className="font-medium">{r.name}</TableCell>
                      )}
                      {cols.generator && <TableCell>{r.generator}</TableCell>}
                      {cols.currentLiters && (
                        <TableCell>{r.currentLiters}</TableCell>
                      )}
                      {cols.dailyVirtual && (
                        <TableCell>{r.dailyVirtual}</TableCell>
                      )}
                      {cols.lastAvg && <TableCell>{r.lastAvg}</TableCell>}
                      {cols.rateOk && (
                        <TableCell>
                          {r.rateOk ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-rose-500" />
                          )}
                        </TableCell>
                      )}
                      {cols.driver && <TableCell>{r.driver}</TableCell>}
                      {cols.project && <TableCell>{r.project}</TableCell>}
                      {cols.city && <TableCell>{r.city}</TableCell>}
                      {cols.address && <TableCell>{r.address}</TableCell>}
                      {cols.active && (
                        <TableCell>
                          {r.active ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </TableCell>
                      )}
                      {cols.settings && (
                        <TableCell className="space-x-2 text-right">
                          <Button size="icon" variant="ghost" aria-label="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Delete"
                            onClick={() => remove(r.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {current.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={allColumns.length}
                        className="text-center text-sm text-muted-foreground"
                      >
                        No results
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
              <div>
                Showing {current.length} of {filtered.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <span className="tabular-nums">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
