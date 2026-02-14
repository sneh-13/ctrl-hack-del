"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const mealColors = {
    "high-sugar": { stroke: "#ef4444", fill: "#ef444433", label: "High Sugar", emoji: "🍭" },
    balanced: { stroke: "#3b82f6", fill: "#3b82f633", label: "Balanced", emoji: "🥗" },
    "high-protein": { stroke: "#10b981", fill: "#10b98133", label: "High Protein", emoji: "🥩" },
    "high-carb": { stroke: "#f59e0b", fill: "#f59e0b33", label: "High Carb", emoji: "🍞" },
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-3 text-xs">
                <p className="text-gray-300">{payload[0]?.payload?.time_label}</p>
                {payload.map((entry, i) => (
                    <p key={i} style={{ color: entry.stroke }} className="font-semibold">
                        Energy: {entry.value}%
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function GlucoseCurve() {
    const [curves, setCurves] = useState({});
    const [selectedMeals, setSelectedMeals] = useState(["balanced", "high-sugar"]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCurves();
    }, []);

    const fetchCurves = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/nutrition/compare-curves`);
            const data = await res.json();
            setCurves(data);
        } catch (e) {
            // Use mock data if backend is down
            setCurves(generateMockCurves());
        }
        setLoading(false);
    };

    const toggleMeal = (mealType) => {
        setSelectedMeals((prev) =>
            prev.includes(mealType)
                ? prev.filter((m) => m !== mealType)
                : [...prev, mealType]
        );
    };

    // Merge data for overlay chart
    const mergedData = curves["balanced"]?.data?.map((point, i) => {
        const merged = { time_label: point.time_label, time_hours: point.time_hours };
        Object.keys(curves).forEach((mealType) => {
            merged[mealType] = curves[mealType]?.data?.[i]?.energy;
        });
        return merged;
    }) || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                    📈 Glucose Curve Simulator
                </h3>
            </div>

            <p className="text-xs text-gray-400 mb-4">
                See how different meals impact your energy over 4 hours. Toggle meal types to compare.
            </p>

            {/* Meal type toggles */}
            <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(mealColors).map(([type, config]) => (
                    <motion.button
                        key={type}
                        onClick={() => toggleMeal(type)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${selectedMeals.includes(type)
                                ? "border-2"
                                : "bg-gray-800/50 text-gray-500 border border-gray-700"
                            }`}
                        style={
                            selectedMeals.includes(type)
                                ? { borderColor: config.stroke, color: config.stroke, backgroundColor: config.fill }
                                : {}
                        }
                    >
                        <span>{config.emoji}</span>
                        {config.label}
                    </motion.button>
                ))}
            </div>

            {/* Chart */}
            <div className="h-64">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <svg className="animate-spin h-8 w-8 mr-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mergedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                {Object.entries(mealColors).map(([type, config]) => (
                                    <linearGradient key={type} id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={config.stroke} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={config.stroke} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis
                                dataKey="time_label"
                                tick={{ fontSize: 10, fill: "#6b7280" }}
                                interval={7}
                                stroke="#374151"
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: "#6b7280" }}
                                domain={[30, 100]}
                                stroke="#374151"
                                label={{ value: "Energy %", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "#6b7280" } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={50} stroke="#374151" strokeDasharray="5 5" label={{ value: "Baseline", fill: "#6b7280", fontSize: 10 }} />

                            <AnimatePresence>
                                {selectedMeals.map((type) => (
                                    <Area
                                        key={type}
                                        type="monotone"
                                        dataKey={type}
                                        stroke={mealColors[type]?.stroke}
                                        fill={`url(#gradient-${type})`}
                                        strokeWidth={2}
                                        dot={false}
                                        animationDuration={800}
                                    />
                                ))}
                            </AnimatePresence>
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Info cards for selected meals */}
            <div className="grid grid-cols-2 gap-3 mt-4">
                {selectedMeals.map((type) => (
                    <motion.div
                        key={type}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 rounded-lg text-xs"
                        style={{ backgroundColor: `${mealColors[type]?.stroke}10`, borderLeft: `3px solid ${mealColors[type]?.stroke}` }}
                    >
                        <div className="font-semibold mb-1" style={{ color: mealColors[type]?.stroke }}>
                            {mealColors[type]?.emoji} {mealColors[type]?.label}
                        </div>
                        <div className="text-gray-400">{curves[type]?.description}</div>
                        {curves[type]?.peak && (
                            <div className="mt-1 text-gray-500">
                                Peak: {curves[type].peak.energy}% at {curves[type].peak.time}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

function generateMockCurves() {
    const types = ["high-sugar", "balanced", "high-protein", "high-carb"];
    const result = {};
    types.forEach((type) => {
        const data = [];
        for (let i = 0; i <= 48; i++) {
            const t = (i / 48) * 4;
            let energy;
            switch (type) {
                case "high-sugar":
                    energy = t < 0.3 ? 50 + 45 * (t / 0.3) : t < 0.8 ? 50 + 45 * Math.exp(-3 * (t - 0.3)) : t < 2 ? 50 + 45 * Math.exp(-1.5) - 15 * Math.sin(Math.PI * (t - 0.8) / 1.2) : 45 + 5 * (1 - Math.exp(-(t - 2)));
                    break;
                case "balanced":
                    energy = t < 0.5 ? 50 + 25 * (t / 0.5) : t < 2.5 ? 75 - 3 * (t - 0.5) : 75 - 6 - 5 * (t - 2.5);
                    break;
                case "high-protein":
                    energy = 50 + 20 * (1 - Math.exp(-1.5 * t)) - (t > 2 ? 3 * (t - 2) : 0);
                    break;
                case "high-carb":
                    energy = t < 0.5 ? 50 + 35 * (t / 0.5) : t < 1.5 ? 85 - 10 * (t - 0.5) : 75 - 8 * (t - 1.5);
                    break;
                default:
                    energy = 50;
            }
            data.push({ time_hours: +t.toFixed(2), time_label: i === 0 ? "Now" : `+${Math.round(t * 60)}m`, energy: Math.round(energy) });
        }
        result[type] = {
            data,
            description: { "high-sugar": "Rapid spike then crash", balanced: "Sustained steady energy", "high-protein": "Slow, long-lasting", "high-carb": "Moderate spike, moderate duration" }[type],
            peak: data.reduce((a, b) => (a.energy > b.energy ? a : b)),
            crash: data.reduce((a, b) => (a.energy < b.energy ? a : b)),
        };
    });
    return result;
}
