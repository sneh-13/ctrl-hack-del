"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar";
import InputForms from "./components/InputForms";
import DashboardCalendar from "./components/DashboardCalendar";
import GlucoseCurve from "./components/GlucoseCurve";
import SleepScheduler from "./components/SleepScheduler";
import BodyHeatmap from "./components/BodyHeatmap";
import EnergyTimeline from "./components/EnergyTimeline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(6);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setEnergyLevel(formData.energy_level);
    try {
      const res = await fetch(`${API_BASE}/api/coach/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setScheduleData(data);
    } catch (e) {
      // If backend is unreachable, use mock
      try {
        const mockRes = await fetch(`${API_BASE}/api/coach/mock`);
        const mockData = await mockRes.json();
        setScheduleData(mockData);
      } catch {
        // Full fallback: client-side mock
        setScheduleData(getClientMock(formData));
      }
    }
    setLoading(false);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} energyLevel={energyLevel} />

      {/* Main Content */}
      <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1
            className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Circadian Rhythm Optimizer
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            AI-powered Biological Prime Time scheduling • Backed by chronobiology science
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left column: Input + Calendar */}
                <div className="xl:col-span-1 space-y-6">
                  <InputForms onSubmit={handleSubmit} loading={loading} />
                </div>

                {/* Right column: Schedule + Energy */}
                <div className="xl:col-span-2 space-y-6">
                  <DashboardCalendar
                    scheduleBlocks={scheduleData?.schedule_blocks || []}
                    primeTime={scheduleData?.biological_prime_time || null}
                  />
                  <EnergyTimeline
                    alerts={scheduleData?.alerts || []}
                    scheduleBlocks={scheduleData?.schedule_blocks || []}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "sleep" && (
            <motion.div
              key="sleep"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <SleepScheduler />
            </motion.div>
          )}

          {activeTab === "nutrition" && (
            <motion.div
              key="nutrition"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <GlucoseCurve />
            </motion.div>
          )}

          {activeTab === "body" && (
            <motion.div
              key="body"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <BodyHeatmap />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function getClientMock(formData) {
  const wakeH = parseInt(formData.wake_time?.split(":")[0] || "7");
  return {
    biological_prime_time: {
      focus_peak: { start: `${(wakeH + 2) % 24}:00`, end: `${(wakeH + 4) % 24}:00`, reason: "Cortisol awakening response peaks ~2h post-wake." },
      strength_peak: { start: "16:00", end: "18:00", reason: "Core body temperature maximum in late afternoon." },
      focus_crash: { start: `${(wakeH + 7) % 24}:00`, end: `${(wakeH + 8) % 24}:00`, reason: "Post-lunch circadian dip + adenosine buildup." },
    },
    schedule_blocks: [
      { time: `${wakeH}:00`, duration_min: 30, activity: "Light Movement & Hydration", type: "recovery", reason: "Sleep inertia clearance" },
      { time: `${wakeH + 1}:00`, duration_min: 60, activity: "Breakfast & Planning", type: "light", reason: "Break overnight fast, stabilize glucose" },
      { time: `${wakeH + 2}:00`, duration_min: 120, activity: "Deep Work Block", type: "focus", reason: "Peak cortisol + low adenosine = max focus" },
      { time: `${wakeH + 4}:00`, duration_min: 30, activity: "Active Break", type: "recovery", reason: "Ultradian rhythm reset" },
      { time: `${wakeH + 5}:00`, duration_min: 90, activity: "Secondary Focus", type: "focus", reason: "Sustained cortisol window" },
      { time: `${wakeH + 7}:00`, duration_min: 60, activity: "Light Tasks", type: "light", reason: "Circadian dip — conserve energy" },
      { time: "16:00", duration_min: 90, activity: "High Intensity Training", type: "strength", reason: "Core temp peak, optimal T:C ratio" },
      { time: "18:00", duration_min: 60, activity: "Recovery & Dinner", type: "recovery", reason: "Anabolic window — mTOR activation" },
      { time: "20:00", duration_min: 90, activity: "Light Study / Review", type: "light", reason: "Memory consolidation prep" },
      { time: "21:30", duration_min: 60, activity: "Wind Down", type: "recovery", reason: "Melatonin onset support" },
    ],
    alerts: [
      { time: `${(wakeH + 7) % 24}:00`, type: "warning", message: "⚡ Focus Crash incoming! Take a 20-min nap or walk outside." },
      { time: "15:30", type: "tip", message: "🏋️ Pre-workout window: 30-50g complex carbs now." },
      { time: "20:00", type: "info", message: "🧠 Evening cortisol dropping — review mode, not acquisition." },
    ],
    meal_recommendations: [
      { time: `${wakeH + 1}:00`, type: "balanced", reason: "Post-fast stabilization" },
      { time: "15:30", type: "high-carb", reason: "Pre-workout glycogen loading" },
      { time: "18:00", type: "high-protein", reason: "Post-workout mTOR activation" },
    ],
  };
}
