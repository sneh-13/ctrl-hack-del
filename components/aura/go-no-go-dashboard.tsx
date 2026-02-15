"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ActivitySquare, Moon, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import { DailyCheckInModal } from "@/components/aura/daily-checkin-modal";
import { SleepDebtTracker } from "@/components/aura/sleep-debt-tracker";
import { EnergyClock } from "@/components/aura/energy-clock";
import { InteractiveBodyMap } from "@/components/aura/interactive-body-map";
import { ReadinessScoreDisplay } from "@/components/aura/readiness-score-display";
import { SiteNav } from "@/components/site/site-nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { emptyMuscleSoreness } from "@/lib/mock-data";
import { computeRecoveredSoreness } from "@/lib/recovery";
import type { DailyLogs, ReadinessScore, UserFitnessProfile } from "@/types";

interface GoNoGoDashboardProps {
  profile: UserFitnessProfile;
  readiness: ReadinessScore;
  logs: DailyLogs[];
  onSubmitDailyLog: (log: DailyLogs) => void;
}

const statePalette = {
  green: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    panel: "border-emerald-200 bg-emerald-50",
    title: "GO for high-intent training",
  },
  yellow: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    panel: "border-amber-200 bg-amber-50",
    title: "Caution: use calibrated volume",
  },
  red: {
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    panel: "border-rose-200 bg-rose-50",
    title: "NO-GO for max loading",
  },
};

export function GoNoGoDashboard({
  profile,
  readiness,
  logs,
  onSubmitDailyLog,
}: GoNoGoDashboardProps) {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const latestLog = logs[0];
  const palette = statePalette[readiness.state];
  const isCriticalFatigue = readiness.score < 10;
  const directiveTitle = isCriticalFatigue ? "REST DAY REQUIRED" : palette.title;
  const directiveSummary = isCriticalFatigue
    ? "Body fatigue is critically high. Take a full rest day and prioritize sleep, hydration, and recovery."
    : readiness.summary;
  const { data: session } = useSession();
  const recoveredSoreness = useMemo(() => computeRecoveredSoreness(logs), [logs]);
  const displaySoreness = session?.user?.id ? recoveredSoreness : emptyMuscleSoreness;
  const firstName = session?.user?.name?.split(" ")[0];
  const navCurrent = checkInOpen ? "history" : "dashboard";

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <SiteNav current={navCurrent} suppressActive={checkInOpen} />

        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            {firstName && (
              <p className="mb-3 text-sm font-medium text-slate-500">
                Welcome back, <span className="text-slate-800">{firstName}</span> 👋
              </p>
            )}
            <div className="mb-2 flex items-center gap-2">
              <Badge className={palette.badge}>Aura Go/No-Go</Badge>
              <Badge variant="outline" className="border-slate-300 text-slate-600">
                {profile.chronotype.toUpperCase()} CHRONOTYPE
              </Badge>
            </div>
            <h1 className="text-3xl text-slate-900 md:text-4xl">Biological Prime Time Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              Strength peak is modeled {readiness.peakWindow.startHour}-{readiness.peakWindow.endHour} hours post-wake.
            </p>
          </div>

          <DailyCheckInModal
            profile={profile}
            latestLog={latestLog}
            onSubmit={onSubmitDailyLog}
            open={checkInOpen}
            onOpenChange={setCheckInOpen}
          />
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={readiness.state}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className={`rounded-2xl border px-5 py-4 ${palette.panel}`}
          >
            <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">Today&apos;s Readiness Directive</p>
            <p className="mt-1 text-2xl text-slate-900">{directiveTitle}</p>
            <p className="text-sm text-slate-600">{directiveSummary}</p>
          </motion.div>
        </AnimatePresence>

        <div className="grid gap-4 lg:grid-cols-12">
          <Card className="border-slate-200 bg-white shadow-sm lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">Go/No-Go Indicator</CardTitle>
              <CardDescription className="text-slate-500">Glance decision in under three seconds.</CardDescription>
            </CardHeader>
            <CardContent>
              <ReadinessScoreDisplay readiness={readiness} />
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">Energy Clock</CardTitle>
              <CardDescription className="text-slate-500">Prime lifting window anchored to wake time.</CardDescription>
            </CardHeader>
            <CardContent>
              <EnergyClock
                wakeTime={latestLog?.wakeTime ?? profile.wakeTime}
                peakStartOffsetHours={readiness.peakWindow.startHour}
                peakEndOffsetHours={readiness.peakWindow.endHour}
                hourlyPerformance={readiness.hourlyPerformance}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">Sleep Debt Tracker</CardTitle>
              <CardDescription className="text-slate-500">Accumulated sleep deficit over the past 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <SleepDebtTracker logs={logs} targetSleepHours={profile.targetSleepHours} />
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm lg:col-span-7">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">Interactive Body Map</CardTitle>
              <CardDescription className="text-slate-500">Recovery state based on check-in history.</CardDescription>
            </CardHeader>
            <CardContent>
              <InteractiveBodyMap value={displaySoreness} interactive={false} />
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm lg:col-span-5">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">Performance Context</CardTitle>
              <CardDescription className="text-slate-500">Recovery signals feeding today&apos;s prediction.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[0.1em] text-slate-500 uppercase">
                    <Moon className="h-4 w-4 text-blue-600" /> Sleep
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">{latestLog?.sleepDurationHours ?? profile.targetSleepHours}h</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[0.1em] text-slate-500 uppercase">
                    <ActivitySquare className="h-4 w-4 text-blue-600" /> Stress
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">{latestLog?.stress ?? 0}/10</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[0.1em] text-slate-500 uppercase">
                    <TrendingUp className="h-4 w-4 text-blue-600" /> Last RPE
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">{latestLog?.lastSessionRpe ?? 0}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-1 text-xs font-semibold tracking-[0.1em] text-slate-500 uppercase">Updated</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {new Date(readiness.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-1 text-xs font-semibold tracking-[0.1em] text-slate-500 uppercase">Yesterday&apos;s Session</p>
                <p className="text-slate-700">{latestLog?.yesterdayWorkout ?? "No session logged"}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold tracking-[0.1em] text-slate-500 uppercase">Muscle Recovery Status</p>
                {(() => {
                  const entries = Object.entries(displaySoreness)
                    .filter(([, level]) => level > 0)
                    .map(([muscle, level]) => ({ muscle: muscle.replace("_", " "), level }));
                  return entries.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {entries.map(({ muscle, level }) => (
                        <span
                          key={muscle}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${level === 2
                            ? "border border-rose-200 bg-rose-50 text-rose-700"
                            : "border border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                        >
                          {muscle} {level === 2 ? "• Sore" : "• Recovering"}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">All muscle groups recovered ✓</p>
                  );
                })()}
              </div>

              <p className="text-xs text-slate-500">
                Daily check-ins are saved to your account when signed in. Data models are shared in <code>types.ts</code>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
