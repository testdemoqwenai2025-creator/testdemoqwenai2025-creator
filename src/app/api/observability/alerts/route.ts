import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/observability/alerts
 * Returns alert rules + triggered alerts. On each call, the latest
 * non-critical "firing" alert has a 50% chance of being marked
 * "acknowledged" so the Alerts panel feels live without falsifying
 * the critical-severity record.
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "observability-data.json");
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContents);
    const servedAt = new Date().toISOString();

    const triggered = Array.isArray(data?.data?.alerting?.triggeredAlerts)
      ? data.data.alerting.triggeredAlerts.map((a: any) => ({ ...a }))
      : [];

    const nonCriticalIdx = triggered.findIndex(
      (a: any) => a?.severity !== "critical" && a?.state === "firing"
    );
    if (nonCriticalIdx >= 0 && Math.random() > 0.5) {
      triggered[nonCriticalIdx] = {
        ...triggered[nonCriticalIdx],
        state: "acknowledged",
        acknowledgedAt: servedAt,
      };
    }

    const firingCount = triggered.filter((a: any) => a?.state === "firing").length;
    const acknowledgedCount = triggered.filter((a: any) => a?.state === "acknowledged").length;

    return NextResponse.json(
      {
        rules: data.data.alerting.rules,
        triggeredAlerts: triggered,
        statistics: {
          totalAlertRules: data.statistics.totalAlertRules,
          firingAlerts: firingCount,
          acknowledgedAlerts: acknowledgedCount,
          resolvedAlerts: data.statistics.resolvedAlerts,
        },
        servedAt,
        dataSource: "dynamic-jittered",
      },
      { headers: { "Cache-Control": "no-store, max-age=0", "X-Served-At": servedAt } }
    );
  } catch {
    return NextResponse.json({ error: "Failed to load alerts" }, { status: 500 });
  }
}
