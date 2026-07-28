import { NextResponse } from "next/server";
import { getObservabilityData, cacheHeaders } from "@/lib/observability-data";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";


// ── Cyclic alert state machine (shared with main route) ──────────────
const ALERT_CYCLE = ["firing", "acknowledged", "resolved"] as const;
type AlertState = (typeof ALERT_CYCLE)[number];

function rotateAlertState(alertIndex: number, currentMinute: number): AlertState {
  const phase = Math.floor(currentMinute / 10) + alertIndex;
  return ALERT_CYCLE[phase % ALERT_CYCLE.length];
}

interface TriggeredAlert {
  severity: string;
  state: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

/**
 * GET /api/observability/alerts
 *
 * Returns alert rules + triggered alerts with cyclic state rotation.
 * Non-critical alerts cycle through firing → acknowledged → resolved → firing
 * on a 10-minute wall-clock basis, keeping the panel perpetually alive.
 */
export async function GET() {
  try {
    const data = getObservabilityData();
    const servedAt = new Date().toISOString();
    const d = data.data as Record<string, unknown>;
    const alerting = d.alerting as { rules: unknown[]; triggeredAlerts: TriggeredAlert[] } | undefined;

    const triggered: TriggeredAlert[] = Array.isArray(alerting?.triggeredAlerts)
      ? alerting.triggeredAlerts.map((a) => ({ ...a }))
      : [];

    const minute = new Date().getMinutes();
    for (let i = 0; i < triggered.length; i++) {
      const alert = triggered[i];
      if (alert.severity === "critical") continue;
      const newState = rotateAlertState(i, minute);
      if (newState !== alert.state) {
        alert.state = newState;
        if (newState === "acknowledged") alert.acknowledgedAt = servedAt;
        if (newState === "resolved") alert.resolvedAt = servedAt;
        if (newState === "firing") {
          delete alert.acknowledgedAt;
          delete alert.resolvedAt;
        }
      }
    }

    const firingCount = triggered.filter((a) => a.state === "firing").length;
    const acknowledgedCount = triggered.filter((a) => a.state === "acknowledged").length;
    const resolvedCount = triggered.filter((a) => a.state === "resolved").length;

    return NextResponse.json(
      {
        rules: alerting?.rules ?? [],
        triggeredAlerts: triggered,
        statistics: {
          totalAlertRules: (data.statistics as Record<string, unknown>).totalAlertRules ?? triggered.length,
          firingAlerts: firingCount,
          acknowledgedAlerts: acknowledgedCount,
          resolvedAlerts: resolvedCount,
        },
        servedAt,
        dataSource: "dynamic-jittered",
      },
      { headers: cacheHeaders(servedAt) },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load alerts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
