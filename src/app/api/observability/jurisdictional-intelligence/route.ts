import { NextResponse } from "next/server";
import { getObservabilityData, cacheHeaders } from "@/lib/observability-data";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = getObservabilityData();
    const servedAt = new Date().toISOString();
    const ji = (data.data as Record<string, unknown>).jurisdictionalIntelligence as Record<string, unknown>;
    return NextResponse.json(
      { ...ji, servedAt },
      { headers: cacheHeaders(servedAt) }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load jurisdictional intelligence data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
