"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { GoNoGoDashboard } from "@/components/aura/go-no-go-dashboard";
import { OnboardingFlow } from "@/components/aura/onboarding-flow";
import { buildReadinessScore, mockDailyLog } from "@/lib/mock-data";
import type { DailyLogs, ReadinessScore, UserFitnessProfile } from "@/types";

export function AuraApp() {
  const [profile, setProfile] = useState<UserFitnessProfile | null>(null);
  const [logs, setLogs] = useState<DailyLogs[]>([]);
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);

  const handleOnboardingComplete = (nextProfile: UserFitnessProfile) => {
    const seededLog: DailyLogs = {
      ...mockDailyLog,
      wakeTime: nextProfile.wakeTime,
    };

    setProfile(nextProfile);
    setLogs([seededLog]);
    setReadiness(buildReadinessScore(nextProfile, seededLog));
  };

  const handleDailyLogSubmit = (log: DailyLogs) => {
    if (!profile) return;

    setLogs((prev) => [log, ...prev]);
    setReadiness(buildReadinessScore(profile, log));
  };

  return (
    <AnimatePresence mode="wait">
      {!profile || !readiness ? (
        <motion.div
          key="onboarding"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28 }}
        >
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28 }}
        >
          <GoNoGoDashboard
            profile={profile}
            readiness={readiness}
            logs={logs}
            onSubmitDailyLog={handleDailyLogSubmit}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
