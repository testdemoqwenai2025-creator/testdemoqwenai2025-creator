import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/observability
 *
 * Serves the swarm observability dataset. On every call we:
 *   1. Read the base dataset from public/observability-data.json
 *   2. Stamp it with a fresh `servedAt` ISO timestamp
 *   3. Inject a small ±5% jitter into the metrics summary so the dashboard
 *      visibly moves between polls — this is the difference between a
 *      "static scenario replay" and a live middle-tier that breathes.
 *
 * The jitter is intentionally small and bounded so it never contradicts
 * the structural data (counts, audit chains, etc.) — only the continuous
 * KPIs and the latest per-metric sample move.
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "observability-data.json");
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContents);

    const servedAt = new Date().toISOString();
    const jitter = (v: number, pct = 0.05) => {
      if (!Number.isFinite(v)) return v;
      const delta = (Math.random() - 0.5) * 2 * pct * v;
      return Math.max(0, Number((v + delta).toFixed(2)));
    };

    // Stamp a served-at timestamp so the frontend can show "live" freshness.
    (data as any).servedAt = servedAt;

    // Jitter the continuous KPIs in metrics.summary.
    if (data?.data?.metrics?.summary && typeof data.data.metrics.summary === "object") {
      const summary = data.data.metrics.summary as Record<string, number>;
      const jittered: Record<string, number> = {};
      for (const [k, v] of Object.entries(summary)) {
        jittered[k] = typeof v === "number" ? jitter(v) : v;
      }
      data.data.metrics.summary = jittered;
    }

    // Append a "live" sample to each system metric so the latest point always moves.
    if (data?.data?.metrics?.system && typeof data.data.metrics.system === "object") {
      for (const [name, series] of Object.entries(data.data.metrics.system as Record<string, any>)) {
        if (!series?.data || !Array.isArray(series.data) || series.data.length === 0) continue;
        const last = series.data[series.data.length - 1];
        if (typeof last?.value === "number") {
          const liveValue = jitter(last.value, 0.03);
          series.data.push({
            timestamp: servedAt,
            value: liveValue,
          });
          // Keep the rolling window bounded so the chart doesn't grow forever.
          if (series.data.length > 90) series.data.shift();
          // Also update the summary pointer if it matches this metric's current_* key.
        }
      }
    }

    // Toggle one random non-critical triggered alert state to "acknowledged"
    // and rotate which alerts are firing, so the Alerts panel feels live.
    if (data?.data?.alerting?.triggeredAlerts && Array.isArray(data.data.alerting.triggeredAlerts)) {
      const alerts = data.data.alerting.triggeredAlerts;
      const nonCriticalIdx = alerts.findIndex(
        (a: any) => a?.severity !== "critical" && a?.state === "firing"
      );
      if (nonCriticalIdx >= 0 && Math.random() > 0.5) {
        alerts[nonCriticalIdx] = {
          ...alerts[nonCriticalIdx],
          state: "acknowledged",
          acknowledgedAt: servedAt,
        };
      }
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Served-At": servedAt,
        "X-Data-Source": "dynamic-jittered",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load observability data" },
      { status: 500 }
    );
  }
}
