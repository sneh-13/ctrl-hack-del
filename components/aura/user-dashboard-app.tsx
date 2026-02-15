"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { GoNoGoDashboard } from "@/components/aura/go-no-go-dashboard";
import { buildReadinessScore, mockDailyLog, mockUserProfile, muscleGroups } from "@/lib/mock-data";
import type { DailyLogs, MuscleGroup, SorenessLevel } from "@/types";

function mergeLog(logs: DailyLogs[], incoming: DailyLogs): DailyLogs[] {
  const filtered = logs.filter((item) => item.date !== incoming.date);
  return [incoming, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
}

function subjectiveDropPerDay(value: number): number {
  if (value >= 8) return 3;
  if (value >= 6) return 4;
  if (value >= 5) return 5;
  return 5;
}

function projectSubjectiveSoreness(today: number): number {
  const drop = subjectiveDropPerDay(today);
  return Math.max(0, Math.round(today - drop));
}

function mapSorenessScore(muscleSoreness: Record<MuscleGroup, SorenessLevel>): number {
  const total = muscleGroups.reduce((sum, group) => sum + (muscleSoreness[group] ?? 0), 0);
  return Math.round((total / (muscleGroups.length * 2)) * 10);
}

function buildNextDemoDate(existingLogs: DailyLogs[]): string {
  const latest = existingLogs[0];
  if (!latest) {
    const now = new Date();
    now.setUTCHours(12, 0, 0, 0);
    return now.toISOString();
  }

  const latestDate = new Date(latest.date);
  const base = Number.isNaN(latestDate.getTime()) ? new Date() : latestDate;
  const next = new Date(base);
  next.setUTCDate(base.getUTCDate() + 1);
  next.setUTCHours(12, 0, 0, 0);
  return next.toISOString();
}

function applyRecoveryCarryover(incoming: DailyLogs, previous?: DailyLogs): DailyLogs {
  if (!previous) return incoming;

  const todaySoreness = Math.max(incoming.subjectiveSoreness, mapSorenessScore(incoming.muscleSoreness));
  const levelDrop = 1;

  const nextMuscleSoreness = {} as Record<MuscleGroup, SorenessLevel>;

  for (const group of muscleGroups) {
    const current = incoming.muscleSoreness[group] ?? previous.muscleSoreness[group] ?? 0;
    nextMuscleSoreness[group] = Math.max(0, current - levelDrop) as SorenessLevel;
  }

  const autoSubjective = projectSubjectiveSoreness(todaySoreness);
  const mapDrivenFloor = mapSorenessScore(nextMuscleSoreness);

  return {
    ...incoming,
    muscleSoreness: nextMuscleSoreness,
    subjectiveSoreness: Math.max(autoSubjective, mapDrivenFloor),
  };
}

function projectDemoLog(log: DailyLogs, existingLogs: DailyLogs[]): DailyLogs {
  const nextDate = buildNextDemoDate(existingLogs);
  return applyRecoveryCarryover({ ...log, date: nextDate }, existingLogs[0]);
}

export function UserDashboardApp() {
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState<DailyLogs[]>([]);

  const readiness = useMemo(
    () => buildReadinessScore(mockUserProfile, logs[0] ?? mockDailyLog, logs),
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
