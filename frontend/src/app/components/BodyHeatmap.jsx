"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Muscle groups with SVG path data for a front-facing human silhouette
const muscleGroups = {
    head: {
        label: "Head",
        path: "M 150,25 C 150,15 155,5 165,5 C 175,5 180,15 180,25 C 180,40 175,48 165,48 C 155,48 150,40 150,25 Z",
        cx: 165, cy: 25,
    },
    neck: {
        label: "Neck",
        path: "M 158,48 L 158,58 C 158,60 172,60 172,58 L 172,48 Z",
        cx: 165, cy: 53,
    },
    shoulders: {
        label: "Shoulders",
        path: "M 125,62 C 135,58 145,58 158,60 L 172,60 C 185,58 195,58 205,62 L 205,72 C 195,68 185,67 172,70 L 158,70 C 145,67 135,68 125,72 Z",
        cx: 165, cy: 65,
    },
    chest: {
        label: "Chest",
        path: "M 135,72 C 140,70 155,70 165,70 C 175,70 190,70 195,72 L 195,100 C 190,105 175,108 165,108 C 155,108 140,105 135,100 Z",
        cx: 165, cy: 88,
    },
    biceps_l: {
        label: "Left Bicep",
        path: "M 120,72 C 118,70 115,72 115,78 L 110,105 C 110,110 118,110 120,108 L 130,78 C 132,72 125,70 120,72 Z",
        cx: 120, cy: 90,
    },
    biceps_r: {
        label: "Right Bicep",
        path: "M 210,72 C 212,70 215,72 215,78 L 220,105 C 220,110 212,110 210,108 L 200,78 C 198,72 205,70 210,72 Z",
        cx: 210, cy: 90,
    },
    core: {
        label: "Core",
        path: "M 145,108 C 150,110 160,112 165,112 C 170,112 180,110 185,108 L 185,150 C 180,155 170,158 165,158 C 160,158 150,155 145,150 Z",
        cx: 165, cy: 132,
    },
    forearm_l: {
        label: "Left Forearm",
        path: "M 105,110 L 95,148 C 93,152 100,153 102,150 L 112,115 C 114,112 108,108 105,110 Z",
        cx: 103, cy: 130,
    },
    forearm_r: {
        label: "Right Forearm",
        path: "M 225,110 L 235,148 C 237,152 230,153 228,150 L 218,115 C 216,112 222,108 225,110 Z",
        cx: 228, cy: 130,
    },
    quads_l: {
        label: "Left Quad",
        path: "M 140,160 L 135,220 C 135,225 155,225 155,220 L 160,160 Z",
        cx: 148, cy: 190,
    },
    quads_r: {
        label: "Right Quad",
        path: "M 170,160 L 175,220 C 175,225 195,225 195,220 L 190,160 Z",
        cx: 183, cy: 190,
    },
    calves_l: {
        label: "Left Calf",
        path: "M 136,228 L 133,285 C 133,290 152,290 152,285 L 155,228 Z",
        cx: 144, cy: 258,
    },
    calves_r: {
        label: "Right Calf",
        path: "M 178,228 L 175,285 C 175,290 197,290 197,285 L 194,228 Z",
        cx: 186, cy: 258,
    },
};

// Fatigue colors (0-100%)
const getFatigueColor = (fatigue) => {
    if (fatigue === 0) return "#1f2937"; // idle/gray
    if (fatigue < 30) return "#10b981"; // recovered (green)
    if (fatigue < 60) return "#f59e0b"; // moderate (amber)
    if (fatigue < 80) return "#f97316"; // tired (orange)
    return "#ef4444"; // exhausted (red)
};

const getGlowIntensity = (fatigue) => {
    if (fatigue === 0) return "none";
    const intensity = Math.min(fatigue / 100, 1);
    const color = getFatigueColor(fatigue);
    return `drop-shadow(0 0 ${4 + intensity * 12}px ${color})`;
};

