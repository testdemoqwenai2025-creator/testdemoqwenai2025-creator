import { NextResponse } from "next/server";
import { getObservabilityData, cacheHeaders } from "@/lib/observability-data";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export async function GET() {
  try {
    const data = getObservabilityData();
    const servedAt = new Date().toISOString();
    const d = data.data as Record<string, unknown>;
    const conflicts = d.conflicts as Record<string, unknown>;
    return NextResponse.json(
      {
        conflicts,
        statistics: {
          totalDetected: conflicts?.total_detected ?? 0,
          totalResolved: conflicts?.total_resolved ?? 0,
          totalPending: conflicts?.total_pending ?? 0,
        },
        servedAt,
      },
      { headers: cacheHeaders(servedAt) },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load conflicts data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
