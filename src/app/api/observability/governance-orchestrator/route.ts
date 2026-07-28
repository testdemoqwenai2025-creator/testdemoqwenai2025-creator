import { NextResponse } from "next/server";
import { getObservabilityData, cacheHeaders } from "@/lib/observability-data";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export async function GET() {
  try {
    const data = getObservabilityData();
    const servedAt = new Date().toISOString();
    const d = data.data as Record<string, unknown>;
    const gov = d.governanceOrchestrator as Record<string, unknown>;
    const s = data.statistics as Record<string, unknown>;
    return NextResponse.json(
      {
        governanceOrchestrator: gov,
        statistics: {
          components: s.governanceComponents ?? (Array.isArray(gov?.components) ? gov.components.length : 0),
          events: s.governanceEvents ?? gov?.total_events ?? 0,
          auditEntries: s.governanceAuditEntries ?? 0,
          escalations: s.governanceEscalations ?? 0,
          breachAlerts: s.governanceBreachAlerts ?? 0,
          provenanceSteps: s.governanceProvenanceSteps ?? 0,
          syntheticPatients: s.governanceSyntheticPatients ?? 0,
          drSnapshots: s.governanceDrSnapshots ?? 0,
        },
        servedAt,
      },
      { headers: cacheHeaders(servedAt) },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load HIPAA governance orchestrator data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
