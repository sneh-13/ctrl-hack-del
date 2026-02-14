"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "⚡" },
    { id: "sleep", label: "Sleep", icon: "🌙" },
    { id: "nutrition", label: "Nutrition", icon: "🍎" },
    { id: "body", label: "Body Map", icon: "🧬" },
];

export default function Sidebar({ activeTab, setActiveTab, energyLevel = 6 }) {
    return (
        <motion.aside
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-20 lg:w-64 h-screen fixed left-0 top-0 glass-card rounded-none border-l-0 border-t-0 border-b-0 flex flex-col items-center lg:items-stretch py-6 px-2 lg:px-4 z-50"
        >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xl font-bold glow-blue">
                    B
                </div>
                <span className="hidden lg:block text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent"
                    style={{ fontFamily: "var(--font-outfit)" }}>
                    BioSync
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => (
                    <motion.button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${activeTab === item.id
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="hidden lg:block text-sm font-medium">{item.label}</span>
                    </motion.button>
                ))}
            </nav>

            {/* Energy Status */}
            <div className="glass-card p-3 mt-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400 hidden lg:block">Energy Level</span>
                    <span className="text-lg">{energyLevel > 7 ? "🔥" : energyLevel > 4 ? "⚡" : "😴"}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${energyLevel * 10}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-2 rounded-full ${energyLevel > 7
                                ? "bg-gradient-to-r from-green-500 to-emerald-400"
                                : energyLevel > 4
                                    ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                                    : "bg-gradient-to-r from-amber-500 to-orange-400"
                            }`}
                    />
                </div>
                <span className="text-xs text-gray-500 mt-1 hidden lg:block">{energyLevel}/10</span>
            </div>
        </motion.aside>
    );
}
