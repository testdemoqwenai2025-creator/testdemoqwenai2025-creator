/**
 * Shared observability data loader.
 *
 * All 16 API routes import `getObservabilityData()` from this single module
 * instead of duplicating the same fs.readFileSync + JSON.parse logic.
 *
 * NOTE: `export const dynamic = "force-dynamic"` and `export const runtime = "nodejs"`
 * CANNOT be re-exported from a shared module in Next.js 16 — they must be defined
 * inline in each route file. This module provides only data access + helpers.
 */

import fs from "fs";
import path from "path";

// ── Cache-Control + servedAt headers (used by all dynamic routes) ─────
export function cacheHeaders(servedAt: string) {
  return {
    "Cache-Control": "no-store, max-age=0",
    "X-Served-At": servedAt,
    "X-Data-Source": "dynamic-jittered",
  };
}

// ── Deterministic jitter helper (pure function, hoisted once) ──────────
export function jitter(v: number, pct = 0.05): number {
  if (!Number.isFinite(v)) return v;
  const delta = (Math.random() - 0.5) * 2 * pct * v;
  return Math.max(0, Number((v + delta).toFixed(2)));
}

// ── Data reader (synchronous, used by all routes) ─────────────────────
export function getObservabilityData() {
  const filePath = path.join(process.cwd(), "public", "observability-data.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Record<string, unknown>;
}

// ── Cyclic alert state machine ──────────────────────────────────────────
// Non-critical alerts cycle through: firing → acknowledged → resolved → firing.
// The cycle advances every ~10 minutes of wall-clock time.

const ALERT_CYCLE = ["firing", "acknowledged", "resolved"] as const;
export type AlertState = (typeof ALERT_CYCLE)[number];

export function rotateAlertState(alertIndex: number, currentMinute: number): AlertState {
  const phase = Math.floor(currentMinute / 10) + alertIndex;
  return ALERT_CYCLE[phase % ALERT_CYCLE.length];
}
