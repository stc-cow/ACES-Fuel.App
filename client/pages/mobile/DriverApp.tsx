import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { supabase } from "@/lib/supabase";
import { Bell, Eye, EyeOff } from "lucide-react";

const COMPLETED_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const COMPLETION_DATE_KEYS = [
  "local_completed_at",
  "completed_at",
  "driver_completed_at",
  "completedAt",
  "completed_at_local",
  "driver_completed_at_local",
  "submitted_at",
  "finished_at",
  "updated_at",
  "created_at",
] as const;

const getCompletionDate = (task: any): Date | null => {
  if (!task) return null;
  for (const key of COMPLETION_DATE_KEYS) {
    const rawValue = (task as Record<string, unknown>)[key];
    if (!rawValue) continue;
    if (rawValue instanceof Date) {
      const time = rawValue.getTime();
      if (!Number.isNaN(time)) return rawValue;
      continue;
    }
    if (typeof rawValue === "number") {
      const fromNumber = new Date(rawValue);
      if (!Number.isNaN(fromNumber.getTime())) return fromNumber;
      continue;
    }
    if (typeof rawValue === "string") {
      const parsed = new Date(rawValue);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }
  return null;
};

const normalizeSiteKey = (value: string) => value.trim().toLowerCase();

const toNumberOrNull = (value: unknown): number | null => {
  if (value === undefined || value === null) return null;
  const num = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(num) ? num : null;
};

const getTaskCoordinatePair = (
  task: any,
): { latitude: number; longitude: number } | null => {
  if (!task) return null;
  const latitudeCandidates = [
    task.site_latitude,
    task.latitude,
    task.lat,
    task.siteLatitude,
  ];
  const longitudeCandidates = [
    task.site_longitude,
    task.longitude,
    task.lng,
    task.siteLongitude,
  ];
  let latitude: number | null = null;
  for (const candidate of latitudeCandidates) {
    const numeric = toNumberOrNull(candidate);
    if (numeric !== null) {
      latitude = numeric;
      break;
    }
  }
  let longitude: number | null = null;
  for (const candidate of longitudeCandidates) {
    const numeric = toNumberOrNull(candidate);
    if (numeric !== null) {
      longitude = numeric;
      break;
    }
  }
  if (latitude === null || longitude === null) return null;
  return { latitude, longitude };
};

export default function DriverApp() {
  const [profile, setProfile] = useState<{
    name: string;
    phone: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "active" | "returned">(
    "active",
  );
  const [editOpen, setEditOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
  const siteCacheRef = useRef<
    Record<
      string,
      { latitude: number; longitude: number; siteId: string; siteName: string }
    >
  >({});

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

  const handleFile = async (tag: keyof typeof keyMap, file: File) => {
    const k = keyMap[tag];
    if (file.size > 10 * 1024 * 1024) {
      alert("Max file size is 10MB");
      return;
    }
    setUploading((u) => ({ ...u, [tag]: true }));
    try {
      const dir = `${(profile?.name || "driver").replace(/\s+/g, "_")}/${
        activeTask?.id || "misc"
      }`;
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${dir}/${tag}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from(DRIVER_BUCKET)
        .upload(path, file, {
          upsert: true,
          contentType: file.type || "image/jpeg",
        });
      if (error) {
        alert(`Image upload failed: ${error.message}`);
        return;
      }
      const { data } = supabase.storage.from(DRIVER_BUCKET).getPublicUrl(path);
      const url = data.publicUrl;
      setEntry((s: any) => ({ ...s, [k]: url }));
      setPreviews((prev) => ({ ...prev, [tag]: url }));
    } finally {
      setUploading((u) => ({ ...u, [tag]: false }));
    }
  };

  const ensureTaskHasLocation = useCallback(
    (task: any): any => {
      if (!task) return task;
      const coords = getTaskCoordinatePair(task);
      if (coords) {
        const latMatches =
          toNumberOrNull(task.site_latitude) === coords.latitude;
        const lonMatches =
          toNumberOrNull(task.site_longitude) === coords.longitude;
        if (latMatches && lonMatches) {
          return task;
        }
        return {
          ...task,
          site_latitude: coords.latitude,
          site_longitude: coords.longitude,
        };
      }
      const idValue =
        task?.site_id !== undefined && task?.site_id !== null
          ? String(task.site_id)
          : "";
      const nameValue =
        task?.site_name !== undefined && task?.site_name !== null
          ? String(task.site_name)
          : "";
      const idKey = idValue ? normalizeSiteKey(idValue) : "";
      const nameKey = nameValue ? normalizeSiteKey(nameValue) : "";
      const cached =
        (idKey && siteCacheRef.current[idKey]) ||
        (nameKey && siteCacheRef.current[nameKey]) ||
        null;
      if (!cached) return task;
      const latMatches =
        toNumberOrNull(task.site_latitude) === cached.latitude;
      const lonMatches =
        toNumberOrNull(task.site_longitude) === cached.longitude;
      if (latMatches && lonMatches) return task;
      return {
        ...task,
        site_latitude: cached.latitude,
        site_longitude: cached.longitude,
      };
    },
    [],
  );

  const enrichTasksWithCoordinates = useCallback(
    async (taskList: any[]) => {
      if (!taskList || taskList.length === 0) return taskList;
      const numericSiteIds = new Set<number>();
      const siteNames = new Set<string>();

      const initialTasks = taskList.map((task) => {
        const idValue =
          task?.site_id !== undefined && task?.site_id !== null
            ? String(task.site_id)
            : "";
        const nameValue =
          task?.site_name !== undefined && task?.site_name !== null
            ? String(task.site_name)
            : "";
        const idKey = idValue ? normalizeSiteKey(idValue) : "";
        const nameKey = nameValue ? normalizeSiteKey(nameValue) : "";
        const hasCache =
          (idKey && siteCacheRef.current[idKey]) ||
          (nameKey && siteCacheRef.current[nameKey]);

        if (!hasCache) {
          if (idValue) {
            const numericId = Number(idValue);
            if (!Number.isNaN(numericId)) numericSiteIds.add(numericId);
          }
          if (nameValue) siteNames.add(nameValue);
        }

        return ensureTaskHasLocation(task);
      });

      const queries: Promise<void>[] = [];

      if (numericSiteIds.size > 0) {
        queries.push(
          supabase
            .from("sites")
            .select("id, site_name, latitude, longitude")
            .in("id", Array.from(numericSiteIds))
            .then(({ data, error }) => {
              if (error) {
                console.error("Failed to load site coordinates by id", error);
                return;
              }
              data?.forEach((site: any) => {
                const latitude = toNumberOrNull(site?.latitude);
                const longitude = toNumberOrNull(site?.longitude);
                if (latitude === null || longitude === null) return;
                const entry = {
                  latitude,
                  longitude,
                  siteId: String(site.id ?? ""),
                  siteName: String(site.site_name ?? ""),
                };
                if (site.id !== undefined && site.id !== null) {
                  siteCacheRef.current[normalizeSiteKey(String(site.id))] = entry;
                }
                if (site.site_name) {
                  siteCacheRef.current[normalizeSiteKey(String(site.site_name))] =
                    entry;
                }
              });
            }),
        );
      }

      const siteNameList = Array.from(siteNames).filter(
        (name) => name.trim().length > 0,
      );
      if (siteNameList.length > 0) {
        queries.push(
          supabase
            .from("sites")
            .select("id, site_name, latitude, longitude")
            .in("site_name", siteNameList)
            .then(({ data, error }) => {
              if (error) {
                console.error("Failed to load site coordinates by name", error);
                return;
              }
              data?.forEach((site: any) => {
                const latitude = toNumberOrNull(site?.latitude);
                const longitude = toNumberOrNull(site?.longitude);
                if (latitude === null || longitude === null) return;
                const entry = {
                  latitude,
                  longitude,
                  siteId: String(site.id ?? ""),
                  siteName: String(site.site_name ?? ""),
                };
                if (site.id !== undefined && site.id !== null) {
                  siteCacheRef.current[normalizeSiteKey(String(site.id))] = entry;
                }
                if (site.site_name) {
                  siteCacheRef.current[normalizeSiteKey(String(site.site_name))] =
                    entry;
                }
              });
            }),
        );
      }

      if (queries.length > 0) {
        try {
          await Promise.all(queries);
        } catch (error) {
          console.error("Failed to resolve site coordinates", error);
        }
      }

      return initialTasks.map((task) => ensureTaskHasLocation(task));
    },
    [ensureTaskHasLocation],
  );

  const openDirections = useCallback((task: any) => {
    const coords = getTaskCoordinatePair(task);
    if (!coords) return;
    const destination = `${coords.latitude},${coords.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

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

  const loadTasks = async () => {
    if (!profile || demoMode) return;
    const ors: string[] = [`driver_name.eq.${profile.name}`];
    if (profile.phone && profile.phone.trim())
      ors.push(`driver_phone.eq.${profile.phone}`);
    const { data } = await supabase
      .from("driver_tasks")
      .select("*")
      .or(ors.join(","))
      .order("scheduled_at", { ascending: true });
    const incoming = data || [];
    const now = Date.now();
    const nextTasks: any[] = [];
    for (const task of incoming) {
      if (task?.status === "completed") {
        const completionDate = getCompletionDate(task);
        if (
          completionDate &&
          now - completionDate.getTime() > COMPLETED_RETENTION_MS
        ) {
          continue;
        }
        if (!task.local_completed_at && completionDate) {
          nextTasks.push({
            ...task,
            local_completed_at: completionDate.toISOString(),
          });
          continue;
        }
      }
      nextTasks.push(task);
    }
    let enrichedTasks = nextTasks;
    try {
      enrichedTasks = await enrichTasksWithCoordinates(nextTasks);
    } catch (error) {
      console.error("Failed to enrich tasks with site coordinates", error);
    }
    setTasks(enrichedTasks);
  };

  useEffect(() => {
    loadTasks();
    if (profile && !demoMode) {
      loadNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, demoMode]);

  const activeCount = useMemo(
    () => tasks.filter((t) => t.status === "in_progress").length,
    [tasks],
  );
  const pendingCount = useMemo(
    () => tasks.filter((t) => t.status === "pending").length,
    [tasks],
  );
  const returnedCount = useMemo(
    () =>
      tasks.filter((t) => t.admin_status === "Task returned to the driver")
        .length,
    [tasks],
  );
  const openCount = useMemo(
    () => tasks.filter((t) => t.status !== "completed").length,
    [tasks],
  );
  const activeTotal = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.status !== "completed" &&
          t.admin_status !== "Task returned to the driver",
      ).length,
    [tasks],
  );

  const loadNotifications = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("driver_notifications")
      .select("id, created_at, title, message, driver_name, sent_by")
      .or(`driver_name.is.null,driver_name.eq.${profile.name}`)
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifications(data || []);
    const ids = (data || []).map((n: any) => n.id);
    if (ids.length === 0) {
      setUnreadCount(0);
      return;
    }
    const { data: reads } = await supabase
      .from("driver_notification_reads")
      .select("notification_id")
      .eq("driver_name", profile.name)
      .in("notification_id", ids);
    const readSet = new Set((reads || []).map((r: any) => r.notification_id));
    const unread = ids.filter((id: number) => !readSet.has(id)).length;
    setUnreadCount(unread);
  };

  const filtered = useMemo(() => {
    let base = tasks.filter((t) => t.status !== "completed");
    if (filterMode === "active")
      base = base.filter(
        (t) => t.status === "in_progress" || t.status === "pending",
      );
    if (filterMode === "returned")
      base = base.filter(
        (t) => t.admin_status === "Task returned to the driver",
      );
    if (!query) return base;
    const q = query.toLowerCase();
    return base.filter((t) =>
      [t.site_name, t.status, t.notes].some((v: any) =>
        String(v || "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [tasks, query, filterMode]);

  const recentCompletedTasks = useMemo(() => {
    const now = Date.now();
    return tasks
      .filter((task) => task.status === "completed")
      .map((task) => {
        const completionDate =
          getCompletionDate(task) ||
          (task.local_completed_at ? new Date(task.local_completed_at) : null);
        if (!completionDate || Number.isNaN(completionDate.getTime())) {
          return null;
        }
        return { task, completionDate };
      })
      .filter(
        (
          entry,
        ): entry is {
          task: any;
          completionDate: Date;
        } => {
          if (!entry) return false;
          return now - entry.completionDate.getTime() <= COMPLETED_RETENTION_MS;
        },
      )
      .sort((a, b) => b.completionDate.getTime() - a.completionDate.getTime());
  }, [tasks]);

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
    const completedAtIso = new Date().toISOString();
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
    const { error } = await supabase
      .from("driver_tasks")
      .update({
        status: "completed",
        notes: entry.notes || null,
        completed_at: completedAtIso,
      })
      .eq("id", activeTask.id);
    if (error) {
      await supabase
        .from("driver_tasks")
        .update({ status: "completed", notes: entry.notes || null })
        .eq("id", activeTask.id);
    }
    setTasks((arr) => {
      const now = Date.now();
      return arr
        .map((task) =>
          task.id === activeTask.id
            ? {
                ...task,
                status: "completed",
                notes: entry.notes || null,
                local_completed_at: completedAtIso,
              }
            : task,
        )
        .filter((task) => {
          if (task.status !== "completed") return true;
          const completionDate =
            getCompletionDate(task) ||
            (task.local_completed_at
              ? new Date(task.local_completed_at)
              : null);
          if (!completionDate) return true;
          return now - completionDate.getTime() <= COMPLETED_RETENTION_MS;
        });
    });
    setEditOpen(false);
    setActiveTask(null);
  };

  const getStatusBadge = (task: any) => {
    if (task.admin_status === "Task returned to the driver") {
      return {
        label: "Returned",
        className: "bg-[#FDE8EA] text-[#E52329]",
      };
    }

    switch (task.status) {
      case "in_progress":
        return {
          label: "In Progress",
          className: "bg-[#202B6D] text-white",
        };
      case "completed":
        return {
          label: "Completed",
          className: "bg-[#1F9254] text-white",
        };
      case "failed":
      case "issue":
        return {
          label: "Issue",
          className: "bg-[#E52329] text-white",
        };
      case "pending":
      default:
        return {
          label: "Pending",
          className: "bg-[#E6E9F5] text-[#202B6D]",
        };
    }
  };

  const filterOptions: { key: "active" | "returned" | "all"; label: string }[] =
    [
      { key: "active", label: "Active task" },
      { key: "returned", label: "Returned tasks" },
      { key: "all", label: "All tasks" },
    ];

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F5F7] px-5 py-12">
        <div className="w-full max-w-sm space-y-9">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fbd65b3cd7a86452e803a3d7dc7a3d048%2F814626a817d74d5ca3f778646a798206?format=png&width=256"
                alt="ACES logo"
                className="h-12 w-auto"
                loading="lazy"
                decoding="async"
              />
            </div>
            <h1 className="text-3xl font-bold text-[#202B6D]">Driver App</h1>
            <p className="text-sm text-[#6B7280]">
              Sign in with your assigned credentials to access fueling tasks.
            </p>
          </div>
          <Card className="rounded-2xl border border-[#D1D5DB] bg-white shadow-[0_20px_45px_rgba(32,43,109,0.12)]">
            <CardContent className="space-y-6 p-7">
              <div className="space-y-2 text-left">
                <Label
                  htmlFor="name"
                  className="flex items-center gap-1 text-sm font-semibold text-[#111827]"
                >
                  Username
                  <span className="text-[#E52329]">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter username"
                  className="h-12 rounded-xl border border-[#D1D5DB] bg-white text-base text-[#111827] placeholder:text-[#6B7280] focus-visible:border-[#202B6D] focus-visible:ring-2 focus-visible:ring-[#202B6D]/30 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label
                  htmlFor="pw"
                  className="flex items-center gap-1 text-sm font-semibold text-[#111827]"
                >
                  Password
                  <span className="text-[#E52329]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="pw"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="h-12 rounded-xl border border-[#D1D5DB] bg-white pr-12 text-base text-[#111827] placeholder:text-[#6B7280] focus-visible:border-[#202B6D] focus-visible:ring-2 focus-visible:ring-[#202B6D]/30 focus-visible:ring-offset-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-[#6B7280] transition hover:text-[#202B6D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202B6D]/30 focus-visible:ring-offset-0"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
              {errorMsg && (
                <div
                  className="rounded-xl border border-[#F4A5A8] bg-[#FDE8EA] px-3 py-2 text-sm font-semibold text-[#E52329]"
                  role="alert"
                >
                  {errorMsg}
                </div>
              )}
              <Button
                className="h-12 w-full rounded-xl bg-[#202B6D] text-base font-bold uppercase tracking-wide text-white shadow-md shadow-[#202B6D]/20 transition hover:bg-[#1A2358] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202B6D]/35 focus-visible:ring-offset-0 disabled:bg-[#202B6D]/60"
                onClick={verifyPassword}
                disabled={verifying}
              >
                {verifying ? "Checking..." : "Login"}
              </Button>
            </CardContent>
          </Card>
          <p className="text-center text-xs text-[#6B7280]">
            Powered by{" "}
            <span className="font-semibold text-[#202B6D]">ACES MSD</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] px-4 py-6">
      <div className="mx-auto w-full max-w-2xl space-y-6 pb-12">
        <header className="rounded-3xl border border-[#D1D5DB] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fbd65b3cd7a86452e803a3d7dc7a3d048%2F814626a817d74d5ca3f778646a798206?format=png&width=256"
                alt="ACES logo"
                className="h-8 w-auto"
                loading="eager"
                decoding="async"
              />
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6B7280]">
                  Signed in as
                </p>
                <p className="text-lg font-semibold text-[#111827]">
                  {profile.name}
                </p>
                {profile.phone ? (
                  <p className="text-xs text-[#6B7280]">{profile.phone}</p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notifications"
                  className="h-10 w-10 rounded-full border border-[#D1D5DB] bg-white text-[#111827] shadow-sm transition hover:bg-[#F4F5F7]"
                  onClick={async () => {
                    await loadNotifications();
                    const ids = (notifications || []).map((n) => n.id);
                    if (ids.length > 0) {
                      const rows = ids.map((id) => ({
                        notification_id: id,
                        driver_name: profile.name,
                      }));
                      await supabase
                        .from("driver_notification_reads")
                        .upsert(rows, {
                          onConflict: "notification_id,driver_name",
                        } as any);
                      setUnreadCount(0);
                    }
                    setNotifOpen(true);
                  }}
                >
                  <Bell className="h-5 w-5" />
                </Button>
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#E52329] px-1 text-center text-[11px] font-semibold leading-4 text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                className="rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-semibold text-[#202B6D] shadow-sm transition hover:bg-[#F4F5F7]"
                onClick={loadTasks}
              >
                Refresh
              </Button>
              <Button
                variant="ghost"
                className="rounded-full border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-semibold text-[#E52329] shadow-sm transition hover:bg-[#FDE8EA]"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks"
              className="h-11 rounded-xl border border-[#D1D5DB] bg-white text-sm text-[#111827] placeholder:text-[#6B7280] focus-visible:border-[#202B6D] focus-visible:ring-2 focus-visible:ring-[#202B6D]/30 focus-visible:ring-offset-0"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {filterOptions.map((option) => {
              const isActive = filterMode === option.key;
              const count =
                option.key === "active"
                  ? activeTotal
                  : option.key === "returned"
                    ? returnedCount
                    : openCount;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    setFilterMode(option.key);
                    void loadTasks();
                  }}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#202B6D]/30 ${
                    isActive
                      ? "border border-transparent bg-[#202B6D] text-white shadow"
                      : "border border-[#D1D5DB] bg-white text-[#111827] hover:border-[#202B6D] hover:text-[#202B6D]"
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="ml-1 text-xs font-semibold text-[#6B7280]">
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        <section className="space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#202B6D]/30 bg-white p-10 text-center text-sm text-[#6B7280]">
              {filterMode === "returned"
                ? "No returned tasks at the moment."
                : "No tasks found for this filter."}
            </div>
          ) : (
            filtered.map((t) => {
              const badge = getStatusBadge(t);
              return (
                <div
                  key={t.id}
                  className="rounded-2xl border border-[#D1D5DB] bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-[#6B7280]">
                        {new Date(
                          t.scheduled_at || Date.now(),
                        ).toLocaleString()}
                      </p>
                      <h2 className="text-lg font-semibold text-[#111827]">
                        {t.site_name || "Unnamed Site"}
                      </h2>
                      <p className="text-sm text-[#6B7280]">
                        Driver: {t.driver_name || profile.name}
                      </p>
                    </div>
                    <span
                      className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-[#111827]">
                    <p>
                      <span className="font-semibold text-[#6B7280]">
                        Required Liters:
                      </span>{" "}
                      {t.required_liters ?? "-"}
                    </p>
                    <p>
                      <span className="font-semibold text-[#6B7280]">
                        Notes:
                      </span>{" "}
                      {t.notes && t.notes.trim() ? t.notes : "-"}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-end gap-2">
                    {t.status === "pending" && (
                      <Button
                        className="rounded-xl bg-[#202B6D] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1A2358]"
                        onClick={() => startTask(t)}
                      >
                        Start
                      </Button>
                    )}
                    {t.status !== "completed" && (
                      <Button
                        className="rounded-xl bg-[#E52329] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#C41D25]"
                        onClick={() => openComplete(t)}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>

        {recentCompletedTasks.length > 0 && (
          <section className="space-y-4 rounded-3xl border border-[#D1D5DB] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#202B6D]">
                  Submitted this week
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Completed tasks stay visible for 7 days and are read-only.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {recentCompletedTasks.map(({ task, completionDate }) => {
                const badge = getStatusBadge(task);
                return (
                  <div
                    key={`submitted-${task.id}`}
                    className="rounded-2xl border border-[#D1D5DB] bg-[#F9FAFC] p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-[#6B7280]">
                          Submitted on {completionDate.toLocaleString()}
                        </p>
                        <h3 className="text-lg font-semibold text-[#111827]">
                          {task.site_name || "Unnamed Site"}
                        </h3>
                        <p className="text-sm text-[#6B7280]">
                          Driver: {task.driver_name || profile?.name}
                        </p>
                      </div>
                      <span
                        className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-[#111827]">
                      <p>
                        <span className="font-semibold text-[#6B7280]">
                          Required Liters:
                        </span>{" "}
                        {task.required_liters ?? "-"}
                      </p>
                      <p>
                        <span className="font-semibold text-[#6B7280]">
                          Notes:
                        </span>{" "}
                        {task.notes && task.notes.trim() ? task.notes : "-"}
                      </p>
                    </div>
                    <p className="mt-4 text-xs text-[#6B7280]">
                      This record cannot be edited and will be removed
                      automatically after seven days.
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No notifications
              </div>
            )}
            {notifications.map((n) => (
              <Card key={n.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{n.title}</div>
                      <div className="whitespace-pre-line text-sm text-muted-foreground">
                        {n.message}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="site_id">Site ID</Label>
                <Input id="site_id" value={entry.site_id} readOnly disabled />
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
                <Label htmlFor="actual_liters_in_tank">
                  Actual Liters in Tank
                </Label>
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
                  <div className="text-xs text-muted-foreground">
                    Uploading...
                  </div>
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
                  <div className="text-xs text-muted-foreground">
                    Uploading...
                  </div>
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
                  <div className="text-xs text-muted-foreground">
                    Uploading...
                  </div>
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
                  <div className="text-xs text-muted-foreground">
                    Uploading...
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Remarks</Label>
              <Textarea
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
            <Button onClick={saveCompletion}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
