"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { GoNoGoDashboard } from "@/components/aura/go-no-go-dashboard";
import {
  buildFreshAccountLog,
  buildReadinessScore,
  mockDailyLog,
  mockUserProfile,
  RESET_BASELINE_DATE_ISO,
} from "@/lib/mock-data";
import type { DailyLogs } from "@/types";

function mergeLog(logs: DailyLogs[], incoming: DailyLogs): DailyLogs[] {
  const filtered = logs.filter((item) => item.date !== incoming.date);
  return [incoming, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
}

function buildNextDemoDate(existingLogs: DailyLogs[]): string {
  const latest = existingLogs[0];
  if (!latest) {
    return RESET_BASELINE_DATE_ISO;
  }

  const latestDate = new Date(latest.date);
  const base = Number.isNaN(latestDate.getTime()) ? new Date(RESET_BASELINE_DATE_ISO) : latestDate;
  const next = new Date(base);
  next.setUTCDate(base.getUTCDate() + 1);
  next.setUTCHours(12, 0, 0, 0);
  return next.toISOString();
}

/**
 * Stamp the log with the next demo date. Muscle soreness is kept as-is —
 * the recovery algorithm in lib/recovery.ts handles state transitions
 * based on actual date differences.
 */
function projectDemoLog(log: DailyLogs, existingLogs: DailyLogs[]): DailyLogs {
  const nextDate = buildNextDemoDate(existingLogs);
  return { ...log, date: nextDate };
}

export function UserDashboardApp() {
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState<DailyLogs[]>([]);
  const freshDefaultLog = useMemo(() => buildFreshAccountLog(mockUserProfile), []);
  const activeLog = useMemo(() => {
    if (status === "authenticated") {
      return logs[0] ?? freshDefaultLog;
    }

    return logs[0] ?? mockDailyLog;
  }, [freshDefaultLog, logs, status]);

  const readiness = useMemo(
    () => {
      const computed = buildReadinessScore(mockUserProfile, activeLog, logs);

      // Fresh authenticated account (or just-reset account) starts at full readiness.
      if (status === "authenticated" && logs.length === 0) {
        return {
          ...computed,
          score: 100,
          state: "green" as const,
        };
      }

      return computed;
    },
    [activeLog, logs, status],
  );

  useEffect(() => {
    let active = true;

    async function loadLogs() {
      if (status === "loading") return;

      if (status !== "authenticated" || !session?.user?.id) {
        if (active) setLogs([mockDailyLog]);
        return;
      }

      try {
        const res = await fetch("/api/logs", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch logs");

        const data = (await res.json()) as { logs?: DailyLogs[] };
        if (!active) return;

        setLogs(Array.isArray(data.logs) && data.logs.length > 0 ? data.logs : []);
      } catch (error) {
        console.error("[Dashboard] Failed to load log history", error);
        if (active) setLogs([]);
      }
    }

    void loadLogs();

    return () => {
      active = false;
    };
  }, [session?.user?.id, status]);

  const handleDailyLogSubmit = useCallback(
    async (log: DailyLogs) => {
      const projectedBase = projectDemoLog(log, logs);
      const projectedLogs = mergeLog(logs, projectedBase);
      const projectedReadiness = buildReadinessScore(mockUserProfile, projectedLogs[0], projectedLogs);
      const projected: DailyLogs = {
        ...projectedLogs[0],
        readinessScore: projectedReadiness.score,
        readinessState: projectedReadiness.state,
        profileSnapshot: mockUserProfile,
      };

      setLogs(mergeLog(logs, projected));

      if (status !== "authenticated" || !session?.user?.id) return;

      try {
        const res = await fetch("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projected),
        });

        if (!res.ok) throw new Error("Failed to save log");

        const data = (await res.json()) as { log?: DailyLogs };
        const savedLog = data.log;
        if (!savedLog) return;
        setLogs((prev) => mergeLog(prev, savedLog));
      } catch (error) {
        console.error("[Dashboard] Failed to save log", error);
      }
    },
    [logs, session?.user?.id, status]
  );

  return (
    <GoNoGoDashboard
      profile={mockUserProfile}
      readiness={readiness}
      logs={logs}
      onSubmitDailyLog={handleDailyLogSubmit}
    />
  );
}
