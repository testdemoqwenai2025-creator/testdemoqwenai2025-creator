import { NextResponse } from "next/server";
import { getObservabilityData, cacheHeaders, jitter } from "@/lib/observability-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/observability/compliance-score
 *
 * Returns the Stage 9 compliance scoring data:
 * - Overall composite score (weighted across 7 frameworks)
 * - Per-framework scores with dimension breakdown
 * - 30-day historical trend
 * - Cross-framework risk matrix
 *
 * The overall composite score is jittered ±3% per call so the
 * dashboard gauge visibly moves between polls.
 */
export async function GET() {
  try {
    const data = getObservabilityData();
    const servedAt = new Date().toISOString();
    const d = data.data as Record<string, unknown>;
    const complianceScore = d.complianceScore as Record<string, unknown> | undefined;

    if (!complianceScore) {
      return NextResponse.json(
        { error: "Compliance score data not found — regenerate dataset" },
        { status: 404 },
      );
    }

    // Jitter the overall composite score ±3%
    const raw = complianceScore.overallCompositeScore as number;
    const jittered = typeof raw === "number" ? jitter(raw, 0.03) : raw;

    // Also jitter per-framework scores
    const frameworkScores = complianceScore.frameworkScores as
      | { compositeScore: number; [key: string]: unknown }[]
      | undefined;
    if (Array.isArray(frameworkScores)) {
      for (const fw of frameworkScores) {
        fw.compositeScore = jitter(fw.compositeScore, 0.02);
      }
    }

    return NextResponse.json(
      {
        ...complianceScore,
        overallCompositeScore: jittered,
        servedAt,
        dataSource: "dynamic-jittered",
      },
      { headers: cacheHeaders(servedAt) },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load compliance score";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
