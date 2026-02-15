"use client";

import Link from "next/link";
import { CalendarDays, Dumbbell, Moon, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { SiteNav } from "@/components/site/site-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyLogs } from "@/types";

function formatDisplayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function topSoreMuscles(log: DailyLogs): string {
  const top = Object.entries(log.muscleSoreness)
    .filter(([, level]) => Number(level) > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 3)
    .map(([key]) => key.replace(/_/g, " "));

  return top.length > 0 ? top.join(", ") : "None";
}

export default function HistoryPage() {
  const { status } = useSession();
  const [logs, setLogs] = useState<DailyLogs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      if (status === "loading") return;

      if (status !== "authenticated") {
        if (active) setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/logs", { cache: "no-store" });
        const data = (await res.json()) as { logs?: DailyLogs[]; error?: string };

        if (!res.ok) throw new Error(data.error || "Failed to load history");
        if (!active) return;

        setLogs(Array.isArray(data.logs) ? data.logs : []);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load history");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadHistory();

    return () => {
      active = false;
    };
  }, [status]);

  const historySummary = useMemo(() => {
    if (logs.length === 0) return null;
    const avgSleep = logs.reduce((sum, log) => sum + log.sleepDurationHours, 0) / logs.length;
    const avgStress = logs.reduce((sum, log) => sum + log.stress, 0) / logs.length;
    return {
      avgSleep: avgSleep.toFixed(1),
      avgStress: avgStress.toFixed(1),
      days: logs.length,
    };
  }, [logs]);

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <SiteNav current="history" />

        <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">Account History</p>
          <h1 className="mt-2 text-3xl text-slate-900 md:text-4xl">Daily Check-in History</h1>
          <p className="mt-1 text-sm text-slate-600">
            Every submitted check-in is saved to your account and shown here.
          </p>
        </header>

        {status === "unauthenticated" && (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Sign in required</CardTitle>
              <CardDescription className="text-slate-500">
                Sign in to view your saved daily check-ins.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Go to sign in
              </Link>
            </CardContent>
          </Card>
        )}

        {status === "authenticated" && historySummary && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500">Saved days</CardDescription>
                <CardTitle className="text-2xl text-slate-900">{historySummary.days}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500">Average sleep</CardDescription>
                <CardTitle className="text-2xl text-slate-900">{historySummary.avgSleep}h</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500">Average stress</CardDescription>
                <CardTitle className="text-2xl text-slate-900">{historySummary.avgStress}/10</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {status === "authenticated" && loading && (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5 text-sm text-slate-500">Loading history...</CardContent>
          </Card>
        )}

        {status === "authenticated" && error && (
          <Card className="border-rose-200 bg-rose-50 shadow-sm">
            <CardContent className="flex items-center gap-2 p-5 text-sm text-rose-700">
              <TriangleAlert className="h-4 w-4" />
              {error}
            </CardContent>
          </Card>
        )}

        {status === "authenticated" && !loading && !error && logs.length === 0 && (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5 text-sm text-slate-500">
              No check-ins saved yet. Complete your first daily check-in from the dashboard.
            </CardContent>
          </Card>
        )}

        {status === "authenticated" && !loading && !error && logs.length > 0 && (
          <div className="grid gap-4">
            {logs.map((log) => (
              <Card key={log.date} className="border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <CalendarDays className="h-4 w-4 text-blue-600" />
                    {formatDisplayDate(log.date)}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Wake {log.wakeTime} • RPE {log.lastSessionRpe}/10 • Soreness {log.subjectiveSoreness}/10
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm text-slate-700 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[0.1em] text-slate-500 uppercase">
                      <Moon className="h-4 w-4 text-blue-600" />
                      Sleep
                    </p>
                    <p className="text-xl font-semibold text-slate-900">{log.sleepDurationHours}h</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-1 text-xs font-semibold tracking-[0.1em] text-slate-500 uppercase">
                      Stress
                    </p>
                    <p className="text-xl font-semibold text-slate-900">{log.stress}/10</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-1 text-xs font-semibold tracking-[0.1em] text-slate-500 uppercase">
                      Top sore muscles
                    </p>
                    <p className="text-sm font-medium text-slate-900">{topSoreMuscles(log)}</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-3">
                    <p className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[0.1em] text-slate-500 uppercase">
                      <Dumbbell className="h-4 w-4 text-blue-600" />
                      Yesterday&apos;s workout
                    </p>
                    <p className="text-slate-700">{log.yesterdayWorkout || "No workout notes provided."}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
