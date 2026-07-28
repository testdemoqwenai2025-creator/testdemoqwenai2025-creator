import { NextResponse } from "next/server";
import { getObservabilityData, cacheHeaders } from "@/lib/observability-data";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export async function GET() {
  try {
    const data = getObservabilityData();
    const servedAt = new Date().toISOString();
    const d = data.data as Record<string, unknown>;
    const chain = d.auditChain as Record<string, unknown>;
    return NextResponse.json(
      {
        auditChain: chain,
        statistics: {
          totalEntries: chain?.total_entries ?? (Array.isArray(chain?.entries) ? chain.entries.length : 0),
          chainIntact: chain?.chain_intact ?? true,
        },
        servedAt,
      },
      { headers: cacheHeaders(servedAt) },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load audit chain data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
