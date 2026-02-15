"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { GoNoGoDashboard } from "@/components/aura/go-no-go-dashboard";
import { buildReadinessScore, mockDailyLog, mockUserProfile } from "@/lib/mock-data";
import type { DailyLogs } from "@/types";

function dayKey(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate.slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function mergeLog(logs: DailyLogs[], incoming: DailyLogs): DailyLogs[] {
  const key = dayKey(incoming.date);
  const filtered = logs.filter((item) => dayKey(item.date) !== key);
  return [incoming, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
}

export function UserDashboardApp() {
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState<DailyLogs[]>([]);

  const readiness = useMemo(
    () => buildReadinessScore(mockUserProfile, logs[0] ?? mockDailyLog),
    [logs],
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
      setLogs((prev) => mergeLog(prev, log));

      if (status !== "authenticated" || !session?.user?.id) return;

      try {
        const res = await fetch("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(log),
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
    [session?.user?.id, status]
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
