import { NextResponse } from "next/server";
import { getObservabilityData, cacheHeaders, jitter } from "@/lib/observability-data";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";


/**
 * GET /api/observability/metrics
 *
 * Returns swarm metrics with a small per-load jitter on the continuous KPIs
 * and a fresh "live" sample appended to each metric series, so the charts
 * visibly tick between polls.
 *
 * Uses the shared jitter() from observability-data.ts for coherence with
 * the main /api/observability route.
 */
export async function GET() {
  try {
    const data = getObservabilityData();
    const servedAt = new Date().toISOString();
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

    if (metrics?.system && typeof metrics.system === "object") {
      for (const series of Object.values(metrics.system)) {
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
      { headers: cacheHeaders(servedAt) },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load metrics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
