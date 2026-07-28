import { NextResponse } from "next/server";
import { getObservabilityData, cacheHeaders, jitter } from "@/lib/observability-data";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";


// ── Cyclic alert state machine ──────────────────────────────────────────
// Instead of irreversibly drifting all non-critical alerts to "acknowledged",
// we rotate states in a cycle: firing → acknowledged → resolved → firing.
// The rotation key is `(floor(minute / 10) % 3)` so the cycle advances
// every ~10 minutes of wall-clock time, keeping the panel perpetually alive.

const ALERT_CYCLE = ["firing", "acknowledged", "resolved"] as const;
type AlertState = (typeof ALERT_CYCLE)[number];

function rotateAlertState(alertIndex: number, currentMinute: number): AlertState {
  const phase = Math.floor(currentMinute / 10) + alertIndex;
  return ALERT_CYCLE[phase % ALERT_CYCLE.length];
}

/**
 * GET /api/observability
 *
 * Serves the swarm observability dataset. On every call we:
 *   1. Read the base dataset from public/observability-data.json
 *   2. Stamp it with a fresh `servedAt` ISO timestamp
 *   3. Inject ±5% jitter into the metrics summary so KPI cards visibly move
 *   4. Append a live sample to each system metric series
 *   5. Rotate non-critical alert states on a 10-minute cycle
 */
export async function GET() {
  try {
    const data = getObservabilityData();
    const servedAt = new Date().toISOString();

    // Stamp a served-at timestamp so the frontend can show "live" freshness.
    (data as Record<string, unknown>).servedAt = servedAt;

    // Jitter the continuous KPIs in metrics.summary.
    const metrics = (data.data as Record<string, unknown>).metrics as
      | { summary: Record<string, number>; system: Record<string, { data: { timestamp: string; value: number }[] }> }
      | undefined;

    if (metrics?.summary && typeof metrics.summary === "object") {
      const jittered: Record<string, number> = {};
      for (const [k, v] of Object.entries(metrics.summary)) {
        jittered[k] = typeof v === "number" ? jitter(v) : v;
      }
      metrics.summary = jittered;
    }

    // Append a "live" sample to each system metric series.
    if (metrics?.system && typeof metrics.system === "object") {
      for (const series of Object.values(metrics.system)) {
        if (!series?.data || !Array.isArray(series.data) || series.data.length === 0) continue;
        const last = series.data[series.data.length - 1];
        if (typeof last?.value === "number") {
          series.data.push({
            timestamp: servedAt,
            value: jitter(last.value, 0.03),
          });
          // Keep the rolling window bounded so the chart doesn't grow forever.
          if (series.data.length > 90) series.data.shift();
        }
      }
    }

    // Cyclic alert state rotation (non-critical alerts cycle every ~10 minutes).
    const alerting = (data.data as Record<string, unknown>).alerting as
      | { rules: unknown[]; triggeredAlerts: { severity: string; state: string; acknowledgedAt?: string; resolvedAt?: string }[] }
      | undefined;

    if (alerting?.triggeredAlerts && Array.isArray(alerting.triggeredAlerts)) {
      const minute = new Date().getMinutes();
      for (let i = 0; i < alerting.triggeredAlerts.length; i++) {
        const alert = alerting.triggeredAlerts[i];
        if (alert.severity === "critical") continue; // never rotate critical alerts
        const newState = rotateAlertState(i, minute);
        if (newState !== alert.state) {
          alert.state = newState;
          if (newState === "acknowledged") alert.acknowledgedAt = servedAt;
          if (newState === "resolved") alert.resolvedAt = servedAt;
          if (newState === "firing") {
            // Clear resolved/acknowledged timestamps when re-firing
            delete alert.acknowledgedAt;
            delete alert.resolvedAt;
          }
        }
      }
    }

    return NextResponse.json(data, {
      headers: cacheHeaders(servedAt),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load observability data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
