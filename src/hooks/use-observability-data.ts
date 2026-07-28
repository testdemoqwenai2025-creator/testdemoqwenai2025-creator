"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { ObservabilityData } from "./observability-types";

const REFRESH_INTERVAL_MS = 30_000; // auto-refresh every 30s
const MAX_RETRY_BACKOFF_MS = 60_000; // cap at 60s backoff

export function useObservabilityData() {
  const [data, setData] = useState<ObservabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateStatus, setRegenerateStatus] = useState<
    { ok: boolean; message: string; runId?: string } | null
  >(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setRefreshing(true);
      try {
        const res = await fetch(`/api/observability?_=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
        setLastRefreshed(new Date());
        setPollError(null);
        setConsecutiveErrors(0);
      } catch (err) {
        console.error("Failed to fetch observability data:", err);
        setPollError(err instanceof Error ? err.message : "fetch failed");
        setConsecutiveErrors((prev) => prev + 1);
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    },
    [],
  );

  const handleRegenerate = useCallback(async () => {
    setRegenerating(true);
    setRegenerateStatus(null);
    try {
      const res = await fetch("/api/observability/regenerate", { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setRegenerateStatus({
          ok: true,
          message: `Regenerated — v${json.version}, generatedAt ${json.generatedAt}`,
          runId: json.runId,
        });
        await fetchData({ silent: true });
      } else {
        setRegenerateStatus({ ok: false, message: json.error || "Regeneration failed" });
      }
    } catch (err) {
      setRegenerateStatus({
        ok: false,
        message: err instanceof Error ? err.message : "Regeneration request failed",
      });
    } finally {
      setRegenerating(false);
      setTimeout(() => setRegenerateStatus(null), 8_000);
    }
  }, [fetchData]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh with exponential backoff on errors
  useEffect(() => {
    const scheduleNext = () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);

      let delay = REFRESH_INTERVAL_MS;
      if (consecutiveErrors > 0) {
        // Exponential backoff: 5s, 10s, 20s, 40s, 60s (capped)
        delay = Math.min(5_000 * Math.pow(2, consecutiveErrors - 1), MAX_RETRY_BACKOFF_MS);
      }

      retryTimeoutRef.current = setTimeout(() => {
        fetchData({ silent: true });
      }, delay);
    };

    scheduleNext();
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [fetchData, consecutiveErrors, lastRefreshed]);

  return {
    data,
    loading,
    refreshing,
    lastRefreshed,
    regenerating,
    regenerateStatus,
    pollError,
    consecutiveErrors,
    activeTab: null as string | null, // placeholder — actual tab state lives in page.tsx
    setActiveTab: (() => {}) as (tab: string) => void, // placeholder
    fetchData,
    handleRegenerate,
  };
}
