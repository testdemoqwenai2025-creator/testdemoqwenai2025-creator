import { NextResponse } from "next/server";
import { getObservabilityData, cacheHeaders } from "@/lib/observability-data";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export async function GET() {
  try {
    const data = getObservabilityData();
    const servedAt = new Date().toISOString();
    const d = data.data as Record<string, unknown>;
    const sm = d.stateMachine as Record<string, unknown>;
    const metrics = (sm?.metrics as Record<string, unknown>) ?? {};
    return NextResponse.json(
      {
        ...sm,
        statistics: {
          entities: Array.isArray(sm?.entities) ? sm.entities.length : 0,
          totalTransitions: sm.total_transitions ?? 0,
          escalations: metrics.escalations ?? 0,
          resolutions: metrics.resolutions ?? 0,
          distribution: sm.state_distribution ?? {},
        },
        servedAt,
      },
      { headers: cacheHeaders(servedAt) },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load state machine data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
