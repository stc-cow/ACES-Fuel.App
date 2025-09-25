import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [phone, setPhone] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [entry, setEntry] = useState({
    liters: "",
    rate: "",
    station: "",
    receipt: "",
    photo_url: "",
    odometer: "",
    notes: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("driver.profile");
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const { data } = await supabase
        .from("driver_tasks")
        .select(
          "id, site_name, driver_name, driver_phone, scheduled_at, status, required_liters, notes",
        )
        .or(`driver_name.eq.${profile.name},driver_phone.eq.${profile.phone}`)
        .order("scheduled_at", { ascending: true });
      setTasks(data || []);
    })();
  }, [profile]);

  const filtered = useMemo(() => {
    if (!query) return tasks;
    const q = query.toLowerCase();
    return tasks.filter((t) =>
      [t.site_name, t.status, t.notes].some((v: any) =>
        String(v || "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [tasks, query]);

  const login = () => {
    const n = name.trim();
    if (!n) return;
    const p = phone.trim();
    const prof = { name: n, phone: p };
    setProfile(prof);
    try {
      localStorage.setItem("driver.profile", JSON.stringify(prof));
    } catch {}
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
      liters: "",
      rate: "",
      station: "",
      receipt: "",
      photo_url: "",
      odometer: "",
      notes: t.notes || "",
    });
    setEditOpen(true);
  };

  const saveCompletion = async () => {
    if (!activeTask) return;
    const liters = parseFloat(entry.liters || "0");
    const rate = entry.rate ? parseFloat(entry.rate) : null;
    const odometer = entry.odometer ? parseInt(entry.odometer) : null;
    await supabase.from("driver_task_entries").insert({
      task_id: activeTask.id,
      liters,
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
    setTasks((arr) =>
      arr.map((x) =>
        x.id === activeTask.id
          ? { ...x, status: "completed", notes: entry.notes }
          : x,
      ),
    );
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
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xxxxxxxx"
              />
            </div>
            <Button className="w-full" onClick={login}>
              Continue
            </Button>
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
            <DialogTitle>Submit Refuel</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="liters">Liters</Label>
              <Input
                id="liters"
                inputMode="decimal"
                value={entry.liters}
                onChange={(e) =>
                  setEntry((s) => ({ ...s, liters: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="rate">Rate (SAR/L)</Label>
              <Input
                id="rate"
                inputMode="decimal"
                value={entry.rate}
                onChange={(e) =>
                  setEntry((s) => ({ ...s, rate: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="station">Station</Label>
              <Input
                id="station"
                value={entry.station}
                onChange={(e) =>
                  setEntry((s) => ({ ...s, station: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="receipt">Receipt #</Label>
              <Input
                id="receipt"
                value={entry.receipt}
                onChange={(e) =>
                  setEntry((s) => ({ ...s, receipt: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="photo">Photo URL</Label>
              <Input
                id="photo"
                value={entry.photo_url}
                onChange={(e) =>
                  setEntry((s) => ({ ...s, photo_url: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="odo">Odometer</Label>
              <Input
                id="odo"
                inputMode="numeric"
                value={entry.odometer}
                onChange={(e) =>
                  setEntry((s) => ({ ...s, odometer: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={entry.notes}
                onChange={(e) =>
                  setEntry((s) => ({ ...s, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCompletion}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
