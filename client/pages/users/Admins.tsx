import { AppShell } from "@/components/layout/AppSidebar";
import Header from "@/components/layout/Header";
import { useI18n } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { Plus, Download, Columns2, Pencil, Trash2, Eye } from "lucide-react";

type Admin = {
  id: number;
  username: string;
  email: string;
  webAuth: string;
  details?: string;
  setting?: string;
};

const initialAdmins: Admin[] = [
  {
    id: 1,
    username: "EastCoordinator",
    email: "a.hassan@aces-sa.com",
    webAuth: "East coordinator",
    details: "Responsible for eastern region ops.",
    setting: "Default",
  },
  {
    id: 2,
    username: "CentralCoordinator",
    email: "anna.hessa@aces-sa.com",
    webAuth: "Central Coordinator",
    details: "Covers central region.",
    setting: "Default",
  },
  {
    id: 3,
    username: "admin",
    email: "admin@admin.com",
    webAuth: "Admin",
    details: "Super admin",
    setting: "Global",
  },
];

const allColumns = [
  { key: "username", label: "Username" },
  { key: "email", label: "Email" },
  { key: "webAuth", label: "Web Authorization" },
  { key: "details", label: "Details" },
  { key: "setting", label: "Setting" },
  { key: "settings", label: "Settings", sticky: true },
] as const;

type ColumnKey = (typeof allColumns)[number]["key"];

type AdminForm = {
  username: string;
  email: string;
  webAuth: string;
  details: string;
  setting: string;
};

