"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SleepScheduler() {
    const [wakeTime, setWakeTime] = useState("07:00");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSleepData("07:00");
    }, []);

    const fetchSleepData = async (time) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/sleep/optimize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wake_time: time }),
            });
            const result = await res.json();
            setData(result);
        } catch {
            setData(generateMockSleepData(time));
        }
        setLoading(false);
    };

    const handleSubmit = () => {
        fetchSleepData(wakeTime);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card"
        >
            <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
                🌙 Sleep Cycle Optimizer
            </h3>

            {/* Wake time input */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-1">
                    <label className="text-xs text-gray-400 block mb-1">I need to wake up at:</label>
                    <input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                </div>
                <motion.button
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
                >
                    Calculate
                </motion.button>
            </div>

            {loading && (
                <div className="text-center py-8 text-gray-500">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Calculating optimal cycles...
                </div>
            )}

            {data && !loading && (
                <>
                    {/* Recommended bedtimes */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">💤 Recommended Bedtimes</h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {data.recommended_bedtimes?.map((bt, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`p-3 rounded-xl text-center border ${bt.quality === "optimal"
                                            ? "border-emerald-500/30 bg-emerald-500/10"
                                            : bt.quality === "good"
                                                ? "border-blue-500/30 bg-blue-500/10"
                                                : "border-gray-600 bg-gray-800/30"
                                        }`}
                                >
                                    <div className={`text-lg font-bold ${bt.quality === "optimal" ? "text-emerald-300" : bt.quality === "good" ? "text-blue-300" : "text-gray-300"
                                        }`}>
                                        {bt.bedtime}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">{bt.cycles} cycles • {bt.sleep_hours}h</div>
                                    <div className={`text-xs mt-1 capitalize ${bt.quality === "optimal" ? "text-emerald-400" : bt.quality === "good" ? "text-blue-400" : "text-gray-500"
                                        }`}>
                                        {bt.quality}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Sleep Cycle Visualization */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">🔄 Sleep Cycle Timeline</h4>
                        <div className="flex gap-1 overflow-x-auto pb-2">
                            {data.cycle_visualization?.map((cycle, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ delay: i * 0.15, type: "spring" }}
                                    className="flex-1 min-w-[80px]"
                                >
                                    <div className="text-xs text-center text-gray-500 mb-1">Cycle {cycle.cycle}</div>
                                    <div className="flex flex-col gap-0.5 rounded-lg overflow-hidden">
                                        {cycle.stages?.map((stage, j) => {
                                            const colors = {
                                                "Light Sleep (N1/N2)": "bg-indigo-900/60",
                                                "Deep Sleep (N3)": "bg-blue-800/80",
                                                "REM Sleep": "bg-purple-700/60",
                                            };
                                            return (
                                                <div
                                                    key={j}
                                                    className={`${colors[stage.stage] || "bg-gray-700"} px-2 py-2 text-center`}
                                                    style={{ minHeight: `${stage.duration_min * 0.8}px` }}
                                                >
                                                    <div className="text-[10px] text-gray-300 font-medium">
                                                        {stage.stage.split(" ")[0]}
                                                    </div>
                                                    <div className="text-[9px] text-gray-500">{stage.duration_min}m</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="text-[10px] text-center text-gray-500 mt-1">{cycle.start}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Sleep Inertia + Best Study Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5"
                        >
                            <div className="text-xs text-amber-300 font-medium mb-1">⚠️ Sleep Inertia Zone</div>
                            <div className="text-sm text-gray-300">
                                {data.sleep_inertia?.wake_time} – {data.sleep_inertia?.inertia_end}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{data.sleep_inertia?.warning}</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5"
                        >
                            <div className="text-xs text-emerald-300 font-medium mb-1">🧠 Best Study Time</div>
                            <div className="text-sm text-gray-300">
                                {data.best_study_time?.start} – {data.best_study_time?.end}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{data.best_study_time?.reason}</div>
                        </motion.div>
                    </div>
                </>
            )}
        </motion.div>
    );
}

function generateMockSleepData(wakeTime) {
    const [h, m] = wakeTime.split(":").map(Number);
    const bedtimes = [];
    for (let cycles = 6; cycles >= 3; cycles--) {
        const totalMin = cycles * 90 + 14;
        const bedH = ((h * 60 + m - totalMin + 1440) % 1440);
        bedtimes.push({
            bedtime: `${String(Math.floor(bedH / 60)).padStart(2, "0")}:${String(bedH % 60).padStart(2, "0")}`,
            cycles,
            sleep_hours: +((cycles * 90) / 60).toFixed(1),
            quality: cycles >= 5 ? "optimal" : cycles === 4 ? "good" : "minimum",
        });
    }
    const inertiaEnd = `${String((h + 2) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const studyEnd = `${String((h + 4) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    return {
        wake_time: wakeTime,
        recommended_bedtimes: bedtimes,
        sleep_inertia: { wake_time: wakeTime, inertia_end: inertiaEnd, duration_hours: 2, warning: "Cognitive performance is reduced. Avoid complex tasks." },
        best_study_time: { start: inertiaEnd, end: studyEnd, reason: "Post-inertia cortisol peak — maximum cognitive performance." },
        cycle_visualization: Array.from({ length: 5 }, (_, i) => ({
            cycle: i + 1,
            start: `${String((h - 8 + i * 1 + 24) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
            end: "",
            stages: [
                { stage: "Light Sleep (N1/N2)", duration_min: i >= 3 ? 45 : 45, start: "" },
                { stage: "Deep Sleep (N3)", duration_min: i >= 3 ? 15 : 25, start: "" },
                { stage: "REM Sleep", duration_min: i >= 3 ? 30 : 20, start: "" },
            ],
        })),
    };
}
