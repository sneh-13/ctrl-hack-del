"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ActivitySquare, Moon, TrendingUp } from "lucide-react";

import { DailyCheckInModal } from "@/components/aura/daily-checkin-modal";
import { DailyReadinessHeatmap } from "@/components/aura/daily-readiness-heatmap";
import { EnergyClock } from "@/components/aura/energy-clock";
import { InteractiveBodyMap } from "@/components/aura/interactive-body-map";
import { ReadinessScoreDisplay } from "@/components/aura/readiness-score-display";
import { SiteNav } from "@/components/site/site-nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { emptyMuscleSoreness } from "@/lib/mock-data";
import type { DailyLogs, ReadinessScore, UserFitnessProfile } from "@/types";

interface GoNoGoDashboardProps {
  profile: UserFitnessProfile;
  readiness: ReadinessScore;
  logs: DailyLogs[];
  onSubmitDailyLog: (log: DailyLogs) => void;
}

const statePalette = {
  green: {
    badge: "bg-[#39ff14]/20 text-[#91ff7a] border-[#39ff14]/45",
    panel: "border-[#39ff14]/35 bg-[#39ff14]/8",
    title: "GO for high-intent training",
  },
  yellow: {
    badge: "bg-[#ffb020]/20 text-[#ffd38a] border-[#ffb020]/45",
    panel: "border-[#ffb020]/35 bg-[#ffb020]/8",
    title: "Caution: use calibrated volume",
  },
  red: {
    badge: "bg-[#ff355e]/20 text-[#ff9db2] border-[#ff355e]/45",
    panel: "border-[#ff355e]/35 bg-[#ff355e]/8",
    title: "NO-GO for max loading",
  },
};

export function GoNoGoDashboard({
  profile,
  readiness,
  logs,
  onSubmitDailyLog,
}: GoNoGoDashboardProps) {
  const latestLog = logs[0];
  const palette = statePalette[readiness.state];

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-9">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <SiteNav current="dashboard" />

        <header className="flex flex-col gap-4 rounded-2xl border border-cyan-400/20 bg-slate-950/68 p-4 backdrop-blur md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge className={palette.badge}>Aura Go/No-Go</Badge>
              <Badge variant="outline" className="border-white/20 text-slate-300">
                {profile.chronotype.toUpperCase()} CHRONOTYPE
              </Badge>
            </div>
            <h1 className="font-display text-3xl text-white md:text-4xl">Biological Prime Time Dashboard</h1>
            <p className="mt-1 text-sm text-slate-300">
              Strength peak is modeled {readiness.peakWindow.startHour}-{readiness.peakWindow.endHour} hours post-wake.
            </p>
          </div>

          <DailyCheckInModal profile={profile} latestLog={latestLog} onSubmit={onSubmitDailyLog} />
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
            <p className="text-xs tracking-[0.18em] text-slate-300 uppercase">Today&apos;s Readiness Directive</p>
            <p className="font-display mt-1 text-2xl text-white">{palette.title}</p>
            <p className="text-sm text-slate-300">{readiness.summary}</p>
          </motion.div>
        </AnimatePresence>

        <div className="grid gap-4 lg:grid-cols-12">
          <Card className="border-white/10 bg-slate-950/68 lg:col-span-4">
            <CardHeader>
              <CardTitle className="font-display text-xl text-white">Go/No-Go Indicator</CardTitle>
              <CardDescription>Glance decision in under three seconds.</CardDescription>
            </CardHeader>
            <CardContent>
              <ReadinessScoreDisplay readiness={readiness} />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/68 lg:col-span-4">
            <CardHeader>
              <CardTitle className="font-display text-xl text-white">Energy Clock</CardTitle>
              <CardDescription>Prime lifting window anchored to wake time.</CardDescription>
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

          <Card className="border-white/10 bg-slate-950/68 lg:col-span-4">
            <CardHeader>
              <CardTitle className="font-display text-xl text-white">24h Readiness Heatmap</CardTitle>
              <CardDescription>Blue = cooler/recovered, red = higher fatigue load.</CardDescription>
            </CardHeader>
            <CardContent>
              <DailyReadinessHeatmap hourlyPerformance={readiness.hourlyPerformance} />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/68 lg:col-span-7">
            <CardHeader>
              <CardTitle className="font-display text-xl text-white">Interactive Body Map</CardTitle>
              <CardDescription>Latest soreness regions from daily check-in.</CardDescription>
            </CardHeader>
            <CardContent>
              <InteractiveBodyMap value={latestLog?.muscleSoreness ?? emptyMuscleSoreness} interactive={false} />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/68 lg:col-span-5">
            <CardHeader>
              <CardTitle className="font-display text-xl text-white">Performance Context</CardTitle>
              <CardDescription>Recovery signals feeding today&apos;s prediction.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                  <p className="mb-1 flex items-center gap-2 text-xs tracking-[0.12em] text-slate-300 uppercase">
                    <Moon className="h-4 w-4 text-cyan-300" /> Sleep
                  </p>
                  <p className="font-display text-2xl text-white">{latestLog?.sleepDurationHours ?? profile.targetSleepHours}h</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                  <p className="mb-1 flex items-center gap-2 text-xs tracking-[0.12em] text-slate-300 uppercase">
                    <ActivitySquare className="h-4 w-4 text-cyan-300" /> Stress
                  </p>
                  <p className="font-display text-2xl text-white">{latestLog?.stress ?? 0}/10</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                  <p className="mb-1 flex items-center gap-2 text-xs tracking-[0.12em] text-slate-300 uppercase">
                    <TrendingUp className="h-4 w-4 text-cyan-300" /> Last RPE
                  </p>
                  <p className="font-display text-2xl text-white">{latestLog?.lastSessionRpe ?? 0}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                  <p className="mb-1 text-xs tracking-[0.12em] text-slate-300 uppercase">Updated</p>
                  <p className="font-display text-xl text-white">
                    {new Date(readiness.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <p className="mb-1 text-xs tracking-[0.12em] text-slate-300 uppercase">Yesterday&apos;s Session</p>
                <p>{latestLog?.yesterdayWorkout ?? "No session logged"}</p>
              </div>

              <p className="text-xs text-slate-400">
                Data is mock-backed but typed for FastAPI integration via the shared models in <code>types.ts</code>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
