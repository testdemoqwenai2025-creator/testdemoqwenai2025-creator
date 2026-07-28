import { NextResponse } from "next/server";
import { getObservabilityData, cacheHeaders } from "@/lib/observability-data";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export async function GET() {
  try {
    const data = getObservabilityData();
    const servedAt = new Date().toISOString();
    return NextResponse.json(
      {
        topology: (data.data as Record<string, unknown>).agentTopology,
        architecture: data.architecture,
        statistics: { agents: (data.statistics as Record<string, unknown>).agents },
        servedAt,
      },
      { headers: cacheHeaders(servedAt) },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load agent topology";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