const emptyForm: AdminForm = { username: "", email: "", webAuth: "", details: "", setting: "" };

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [cols, setCols] = useState<Record<ColumnKey, boolean>>({
    username: true,
    email: true,
    webAuth: true,
    details: true,
    setting: true,
    settings: true,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<Admin[]>(initialAdmins);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<AdminForm>(emptyForm);
  const [addErrors, setAddErrors] = useState<Partial<Record<keyof AdminForm, string>>>({});

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Admin & { index: number } | null>(null);

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) =>
      [r.username, r.email, r.webAuth, r.details ?? "", r.setting ?? ""].some((v) =>
        v.toLowerCase().includes(q),
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
      (c) => cols[c.key] && c.key !== "settings",
    );
    const head = visible.map((c) => c.label).join(",");
    const body = filtered
      .map((r) => visible.map((c) => (r as any)[c.key] ?? "").join(","))
      .join("\n");
    const blob = new Blob([head + "\n" + body], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin-users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const validateForm = (form: AdminForm) => {
    const errs: Partial<Record<keyof AdminForm, string>> = {};
    if (!form.username.trim()) errs.username = "required";
    if (!form.email.trim()) errs.email = "required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "invalidEmail";
    if (!form.webAuth.trim()) errs.webAuth = "required";
    return errs;
  };

  const handleAdd = () => {
    const errs = validateForm(addForm);
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const nextId = rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
    const newRow: Admin = { id: nextId, ...addForm };
    setRows((r) => [newRow, ...r]);
    setAddForm(emptyForm);
    setAddOpen(false);
  };

  const openEdit = (row: Admin, index: number) => {
    setEditForm({ ...row, index, details: row.details ?? "", setting: row.setting ?? "" });
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editForm) return;
    const errs = validateForm({
      username: editForm.username,
      email: editForm.email,
      webAuth: editForm.webAuth,
      details: editForm.details ?? "",
      setting: editForm.setting ?? "",
    });
    if (Object.keys(errs).length > 0) return;
    setRows((r) => {
      const copy = r.slice();
      copy[editForm.index] = {
        id: editForm.id,
        username: editForm.username,
        email: editForm.email,
        webAuth: editForm.webAuth,
        details: editForm.details ?? "",
        setting: editForm.setting ?? "",
      };
      return copy;
    });
    setEditOpen(false);
    setEditForm(null);
  };

  const remove = (id: number) => setRows((r) => r.filter((x) => x.id !== id));

  const { t } = useI18n();
  return (
    <AppShell>
      <Header />
      <div className="px-4 pb-10 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t("manageAdminsIntro")}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="hidden sm:inline-flex"
              onClick={exportCsv}
            >
              <Download className="mr-2 h-4 w-4" /> {t("export")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden sm:inline-flex">
                  <Columns2 className="mr-2 h-4 w-4" /> {t("columns")}
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
                    disabled={c.key === "settings"}
                  >
                    {c.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-sky-600 hover:bg-sky-500">
                  <Plus className="mr-2 h-4 w-4" /> {t("add")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("addUser")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">{t("username")}</Label>
                    <Input
                      id="username"
                      value={addForm.username}
                      onChange={(e) => setAddForm((f) => ({ ...f, username: e.target.value }))}
                    />
                    {addErrors.username && (
                      <p className="mt-1 text-xs text-destructive">{t(addErrors.username)}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={addForm.email}
                      onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                    />
                    {addErrors.email && (
                      <p className="mt-1 text-xs text-destructive">{t(addErrors.email)}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="webAuth">{t("webAuthorization")}</Label>
                    <Input
                      id="webAuth"
                      value={addForm.webAuth}
                      onChange={(e) => setAddForm((f) => ({ ...f, webAuth: e.target.value }))}
                    />
                    {addErrors.webAuth && (
                      <p className="mt-1 text-xs text-destructive">{t(addErrors.webAuth)}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="details">{t("details")}</Label>
                    <Textarea
                      id="details"
                      value={addForm.details}
                      onChange={(e) => setAddForm((f) => ({ ...f, details: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="setting">{t("setting")}</Label>
                    <Input
                      id="setting"
                      value={addForm.setting}
                      onChange={(e) => setAddForm((f) => ({ ...f, setting: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6 gap-2 sm:gap-2">
                  <Button variant="outline" onClick={() => setAddOpen(false)}>
                    {t("cancel")}
                  </Button>
                  <Button onClick={handleAdd}>{t("save")}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between gap-4 p-4">
              <div className="text-sm text-muted-foreground">
                {t("excelPrintColumnVisibility")}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t("search")}
                </span>
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
                    {cols.username && (
                      <TableHead className="text-white">
                        {t("username")}
                      </TableHead>
                    )}
                    {cols.email && (
                      <TableHead className="text-white">{t("email")}</TableHead>
                    )}
                    {cols.webAuth && (
                      <TableHead className="text-white">
                        {t("webAuthorization")}
                      </TableHead>
                    )}
                    {cols.details && (
                      <TableHead className="text-white">{t("details")}</TableHead>
                    )}
                    {cols.setting && (
                      <TableHead className="text-white">{t("setting")}</TableHead>
                    )}
                    {cols.settings && (
                      <TableHead className="text-white">
                        {t("settingsCol")}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {current.map((r) => (
                    <TableRow key={r.id}>
                      {cols.username && (
                        <TableCell className="font-medium">
                          {r.username}
                        </TableCell>
                      )}
                      {cols.email && <TableCell>{r.email}</TableCell>}
                      {cols.webAuth && <TableCell>{r.webAuth}</TableCell>}
                      {cols.details && <TableCell className="max-w-sm truncate" title={r.details}>{r.details}</TableCell>}
                      {cols.setting && <TableCell>{r.setting}</TableCell>}
                      {cols.settings && (
                        <TableCell className="space-x-2 text-right">
                          <Button size="icon" variant="ghost" aria-label="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => openEdit(r, rows.findIndex((x) => x.id === r.id))}>
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
                        colSpan={6}
                        className="text-center text-sm text-muted-foreground"
                      >
                        {t("noResults")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
              <div>
                {t("showing")} {current.length} {t("of")} {filtered.length}{" "}
                {t("entries")}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {t("prev")}
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
                  {t("next")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editUser")}</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-username">{t("username")}</Label>
                <Input
                  id="edit-username"
                  value={editForm.username}
                  onChange={(e) => setEditForm((f) => (f ? { ...f, username: e.target.value } : f))}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">{t("email")}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => (f ? { ...f, email: e.target.value } : f))}
                />
              </div>
              <div>
                <Label htmlFor="edit-webAuth">{t("webAuthorization")}</Label>
                <Input
                  id="edit-webAuth"
                  value={editForm.webAuth}
                  onChange={(e) => setEditForm((f) => (f ? { ...f, webAuth: e.target.value } : f))}
                />
              </div>
              <div>
                <Label htmlFor="edit-details">{t("details")}</Label>
                <Textarea
                  id="edit-details"
                  value={editForm.details ?? ""}
                  onChange={(e) => setEditForm((f) => (f ? { ...f, details: e.target.value } : f))}
                />
              </div>
              <div>
                <Label htmlFor="edit-setting">{t("setting")}</Label>
                <Input
                  id="edit-setting"
                  value={editForm.setting ?? ""}
                  onChange={(e) => setEditForm((f) => (f ? { ...f, setting: e.target.value } : f))}
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-6 gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleEditSave}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
