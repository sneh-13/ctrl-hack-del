"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, Shield, Calendar, RefreshCw, Sparkles } from "lucide-react";

import type { CortexInsight } from "@/lib/cortex";

export function CortexInsights() {
    const [insights, setInsights] = useState<CortexInsight | null>(null);
    const [dataPoints, setDataPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchPredictions() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/analytics/predict");
            const data = await res.json();

            if (data.error && !data.insights) {
                setError(data.error);
                return;
            }

            if (data.insights) {
                setInsights(data.insights);
                setDataPoints(data.dataPoints || 0);
            }
        } catch {
            setError("Failed to load Cortex insights");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPredictions();
    }, []);

    const trendIcon = {
        improving: <TrendingUp className="h-4 w-4 text-emerald-500" />,
        declining: <TrendingDown className="h-4 w-4 text-rose-500" />,
        stable: <Minus className="h-4 w-4 text-amber-500" />,
    };

    const riskColor = {
        low: "text-emerald-600 bg-emerald-50 border-emerald-200",
        moderate: "text-amber-600 bg-amber-50 border-amber-200",
        high: "text-rose-600 bg-rose-50 border-rose-200",
    };

    const riskIcon = {
        low: <Shield className="h-4 w-4" />,
        moderate: <AlertTriangle className="h-4 w-4" />,
        high: <AlertTriangle className="h-4 w-4" />,
    };

    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <Brain className="h-5 w-5 text-violet-600" />
                        </motion.div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Cortex AI Insights</h3>
                        <p className="text-xs text-slate-500">Analyzing your training data with Snowflake Cortex...</p>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                            <Brain className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Cortex AI Insights</h3>
                            <p className="text-xs text-slate-500">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchPredictions}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    if (!insights) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200 bg-white p-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Cortex AI Insights</h3>
                            <p className="text-xs text-slate-500">
                                Powered by {insights.source === "cortex" ? "Snowflake Cortex" : "Gemini AI"} · {dataPoints} data points
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchPredictions}
                        className="rounded-lg border border-slate-200 p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                        title="Refresh predictions"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>

                {/* Insight Cards */}
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* Readiness Forecast */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                Tomorrow's Forecast
                            </span>
                            {trendIcon[insights.readinessForecast.trend]}
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900">
                                {insights.readinessForecast.predictedScore ?? "--"}
                            </span>
                            <span className="text-sm text-slate-500">/100</span>
                            <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium capitalize ${insights.readinessForecast.trend === "improving"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : insights.readinessForecast.trend === "declining"
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-amber-100 text-amber-700"
                                }`}>
                                {insights.readinessForecast.trend}
                            </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                            {insights.readinessForecast.confidence}
                        </p>
                    </motion.div>

                    {/* Overtraining Risk */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`rounded-xl border p-4 ${riskColor[insights.overtrainingRisk.level]}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium uppercase tracking-wider opacity-70">
                                Overtraining Risk
                            </span>
                            {riskIcon[insights.overtrainingRisk.level]}
                        </div>
                        <div className="mt-2">
                            <span className="text-lg font-bold capitalize">
                                {insights.overtrainingRisk.level}
                            </span>
                        </div>
                        <p className="mt-2 text-xs opacity-80">
                            {insights.overtrainingRisk.signal}
                        </p>
                    </motion.div>

                    {/* Recovery Recommendation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-xl border border-blue-100 bg-blue-50 p-4"
                    >
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium uppercase tracking-wider text-blue-600">
                                Recovery Strategy
                            </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-blue-900">
                            {insights.recoveryRecommendation}
                        </p>
                    </motion.div>

                    {/* Optimal Training Day */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                Peak Training Day
                            </span>
                        </div>
                        <div className="mt-2">
                            <span className="text-lg font-bold text-slate-900">
                                {insights.optimalTrainingDay.day}
                            </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                            {insights.optimalTrainingDay.reason}
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
