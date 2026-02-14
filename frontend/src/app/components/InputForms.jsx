"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function InputForms({ onSubmit, loading }) {
    const [formData, setFormData] = useState({
        bedtime: "23:00",
        wake_time: "07:00",
        sleep_quality: 7,
        last_meal: "chicken and rice",
        last_meal_time: "12:30",
        energy_level: 6,
        mood: "neutral",
        workout_type: "strength training",
        workout_time: "16:00",
    });

    const moods = ["exhausted", "tired", "neutral", "good", "energized"];

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="glass-card space-y-5"
        >
            <h3 className="text-lg font-semibold text-blue-300" style={{ fontFamily: "var(--font-outfit)" }}>
                📊 Log Your Data
            </h3>

            {/* Sleep Section */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Bedtime</label>
                    <input
                        type="time"
                        value={formData.bedtime}
                        onChange={(e) => handleChange("bedtime", e.target.value)}
                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Wake Time</label>
                    <input
                        type="time"
                        value={formData.wake_time}
                        onChange={(e) => handleChange("wake_time", e.target.value)}
                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Sleep Quality Slider */}
            <div>
                <label className="text-xs text-gray-400 block mb-2">
                    Sleep Quality: <span className="text-blue-300 font-semibold">{formData.sleep_quality}/10</span>
                </label>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.sleep_quality}
                    onChange={(e) => handleChange("sleep_quality", parseInt(e.target.value))}
                    className="w-full"
                />
            </div>

            {/* Meal Section */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Last Meal</label>
                    <input
                        type="text"
                        value={formData.last_meal}
                        onChange={(e) => handleChange("last_meal", e.target.value)}
                        placeholder="What did you eat?"
                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Meal Time</label>
                    <input
                        type="time"
                        value={formData.last_meal_time}
                        onChange={(e) => handleChange("last_meal_time", e.target.value)}
                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Energy Level */}
            <div>
                <label className="text-xs text-gray-400 block mb-2">
                    Energy Level: <span className="text-amber-300 font-semibold">{formData.energy_level}/10</span>
                </label>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.energy_level}
                    onChange={(e) => handleChange("energy_level", parseInt(e.target.value))}
                    className="w-full"
                />
            </div>

            {/* Mood */}
            <div>
                <label className="text-xs text-gray-400 block mb-2">Mood</label>
                <div className="flex gap-2">
                    {moods.map((mood) => (
                        <button
                            key={mood}
                            type="button"
                            onClick={() => handleChange("mood", mood)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formData.mood === mood
                                    ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                                    : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600"
                                }`}
                        >
                            {mood}
                        </button>
                    ))}
                </div>
            </div>

            {/* Workout */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Workout Type</label>
                    <select
                        value={formData.workout_type}
                        onChange={(e) => handleChange("workout_type", e.target.value)}
                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                    >
                        <option value="strength training">Strength Training</option>
                        <option value="cardio">Cardio</option>
                        <option value="HIIT">HIIT</option>
                        <option value="yoga">Yoga</option>
                        <option value="none">Rest Day</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Workout Time</label>
                    <input
                        type="time"
                        value={formData.workout_time}
                        onChange={(e) => handleChange("workout_time", e.target.value)}
                        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Submit */}
            <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed glow-blue"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing...
                    </span>
                ) : (
                    "🧠 Optimize My Schedule"
                )}
            </motion.button>
        </motion.form>
    );
}
