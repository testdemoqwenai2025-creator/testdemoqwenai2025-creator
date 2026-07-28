import { NextResponse } from "next/server";
import { getObservabilityData, cacheHeaders } from "@/lib/observability-data";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export async function GET() {
  try {
    const data = getObservabilityData();
    const servedAt = new Date().toISOString();
    const d = data.data as Record<string, unknown>;
    const s = data.statistics as Record<string, unknown>;
    return NextResponse.json(
      {
        logs: d.logs,
        statistics: {
          totalLogs: s.totalLogs,
          errorLogs: s.errorLogs,
        },
        servedAt,
      },
      { headers: cacheHeaders(servedAt) },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load logs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