export default function BodyHeatmap({ workoutData = null }) {
    const [selectedMuscle, setSelectedMuscle] = useState(null);
    const [energyCore, setEnergyCore] = useState(75); // 0-100, fades after meals

    // Default workout data showing muscle fatigue
    const defaultFatigue = {
        chest: 70,
        biceps_l: 45, biceps_r: 45,
        shoulders: 60,
        core: 30,
        quads_l: 0, quads_r: 0,
        calves_l: 0, calves_r: 0,
        forearm_l: 35, forearm_r: 35,
        head: 0, neck: 10,
    };

    const fatigue = workoutData?.muscle_fatigue || defaultFatigue;

    const presetWorkouts = [
        { label: "Push Day", muscles: { chest: 80, shoulders: 70, biceps_l: 20, biceps_r: 20, forearm_l: 40, forearm_r: 40, core: 30 } },
        { label: "Pull Day", muscles: { biceps_l: 75, biceps_r: 75, forearm_l: 60, forearm_r: 60, shoulders: 40, core: 25 } },
        { label: "Leg Day", muscles: { quads_l: 90, quads_r: 90, calves_l: 70, calves_r: 70, core: 40 } },
        { label: "Rest Day", muscles: {} },
    ];

    const [activeFatigue, setActiveFatigue] = useState(fatigue);
    const [activePreset, setActivePreset] = useState(null);

    const applyPreset = (preset, index) => {
        const newFatigue = {};
        Object.keys(muscleGroups).forEach((key) => {
            newFatigue[key] = preset.muscles[key] || 0;
        });
        setActiveFatigue(newFatigue);
        setActivePreset(index);
        setSelectedMuscle(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card"
        >
            <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
                🧬 Physiological Heatmap
            </h3>
            <p className="text-xs text-gray-400 mb-4">
                Muscle fatigue & recovery visualization. Click a workout type or muscle group.
            </p>

            {/* Workout Presets */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {presetWorkouts.map((preset, i) => (
                    <motion.button
                        key={i}
                        onClick={() => applyPreset(preset, i)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activePreset === i
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                                : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600"
                            }`}
                    >
                        {preset.label}
                    </motion.button>
                ))}
            </div>

            <div className="flex gap-6 items-start">
                {/* SVG Body */}
                <div className="relative flex-shrink-0">
                    <svg viewBox="80 0 170 300" width="200" height="350" className="drop-shadow-lg">
                        {/* Background glow for energy core */}
                        <motion.circle
                            cx="165" cy="132" r="35"
                            fill={`rgba(59, 130, 246, ${energyCore / 300})`}
                            animate={{
                                r: [30, 38, 30],
                                opacity: [energyCore / 200, energyCore / 100, energyCore / 200],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Muscle groups */}
                        {Object.entries(muscleGroups).map(([key, muscle]) => {
                            const fat = activeFatigue[key] || 0;
                            const color = getFatigueColor(fat);
                            const isSelected = selectedMuscle === key;

                            return (
                                <motion.path
                                    key={key}
                                    d={muscle.path}
                                    fill={color}
                                    stroke={isSelected ? "#ffffff" : "rgba(255,255,255,0.1)"}
                                    strokeWidth={isSelected ? 2 : 0.5}
                                    style={{ filter: getGlowIntensity(fat), cursor: "pointer" }}
                                    onClick={() => setSelectedMuscle(key === selectedMuscle ? null : key)}
                                    whileHover={{ scale: 1.05 }}
                                    animate={{
                                        fill: color,
                                        filter: getGlowIntensity(fat),
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className={fat > 50 ? "muscle-active" : ""}
                                />
                            );
                        })}
                    </svg>
                </div>

                {/* Info Panel */}
                <div className="flex-1 space-y-3">
                    {/* Energy Core */}
                    <div className="glass-card p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400">⚡ Energy Core</span>
                            <span className="text-sm font-bold text-blue-300">{energyCore}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <motion.div
                                animate={{ width: `${energyCore}%` }}
                                className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <input
                            type="range"
                            min="0" max="100"
                            value={energyCore}
                            onChange={(e) => setEnergyCore(parseInt(e.target.value))}
                            className="w-full mt-2"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Simulates energy fading after meals</p>
                    </div>

                    {/* Selected muscle info */}
                    <AnimatePresence>
                        {selectedMuscle && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="glass-card p-3"
                            >
                                <div className="font-medium text-sm" style={{ color: getFatigueColor(activeFatigue[selectedMuscle] || 0) }}>
                                    {muscleGroups[selectedMuscle]?.label}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Fatigue: {activeFatigue[selectedMuscle] || 0}%
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Recovery time: ~{Math.round((activeFatigue[selectedMuscle] || 0) * 0.72)}h
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                                    <div
                                        className="h-1.5 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${activeFatigue[selectedMuscle] || 0}%`,
                                            backgroundColor: getFatigueColor(activeFatigue[selectedMuscle] || 0),
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Legend */}
                    <div className="glass-card p-3">
                        <div className="text-xs text-gray-400 mb-2">Fatigue Scale</div>
                        <div className="flex gap-2 text-[10px]">
                            {[
                                { color: "#1f2937", label: "Idle" },
                                { color: "#10b981", label: "Fresh" },
                                { color: "#f59e0b", label: "Moderate" },
                                { color: "#f97316", label: "Tired" },
                                { color: "#ef4444", label: "Exhausted" },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                                    <span className="text-gray-500">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
