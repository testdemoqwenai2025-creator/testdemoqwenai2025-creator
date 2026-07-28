import { NextResponse } from "next/server";
import { getObservabilityData, cacheHeaders } from "@/lib/observability-data";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";


interface Violation {
  penalty_exposure_usd?: number;
  phase_i_conflict?: boolean;
  phase_ii_breach?: boolean;
}

export async function GET() {
  try {
    const data = getObservabilityData();
    const servedAt = new Date().toISOString();
    const d = data.data as Record<string, unknown>;
    const violations = (d.violations as Violation[]) ?? [];
    const totalExposure = violations.reduce(
      (sum, v) => sum + (typeof v.penalty_exposure_usd === "number" ? v.penalty_exposure_usd : 0),
      0,
    );
    return NextResponse.json(
      {
        violations,
        statistics: {
          totalViolations: violations.length,
          totalPenaltyExposureUsd: totalExposure,
          phaseIConflicts: violations.filter((v) => v.phase_i_conflict).length,
          phaseIIBreaches: violations.filter((v) => v.phase_ii_breach).length,
        },
        servedAt,
      },
      { headers: cacheHeaders(servedAt) },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load violations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
