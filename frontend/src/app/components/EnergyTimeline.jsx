"use client";
import { motion } from "framer-motion";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot,
    ReferenceLine,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0]?.payload;
        return (
            <div className="glass-card p-3 text-xs">
                <p className="text-gray-300 font-medium">{data?.time}</p>
                <p className="text-blue-300">Energy: {data?.energy}%</p>
                {data?.label && <p className="text-amber-300 mt-1">{data.label}</p>}
            </div>
        );
    }
    return null;
};

export default function EnergyTimeline({ alerts = [], scheduleBlocks = [] }) {
    // Generate 24-hour energy prediction data
    const data = generate24HourData(scheduleBlocks);

    // Extract key moments
    const focusPeak = data.reduce((a, b) => (a.energy > b.energy ? a : b));
    const focusCrash = data.reduce((a, b) => (a.energy < b.energy ? a : b));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card"
        >
            <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
                ⚡ 24-Hour Energy Prediction
            </h3>
            <p className="text-xs text-gray-400 mb-4">
                Predicted energy levels with cortisol, adenosine, and activity markers
            </p>

            {/* Chart */}
            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 10, fill: "#6b7280" }}
                            interval={2}
                            stroke="#374151"
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: "#6b7280" }}
                            domain={[0, 100]}
                            stroke="#374151"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={50} stroke="#374151" strokeDasharray="5 5" />
                        <Line
                            type="monotone"
                            dataKey="energy"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            dot={false}
                            animationDuration={1200}
                            fill="url(#energyGradient)"
                        />
                        {/* Markers */}
                        {data.filter((d) => d.marker).map((d, i) => (
                            <ReferenceDot
                                key={i}
                                x={d.time}
                                y={d.energy}
                                r={5}
                                fill={d.markerColor || "#3b82f6"}
                                stroke="#fff"
                                strokeWidth={1.5}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">🔔 AI Alerts</h4>
                    {alerts.map((alert, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`px-3 py-2 rounded-lg text-xs flex items-start gap-2 ${alert.type === "warning"
                                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                                    : alert.type === "tip"
                                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                                        : "bg-blue-500/10 border border-blue-500/20 text-blue-300"
                                }`}
                        >
                            <span className="font-mono text-gray-400 shrink-0">{alert.time}</span>
                            <span>{alert.message}</span>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Key Moments Legend */}
            <div className="flex gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-gray-400">Focus Peak</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="text-gray-400">Focus Crash</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="text-gray-400">Strength Peak</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-purple-400" />
                    <span className="text-gray-400">Meal</span>
                </div>
            </div>
        </motion.div>
    );
}

function generate24HourData(scheduleBlocks) {
    const data = [];

    for (let h = 6; h <= 23; h++) {
        const time = `${String(h).padStart(2, "0")}:00`;
        let energy;
        let label = null;
        let marker = false;
        let markerColor = null;

        // Simulate circadian energy curve
        if (h <= 7) {
            energy = 30 + (h - 6) * 10; // Waking up, sleep inertia
            if (h === 7) { label = "Sleep inertia clearing"; }
        } else if (h <= 10) {
            energy = 60 + (h - 8) * 12; // Morning cortisol rise
            if (h === 9) { label = "🧠 Cortisol Peak — Focus Window"; marker = true; markerColor = "#10b981"; }
        } else if (h <= 12) {
            energy = 84 - (h - 10) * 5; // Slight pre-lunch decline
        } else if (h <= 14) {
            energy = 74 - (h - 12) * 12; // Post-lunch dip
            if (h === 14) { label = "⚠️ Adenosine buildup + circadian dip"; marker = true; markerColor = "#ef4444"; }
        } else if (h <= 16) {
            energy = 50 + (h - 14) * 10; // Afternoon recovery
        } else if (h <= 18) {
            energy = 70 + (h - 16) * 8; // Strength peak
            if (h === 17) { label = "💪 Core temp peak — Strength Window"; marker = true; markerColor = "#f59e0b"; }
        } else if (h <= 21) {
            energy = 86 - (h - 18) * 10; // Evening decline
        } else {
            energy = 56 - (h - 21) * 12; // Night wind-down
            if (h === 21) { label = "🌙 Melatonin onset"; marker = true; markerColor = "#8b5cf6"; }
        }

        // Add meal markers from schedule
        const matchingBlock = scheduleBlocks?.find((b) => b.time === time);
        if (matchingBlock && !label) {
            label = matchingBlock.activity;
            if (matchingBlock.type === "recovery") { marker = true; markerColor = "#8b5cf6"; }
        }

        data.push({
            time,
            energy: Math.max(10, Math.min(100, Math.round(energy + (Math.random() - 0.5) * 4))),
            label,
            marker,
            markerColor,
        });
    }

    return data;
}
