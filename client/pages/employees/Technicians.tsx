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
import { useMemo, useState } from "react";
import {
  Columns2,
  Download,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Technician = {
  id: number;
  name: string;
  phone: string;
  active: boolean;
};

const initialRows: Technician[] = [
  { id: 1, name: "test", phone: "513007562", active: true },
];

const allColumns = [
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "active", label: "Active" },
  { key: "settings", label: "Settings" },
] as const;

type ColumnKey = (typeof allColumns)[number]["key"];

export default function TechniciansPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Technician[]>(initialRows);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [cols, setCols] = useState<Record<ColumnKey, boolean>>({
    name: true,
    phone: true,
    active: true,
    settings: true,
  });

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) =>
      [r.name, r.phone].some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const exportCsv = () => {
    const visible = allColumns.filter(
      (c) => cols[c.key] && c.key !== "settings",
    );
    const head = visible.map((c) => c.label).join(",");
    const body = filtered
      .map((r) =>
        visible
          .map((c) =>
            c.key === "active" ? (r.active ? "Yes" : "No") : (r as any)[c.key],
          )
          .join(","),
      )
      .join("\n");
    const blob = new Blob([head + "\n" + body], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "technicians.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const remove = (id: number) => setRows((r) => r.filter((x) => x.id !== id));

  return (
    <AppShell>
      <Header />
      <div className="px-4 pb-10 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Manage the technicians and their users
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
              <Download className="mr-2 h-4 w-4" /> Export
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
                    {cols.name && (
                      <TableHead className="text-white">Name</TableHead>
                    )}
                    {cols.phone && (
                      <TableHead className="text-white">Phone</TableHead>
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
                  {current.map((r) => (
                    <TableRow key={r.id}>
                      {cols.name && (
                        <TableCell className="font-medium">{r.name}</TableCell>
                      )}
                      {cols.phone && <TableCell>{r.phone}</TableCell>}
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
