"use client";

import { useMemo } from "react";

import type { DailyLogs } from "@/types";

interface SleepDebtTrackerProps {
    logs: DailyLogs[];
    targetSleepHours: number;
}

export function SleepDebtTracker({ logs, targetSleepHours }: SleepDebtTrackerProps) {
    const { totalDebt, dailyDeltas } = useMemo(() => {
        const recent = logs.slice(0, 7);
        const deltas = recent.map((log) => ({
            date: new Date(log.date).toLocaleDateString("en-US", { weekday: "short" }),
            delta: +(log.sleepDurationHours - targetSleepHours).toFixed(1),
        }));
        const debt = deltas.reduce((sum, d) => sum + Math.max(0, -d.delta), 0);
        return { totalDebt: +debt.toFixed(1), dailyDeltas: deltas.reverse() };
    }, [logs, targetSleepHours]);

    const debtLevel =
        totalDebt <= 2 ? { label: "Low Debt", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", ring: "stroke-emerald-500" }
            : totalDebt <= 5 ? { label: "Moderate", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", ring: "stroke-amber-500" }
                : { label: "High Debt", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", ring: "stroke-rose-500" };

    // Circular gauge: maps 0-10h debt to 0-100%
    const pct = Math.min(totalDebt / 10, 1);
    const radius = 40;
    const circ = 2 * Math.PI * radius;
    const offset = circ * (1 - pct);

    const maxDelta = Math.max(2, ...dailyDeltas.map((d) => Math.abs(d.delta)));

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Circular gauge */}
            <div className="relative flex items-center justify-center">
                <svg width="100" height="100" className="-rotate-90">
                    <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle
                        cx="50" cy="50" r={radius} fill="none"
                        className={debtLevel.ring}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        style={{ transition: "stroke-dashoffset 0.6s ease" }}
                    />
                </svg>
                <div className="absolute text-center">
                    <p className="text-xl font-bold text-slate-900">{totalDebt}h</p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Debt</p>
                </div>
            </div>

            {/* Status badge */}
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${debtLevel.color} ${debtLevel.bg} ${debtLevel.border}`}>
                {debtLevel.label}
            </span>

            {/* Summary */}
            <p className="text-center text-xs text-slate-500">
                You&apos;re <strong>{totalDebt}h</strong> behind your {targetSleepHours}h target over the past {Math.min(logs.length, 7)} days.
            </p>

            {/* 7-day bar chart */}
            {dailyDeltas.length > 1 && (
                <div className="flex w-full items-end justify-center gap-1.5" style={{ height: 56 }}>
                    {dailyDeltas.map((d, i) => {
                        const barH = Math.max(4, (Math.abs(d.delta) / maxDelta) * 48);
                        const isPositive = d.delta >= 0;
                        return (
                            <div key={i} className="flex flex-col items-center gap-0.5">
                                <div
                                    className={`w-4 rounded-sm ${isPositive ? "bg-emerald-400" : "bg-rose-400"}`}
                                    style={{ height: barH }}
                                    title={`${d.date}: ${d.delta > 0 ? "+" : ""}${d.delta}h`}
                                />
                                <span className="text-[9px] text-slate-400">{d.date.charAt(0)}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
