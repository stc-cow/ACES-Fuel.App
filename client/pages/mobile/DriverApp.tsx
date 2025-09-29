import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

export default function DriverApp() {
  const [profile, setProfile] = useState<{
    name: string;
    phone: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [entry, setEntry] = useState({
    // required fields for this form
    site_id: "",
    mission_id: "",
    actual_liters_in_tank: "",
    quantity_added: "",
    notes: "",
    // image urls (filled after upload)
    counter_before_url: "",
    tank_before_url: "",
    counter_after_url: "",
    tank_after_url: "",
    // legacy/compat fields used by existing submit logic (kept hidden)
    tank_type: "",
    completed_at: "",
    vertical_calculated_liters: "",
    liters: "",
    rate: "",
    station: "",
    receipt: "",
    photo_url: "",
    odometer: "",
  });

  // upload state
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const DRIVER_BUCKET = "driver-uploads";

  const keyMap = {
    counter_before: "counter_before_url",
    tank_before: "tank_before_url",
    counter_after: "counter_after_url",
    tank_after: "tank_after_url",
  } as const;

  const handleFile = async (
    tag: keyof typeof keyMap,
    file: File,
  ) => {
    const k = keyMap[tag];
    setUploading((u) => ({ ...u, [tag]: true }));
    try {
      const dir = `${(profile?.name || "driver").replace(/\s+/g, "_")}/${
        activeTask?.id || "misc"
      }`;
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${dir}/${tag}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from(DRIVER_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) {
        alert("Image upload failed. Please try again.");
        return;
      }
      const { data } = supabase.storage.from(DRIVER_BUCKET).getPublicUrl(path);
      const url = data.publicUrl;
      setEntry((s: any) => ({ ...s, [k]: url }));
    } finally {
      setUploading((u) => ({ ...u, [tag]: false }));
    }
  };

  useEffect(() => {
    try {
      const getParams = () => {
        const search = window.location.search;
        if (search && search.length > 1) return new URLSearchParams(search);
        const hash = window.location.hash || "";
        const qIndex = hash.indexOf("?");
        if (qIndex >= 0) return new URLSearchParams(hash.substring(qIndex));
        return new URLSearchParams();
      };
      const params = getParams();
      const demo = params.get("demo") === "1";
      setDemoMode(demo);
      if (demo) {
        const demoProfile = { name: "Demo Driver", phone: "0500000000" };
        setProfile(demoProfile);
        setTasks([
          {
            id: 1001,
            site_name: "Site A",
            site_id: "SITE-A-001",
            driver_name: demoProfile.name,
            driver_phone: demoProfile.phone,
            scheduled_at: new Date().toISOString(),
            status: "pending",
            required_liters: 500,
            notes: "Check tank level before refuel",
          },
          {
            id: 1002,
            site_name: "Site B",
            site_id: "SITE-B-002",
            driver_name: demoProfile.name,
            driver_phone: demoProfile.phone,
            scheduled_at: new Date(Date.now() + 3600000).toISOString(),
            status: "in_progress",
            required_liters: 300,
            notes: "Photograph counter",
          },
        ]);
        if (params.get("open") === "1") {
          setActiveTask({ id: 1001 });
          setEditOpen(true);
        }
        return;
      }
      const raw = localStorage.getItem("driver.profile");
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      if (!profile || demoMode) return;
      const { data } = await supabase
        .from("driver_tasks")
        .select("*")
        .or(
          `driver_name.eq.${profile.name},driver_phone.eq.${profile.phone || ""}`,
        )
        .order("scheduled_at", { ascending: true });
      setTasks(data || []);
    })();
  }, [profile, demoMode]);

  const filtered = useMemo(() => {
    const base = tasks.filter((t) => t.status !== "completed");
    if (!query) return base;
    const q = query.toLowerCase();
    return base.filter((t) =>
      [t.site_name, t.status, t.notes].some((v: any) =>
        String(v || "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [tasks, query]);

  const sha256 = async (text: string) => {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const verifyPassword = async () => {
    setErrorMsg("");
    const n = name.trim();
    const pw = password;
    if (!n || !pw) {
      setErrorMsg("Enter username and password");
      return;
    }
    setVerifying(true);
    try {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .ilike("name", n)
        .order("id", { ascending: false })
        .limit(1);
      if (error) {
        setErrorMsg("Login unavailable");
        return;
      }
      const row: any = data && data[0];
      if (!row || row.active === false) {
        setErrorMsg("Account not found or inactive");
        return;
      }
      if (!row.password_sha256) {
        setErrorMsg("Password not set");
        return;
      }
      const hash = await sha256(pw);
      if (hash !== row.password_sha256) {
        setErrorMsg("Invalid password");
        return;
      }
      const prof = { name: row.name || n, phone: (row.phone as string) || "" };
      setProfile(prof);
      try {
        localStorage.setItem("driver.profile", JSON.stringify(prof));
      } catch {}
    } finally {
      setVerifying(false);
    }
  };

  const logout = () => {
    setProfile(null);
    try {
      localStorage.removeItem("driver.profile");
    } catch {}
  };

  const startTask = async (t: any) => {
    const { error } = await supabase
      .from("driver_tasks")
      .update({ status: "in_progress" })
      .eq("id", t.id);
    if (!error)
      setTasks((arr) =>
        arr.map((x) => (x.id === t.id ? { ...x, status: "in_progress" } : x)),
      );
  };

  const openComplete = (t: any) => {
    setActiveTask(t);
    setEntry({
      site_id: String(t.site_name || ""),
      mission_id: String(t.id || ""),
      actual_liters_in_tank: "",
      quantity_added: "",
      notes: t.notes || "",
      counter_before_url: "",
      tank_before_url: "",
      counter_after_url: "",
      tank_after_url: "",
      tank_type: "",
      completed_at: "",
      vertical_calculated_liters: "",
      liters: "",
      rate: "",
      station: "",
      receipt: "",
      photo_url: "",
      odometer: "",
    });
    setPreviews({});
    setEditOpen(true);
  };

  const saveCompletion = async () => {
    if (!activeTask) return;
    const qty = parseFloat(entry.quantity_added || entry.liters || "0");
    const rate = entry.rate ? parseFloat(entry.rate) : null;
    const odometer = entry.odometer ? parseInt(entry.odometer) : null;
    await supabase.from("driver_task_entries").insert({
      task_id: activeTask.id,
      liters: qty,
      rate,
      station: entry.station || null,
      receipt_number: entry.receipt || null,
      photo_url: entry.photo_url || null,
      odometer: odometer as any,
      submitted_by: profile?.name || null,
    });
    await supabase
      .from("driver_tasks")
      .update({ status: "completed", notes: entry.notes || null })
      .eq("id", activeTask.id);
    setTasks((arr) => arr.filter((x) => x.id !== activeTask.id));
    setEditOpen(false);
    setActiveTask(null);
  };

  if (!profile) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-4">
        <h1 className="mt-6 text-center text-2xl font-semibold">Driver App</h1>
        <Card>
          <CardContent className="space-y-4 p-6">
            <div>
              <Label htmlFor="name">Username</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="pw">Password</Label>
                <Input
                  id="pw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="w-full"
                  onClick={verifyPassword}
                  disabled={verifying}
                >
                  {verifying ? "Checking..." : "Login"}
                </Button>
              </div>
              {errorMsg && (
                <div className="text-sm text-red-600" role="alert">
                  {errorMsg}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md p-3">
      <div className="sticky top-0 z-10 bg-background pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Signed in as</div>
            <div className="text-base font-semibold">{profile.name}</div>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks"
          />
        </div>
      </div>

      <div className="mt-2 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center text-sm text-muted-foreground">
            No tasks
          </div>
        )}
        {filtered.map((t) => (
          <Card key={t.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(t.scheduled_at || Date.now()).toLocaleString()}
                  </div>
                  <div className="text-lg font-semibold">{t.site_name}</div>
                </div>
                <div className="text-xs">
                  <span
                    className={`rounded px-2 py-1 ${t.status === "completed" ? "bg-emerald-500/10 text-emerald-600" : t.status === "in_progress" ? "bg-amber-500/10 text-amber-600" : "bg-sky-500/10 text-sky-600"}`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
              <div className="grid gap-3 p-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Driver:</span>{" "}
                  {t.driver_name}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    Required Liters:
                  </span>{" "}
                  {t.required_liters ?? "-"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Notes:</span>{" "}
                  {t.notes ?? "-"}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t p-3">
                {t.status === "pending" && (
                  <Button size="sm" onClick={() => startTask(t)}>
                    Start
                  </Button>
                )}
                {t.status !== "completed" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openComplete(t)}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="site_id">Site ID</Label>
                <Input
                  id="site_id"
                  value={entry.site_id}
                  readOnly
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="mission_id">Mission ID</Label>
                <Input
                  id="mission_id"
                  value={entry.mission_id}
                  readOnly
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="actual_liters_in_tank">Actual Liters in Tank</Label>
                <Input
                  id="actual_liters_in_tank"
                  inputMode="decimal"
                  value={entry.actual_liters_in_tank}
                  onChange={(e) =>
                    setEntry((s) => ({
                      ...s,
                      actual_liters_in_tank: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="quantity_added">Quantity Added</Label>
                <Input
                  id="quantity_added"
                  inputMode="decimal"
                  value={entry.quantity_added}
                  onChange={(e) =>
                    setEntry((s) => ({ ...s, quantity_added: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Image: Counter Before</Label>
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = URL.createObjectURL(f);
                    setPreviews((p) => ({ ...p, counter_before: url }));
                    await handleFile("counter_before", f);
                  }}
                />
                {(previews.counter_before || entry.counter_before_url) && (
                  <img
                    src={previews.counter_before || entry.counter_before_url}
                    alt="Counter before"
                    className="mt-2 h-24 w-24 rounded object-cover"
                  />
                )}
                {uploading.counter_before && (
                  <div className="text-xs text-muted-foreground">Uploading...</div>
                )}
              </div>
              <div>
                <Label>Image: Tank Before</Label>
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = URL.createObjectURL(f);
                    setPreviews((p) => ({ ...p, tank_before: url }));
                    await handleFile("tank_before", f);
                  }}
                />
                {(previews.tank_before || entry.tank_before_url) && (
                  <img
                    src={previews.tank_before || entry.tank_before_url}
                    alt="Tank before"
                    className="mt-2 h-24 w-24 rounded object-cover"
                  />
                )}
                {uploading.tank_before && (
                  <div className="text-xs text-muted-foreground">Uploading...</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Image: Counter After</Label>
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = URL.createObjectURL(f);
                    setPreviews((p) => ({ ...p, counter_after: url }));
                    await handleFile("counter_after", f);
                  }}
                />
                {(previews.counter_after || entry.counter_after_url) && (
                  <img
                    src={previews.counter_after || entry.counter_after_url}
                    alt="Counter after"
                    className="mt-2 h-24 w-24 rounded object-cover"
                  />
                )}
                {uploading.counter_after && (
                  <div className="text-xs text-muted-foreground">Uploading...</div>
                )}
              </div>
              <div>
                <Label>Image: Tank After</Label>
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = URL.createObjectURL(f);
                    setPreviews((p) => ({ ...p, tank_after: url }));
                    await handleFile("tank_after", f);
                  }}
                />
                {(previews.tank_after || entry.tank_after_url) && (
                  <img
                    src={previews.tank_after || entry.tank_after_url}
                    alt="Tank after"
                    className="mt-2 h-24 w-24 rounded object-cover"
                  />
                )}
                {uploading.tank_after && (
                  <div className="text-xs text-muted-foreground">Uploading...</div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Remarks</Label>
              <Textarea
                id="notes"
                value={entry.notes}
                onChange={(e) => setEntry((s) => ({ ...s, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCompletion}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
