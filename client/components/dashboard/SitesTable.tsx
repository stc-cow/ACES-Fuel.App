import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchPublishedSheetRows } from "@/lib/sheets";
import { supabase } from "@/lib/supabase";

export type SiteRow = {
  siteName: string;
  vendor: string;
  region: string;
  district: string;
  city: string;
  cowStatus: string;
  latitude: string;
  longitude: string;
  powerSource: string;
};

const COLS = {
  siteName: 1, // B
  vendor: 2, // C
  region: 3, // D
  district: 4, // E
  city: 5, // F
  powerSource: 6, // G
  cowStatus: 9, // J
  latitude: 11, // L
  longitude: 12, // M
} as const;

export function SitesTable({ sourceUrl, limit }: { sourceUrl: string; limit?: number }) {
  const { t } = useI18n();
  const [rows, setRows] = useState<SiteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPublishedSheetRows(sourceUrl)
      .then((data) => {
        if (cancelled) return;
        const mapped: SiteRow[] = [];
        for (let i = 1; i < data.length; i++) { // skip header row
          const r = data[i];
          if (!r || r.length === 0) continue;
          const siteName = (r[COLS.siteName] || "").trim();
          const vendor = (r[COLS.vendor] || "").trim();
          const region = (r[COLS.region] || "").trim();
          const district = (r[COLS.district] || "").trim();
          const city = (r[COLS.city] || "").trim();
          const cowStatus = (r[COLS.cowStatus] || "").trim();
          const latitude = (r[COLS.latitude] || "").trim();
          const longitude = (r[COLS.longitude] || "").trim();
          const powerSource = (r[COLS.powerSource] || "").trim();
          if (!siteName && !vendor && !region && !district && !city) continue;
          mapped.push({ siteName, vendor, region, district, city, cowStatus, latitude, longitude, powerSource });
        }
        setRows(limit ? mapped.slice(0, limit) : mapped);
      })
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sourceUrl, limit]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-6 pt-6 text-base font-medium">{t("sitesOverview")}</div>
        <Table>
          <TableHeader>
            <TableRow className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]">
              <TableHead className="text-white">{t("siteName")}</TableHead>
              <TableHead className="text-white">{t("vendor")}</TableHead>
              <TableHead className="text-white">{t("region")}</TableHead>
              <TableHead className="text-white">{t("district")}</TableHead>
              <TableHead className="text-white">{t("city")}</TableHead>
              <TableHead className="text-white">{t("cowStatus")}</TableHead>
              <TableHead className="text-white">{t("latitude")}</TableHead>
              <TableHead className="text-white">{t("longitude")}</TableHead>
              <TableHead className="text-white">{t("powerSource")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-muted-foreground">
                  {t("loading")}
                </TableCell>
              </TableRow>
            )}
            {!loading && error && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-destructive">
                  {t("failedToLoad")}
                </TableCell>
              </TableRow>
            )}
            {!loading && !error && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-muted-foreground">
                  {t("noDataYet")}
                </TableCell>
              </TableRow>
            )}
            {!loading && !error && rows.map((r, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{r.siteName}</TableCell>
                <TableCell>{r.vendor}</TableCell>
                <TableCell>{r.region}</TableCell>
                <TableCell>{r.district}</TableCell>
                <TableCell>{r.city}</TableCell>
                <TableCell>{r.cowStatus}</TableCell>
                <TableCell>{r.latitude}</TableCell>
                <TableCell>{r.longitude}</TableCell>
                <TableCell>{r.powerSource}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
