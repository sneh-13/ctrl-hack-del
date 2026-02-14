"use client";

import { useMemo, useState } from "react";

import { GoNoGoDashboard } from "@/components/aura/go-no-go-dashboard";
import { buildReadinessScore, mockDailyLog, mockUserProfile } from "@/lib/mock-data";
import type { DailyLogs } from "@/types";

export function UserDashboardApp() {
  const [logs, setLogs] = useState<DailyLogs[]>([mockDailyLog]);

  const readiness = useMemo(
    () => buildReadinessScore(mockUserProfile, logs[0] ?? mockDailyLog),
    [logs],
  );

  const handleDailyLogSubmit = (log: DailyLogs) => {
    setLogs((prev) => [log, ...prev]);
  };

  return (
    <GoNoGoDashboard
      profile={mockUserProfile}
      readiness={readiness}
      logs={logs}
      onSubmitDailyLog={handleDailyLogSubmit}
    />
  );
}
