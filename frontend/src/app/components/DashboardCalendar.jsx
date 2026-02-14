"use client";
import { motion, AnimatePresence } from "framer-motion";

const typeColors = {
    focus: { bg: "block-focus", text: "text-blue-300", dot: "bg-blue-400" },
    strength: { bg: "block-strength", text: "text-amber-300", dot: "bg-amber-400" },
    recovery: { bg: "block-recovery", text: "text-emerald-300", dot: "bg-emerald-400" },
    light: { bg: "block-light", text: "text-purple-300", dot: "bg-purple-400" },
};

export default function DashboardCalendar({ scheduleBlocks = [], primeTime = null }) {
    if (!scheduleBlocks.length && !primeTime) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card flex flex-col items-center justify-center py-12 text-gray-500"
            >
                <span className="text-4xl mb-3">📅</span>
                <p className="text-sm">Submit your data to see your optimized schedule</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card"
        >
            <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
                📅 Your Optimized Day
            </h3>

            {/* Biological Prime Time Highlights */}
            {primeTime && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-3 glow-blue"
                    >
                        <div className="text-xs text-gray-400 mb-1">🧠 Focus Peak</div>
                        <div className="text-blue-300 font-bold text-sm">
                            {primeTime.focus_peak?.start} – {primeTime.focus_peak?.end}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{primeTime.focus_peak?.reason}</div>
                    </motion.div>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-3 glow-amber"
                    >
                        <div className="text-xs text-gray-400 mb-1">💪 Strength Peak</div>
                        <div className="text-amber-300 font-bold text-sm">
                            {primeTime.strength_peak?.start} – {primeTime.strength_peak?.end}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{primeTime.strength_peak?.reason}</div>
                    </motion.div>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-3 border-red-500/20"
                        style={{ boxShadow: "0 0 20px rgba(239,68,68,0.15)" }}
                    >
                        <div className="text-xs text-gray-400 mb-1">⚠️ Focus Crash</div>
                        <div className="text-red-300 font-bold text-sm">
                            {primeTime.focus_crash?.start} – {primeTime.focus_crash?.end}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{primeTime.focus_crash?.reason}</div>
                    </motion.div>
                </div>
            )}

            {/* Schedule Timeline */}
            <div className="space-y-2">
                <AnimatePresence>
                    {scheduleBlocks.map((block, index) => {
                        const colors = typeColors[block.type] || typeColors.light;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                className={`${colors.bg} rounded-xl px-4 py-3 flex items-center gap-4`}
                            >
                                <div className="text-sm font-mono text-gray-300 w-14 shrink-0">
                                    {block.time}
                                </div>
                                <div className={`w-2 h-2 rounded-full ${colors.dot} shrink-0`} />
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-medium ${colors.text}`}>{block.activity}</div>
                                    <div className="text-xs text-gray-500 truncate">{block.reason}</div>
                                </div>
                                <div className="text-xs text-gray-500 shrink-0">{block.duration_min}m</div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
