import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/observability/metrics
 * Returns swarm metrics with a small per-load jitter on the continuous KPIs
 * and a fresh "live" sample appended to each metric series, so the charts
 * visibly tick between polls.
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "observability-data.json");
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContents);
    const metrics = data.data.metrics;

    const servedAt = new Date().toISOString();
    const jitter = (v: number, pct = 0.05) => {
      if (!Number.isFinite(v)) return v;
      const delta = (Math.random() - 0.5) * 2 * pct * v;
      return Math.max(0, Number((v + delta).toFixed(2)));
    };

    if (metrics?.summary && typeof metrics.summary === "object") {
      const summary = metrics.summary as Record<string, number>;
      const jittered: Record<string, number> = {};
      for (const [k, v] of Object.entries(summary)) {
        jittered[k] = typeof v === "number" ? jitter(v) : v;
      }
      metrics.summary = jittered;
    }

    if (metrics?.system && typeof metrics.system === "object") {
      for (const [, series] of Object.entries(metrics.system as Record<string, any>)) {
        if (!series?.data || !Array.isArray(series.data) || series.data.length === 0) continue;
        const last = series.data[series.data.length - 1];
        if (typeof last?.value === "number") {
          series.data.push({ timestamp: servedAt, value: jitter(last.value, 0.03) });
          if (series.data.length > 90) series.data.shift();
        }
      }
    }

    return NextResponse.json(
      { ...metrics, servedAt, dataSource: "dynamic-jittered" },
      { headers: { "Cache-Control": "no-store, max-age=0", "X-Served-At": servedAt } }
    );
  } catch {
    return NextResponse.json({ error: "Failed to load metrics" }, { status: 500 });
  }
}
