import { NextResponse } from "next/server";
import { getObservabilityData, cacheHeaders } from "@/lib/observability-data";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export async function GET() {
  try {
    const data = getObservabilityData();
    const servedAt = new Date().toISOString();
    const d = data.data as Record<string, unknown>;
    const eventBus = d.eventBus as Record<string, unknown>;
    const conflicts = d.conflicts as Record<string, unknown>;
    return NextResponse.json(
      {
        eventBus,
        conflicts,
        statistics: {
          eventBusTopics: eventBus?.total_topics ?? 0,
          eventBusMessages: eventBus?.total_messages ?? 0,
          eventBusLag: eventBus?.total_lag ?? 0,
          conflictsDetected: conflicts?.total_detected ?? 0,
          conflictsResolved: conflicts?.total_resolved ?? 0,
          conflictsPending: conflicts?.total_pending ?? 0,
        },
        servedAt,
      },
      { headers: cacheHeaders(servedAt) },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load orchestration data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
