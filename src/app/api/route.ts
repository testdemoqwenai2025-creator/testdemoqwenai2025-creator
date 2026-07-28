import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api
 * Health check for the API root.
 */
export async function GET() {
  const servedAt = new Date().toISOString();
  return NextResponse.json(
    {
      status: "ok",
      service: "autonomous-compliance-agent-swarm-observability",
      servedAt,
      endpoints: [
        "GET  /api/observability",
        "GET  /api/observability/topology",
        "GET  /api/observability/traces",
        "GET  /api/observability/metrics",
        "GET  /api/observability/imperatives",
        "GET  /api/observability/violations",
        "GET  /api/observability/logs",
        "GET  /api/observability/alerts",
        "GET  /api/observability/state-machine",
        "GET  /api/observability/orchestration",
        "GET  /api/observability/conflicts",
        "GET  /api/observability/audit-chain",
        "GET  /api/observability/governance-orchestrator",
        "GET  /api/observability/regenerate",
        "POST /api/observability/regenerate",
      ],
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Served-At": servedAt,
      },
    },
  );
}
