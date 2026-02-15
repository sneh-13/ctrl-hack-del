"use client";

import { motion } from "framer-motion";

interface CoachCharacterProps {
    speaking: boolean;
    mood: "happy" | "neutral" | "thinking" | "encouraging";
    stateColor: "emerald" | "amber" | "rose";
}

/**
 * Animated SVG coach character with:
 * - Idle breathing (torso moves)
 * - Eye blinking (periodic)
 * - Mouth animation when speaking
 * - Arm gesture changes based on mood
 * - Subtle head bob
 */
export function CoachCharacter({ speaking, mood, stateColor }: CoachCharacterProps) {
    const skinTone = "#D4A574";
    const skinShadow = "#C4956A";
    const hairColor = "#2C1810";
    const shirtColor =
        stateColor === "emerald" ? "#059669" : stateColor === "amber" ? "#D97706" : "#E11D48";
    const shirtHighlight =
        stateColor === "emerald" ? "#10B981" : stateColor === "amber" ? "#F59E0B" : "#F43F5E";
    const pantsColor = "#1E293B";

    return (
        <div className="relative flex items-center justify-center">
            {/* Background glow behind character */}
            <motion.div
                className={`absolute h-64 w-64 rounded-full blur-3xl ${stateColor === "emerald"
                        ? "bg-emerald-200/40"
                        : stateColor === "amber"
                            ? "bg-amber-200/40"
                            : "bg-rose-200/40"
                    }`}
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.svg
                viewBox="0 0 300 450"
                className="relative z-10 h-[420px] w-[300px]"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* ===== BODY / TORSO (breathing animation) ===== */}
                <motion.g
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Legs */}
                    <rect x="115" y="340" width="28" height="80" rx="10" fill={pantsColor} />
                    <rect x="157" y="340" width="28" height="80" rx="10" fill={pantsColor} />
                    {/* Shoes */}
                    <ellipse cx="129" cy="418" rx="20" ry="10" fill="#374151" />
                    <ellipse cx="171" cy="418" rx="20" ry="10" fill="#374151" />

                    {/* Torso */}
                    <motion.g
                        animate={{ scaleY: [1, 1.012, 1] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        style={{ transformOrigin: "150px 300px" }}
                    >
                        {/* Main torso */}
                        <path
                            d={`M 110 220 
                  Q 108 260 112 320 
                  Q 115 345 150 350 
                  Q 185 345 188 320 
                  Q 192 260 190 220 
                  Q 180 195 150 190 
                  Q 120 195 110 220`}
                            fill={shirtColor}
                        />
                        {/* Shirt highlight stripe */}
                        <path
                            d={`M 135 195 Q 150 192 165 195 L 162 350 Q 150 352 138 350 Z`}
                            fill={shirtHighlight}
                            opacity="0.3"
                        />
                        {/* Collar */}
                        <path
                            d="M 130 195 Q 150 210 170 195"
                            stroke={shirtHighlight}
                            strokeWidth="3"
                            fill="none"
                        />

                        {/* LEFT ARM */}
                        <motion.g
                            animate={
                                mood === "encouraging"
                                    ? { rotate: [0, -15, -10, -15, 0] }
                                    : mood === "happy"
                                        ? { rotate: [0, -5, 0] }
                                        : { rotate: [0, 2, 0] }
                            }
                            transition={{
                                duration: mood === "encouraging" ? 1.5 : 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            style={{ transformOrigin: "110px 210px" }}
                        >
                            {/* Upper arm */}
                            <path
                                d="M 110 210 Q 85 235 80 270"
                                stroke={shirtColor}
                                strokeWidth="26"
                                strokeLinecap="round"
                                fill="none"
                            />
                            {/* Forearm */}
                            <path
                                d="M 80 270 Q 78 290 82 310"
                                stroke={skinTone}
                                strokeWidth="20"
                                strokeLinecap="round"
                                fill="none"
                            />
                            {/* Hand */}
                            <circle cx="82" cy="312" r="12" fill={skinTone} />
                        </motion.g>

                        {/* RIGHT ARM */}
                        <motion.g
                            animate={
                                mood === "encouraging"
                                    ? { rotate: [0, 12, 8, 12, 0] }
                                    : mood === "thinking"
                                        ? { rotate: [-20, -22, -20] }
                                        : { rotate: [0, -2, 0] }
                            }
                            transition={{
                                duration: mood === "thinking" ? 2 : 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            style={{ transformOrigin: "190px 210px" }}
                        >
                            {/* Upper arm */}
                            <path
                                d="M 190 210 Q 215 235 220 270"
                                stroke={shirtColor}
                                strokeWidth="26"
                                strokeLinecap="round"
                                fill="none"
                            />
                            {/* Forearm */}
                            <path
                                d={
                                    mood === "thinking"
                                        ? "M 220 270 Q 210 250 195 235"
                                        : "M 220 270 Q 222 290 218 310"
                                }
                                stroke={skinTone}
                                strokeWidth="20"
                                strokeLinecap="round"
                                fill="none"
                            />
                            {/* Hand */}
                            <circle
                                cx={mood === "thinking" ? 195 : 218}
                                cy={mood === "thinking" ? 233 : 312}
                                r="12"
                                fill={skinTone}
                            />
                        </motion.g>
                    </motion.g>

                    {/* ===== NECK ===== */}
                    <rect x="140" y="170" width="20" height="28" rx="8" fill={skinTone} />

                    {/* ===== HEAD (subtle bob) ===== */}
                    <motion.g
                        animate={
                            speaking
                                ? { y: [0, -2, 1, -1, 0], rotate: [0, 1, -1, 0.5, 0] }
                                : { y: [0, -1.5, 0], rotate: [0, 0.5, 0] }
                        }
                        transition={{
                            duration: speaking ? 1.2 : 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        style={{ transformOrigin: "150px 150px" }}
                    >
                        {/* Head shape */}
                        <ellipse cx="150" cy="130" rx="52" ry="60" fill={skinTone} />

                        {/* Hair */}
                        <path
                            d={`M 98 120 
                  Q 98 65 150 60 
                  Q 202 65 202 120 
                  Q 200 95 180 85 
                  Q 160 78 140 80 
                  Q 115 85 105 105
                  Z`}
                            fill={hairColor}
                        />
                        {/* Side hair */}
                        <path d="M 98 110 Q 92 130 96 145" stroke={hairColor} strokeWidth="8" fill="none" strokeLinecap="round" />
                        <path d="M 202 110 Q 208 130 204 145" stroke={hairColor} strokeWidth="8" fill="none" strokeLinecap="round" />

                        {/* ===== FACE ===== */}

                        {/* Eyebrows */}
                        <motion.g
                            animate={
                                mood === "encouraging"
                                    ? { y: [-2, -3, -2] }
                                    : mood === "thinking"
                                        ? { y: [0, -1, 0] }
                                        : {}
                            }
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <path d="M 122 108 Q 130 103 140 106" stroke={hairColor} strokeWidth="3" fill="none" strokeLinecap="round" />
                            <path d="M 160 106 Q 170 103 178 108" stroke={hairColor} strokeWidth="3" fill="none" strokeLinecap="round" />
                        </motion.g>

                        {/* Eyes */}
                        <g>
                            {/* Left eye */}
                            <motion.g
                                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    times: [0, 0.85, 0.87, 0.89, 1],
                                    ease: "easeInOut",
                                }}
                                style={{ transformOrigin: "132px 118px" }}
                            >
                                <ellipse cx="132" cy="118" rx="8" ry="9" fill="white" />
                                <motion.circle
                                    cx="133"
                                    cy="118"
                                    r="5"
                                    fill="#1E293B"
                                    animate={
                                        mood === "thinking"
                                            ? { cx: [133, 136, 133] }
                                            : {}
                                    }
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                                <circle cx="135" cy="116" r="2" fill="white" />
                            </motion.g>

                            {/* Right eye */}
                            <motion.g
                                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    times: [0, 0.85, 0.87, 0.89, 1],
                                    ease: "easeInOut",
                                }}
                                style={{ transformOrigin: "168px 118px" }}
                            >
                                <ellipse cx="168" cy="118" rx="8" ry="9" fill="white" />
                                <motion.circle
                                    cx="169"
                                    cy="118"
                                    r="5"
                                    fill="#1E293B"
                                    animate={
                                        mood === "thinking"
                                            ? { cx: [169, 172, 169] }
                                            : {}
                                    }
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                                <circle cx="171" cy="116" r="2" fill="white" />
                            </motion.g>
                        </g>

                        {/* Nose */}
                        <path d="M 148 126 Q 150 134 152 126" stroke={skinShadow} strokeWidth="2" fill="none" strokeLinecap="round" />

                        {/* Mouth */}
                        <motion.g>
                            {speaking ? (
                                /* Speaking mouth — animating open/close */
                                <motion.ellipse
                                    cx="150"
                                    cy="148"
                                    rx="10"
                                    fill="#B91C1C"
                                    animate={{
                                        ry: [3, 7, 4, 8, 3, 6, 3],
                                        rx: [10, 8, 10, 9, 10, 8, 10],
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />
                            ) : mood === "happy" || mood === "encouraging" ? (
                                /* Smile */
                                <path
                                    d="M 135 145 Q 143 158 150 158 Q 157 158 165 145"
                                    stroke={skinShadow}
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                />
                            ) : mood === "thinking" ? (
                                /* Slight purse */
                                <ellipse cx="150" cy="148" rx="6" ry="4" fill={skinShadow} />
                            ) : (
                                /* Neutral slight smile */
                                <path
                                    d="M 138 147 Q 144 153 150 153 Q 156 153 162 147"
                                    stroke={skinShadow}
                                    strokeWidth="2.5"
                                    fill="none"
                                    strokeLinecap="round"
                                />
                            )}
                        </motion.g>

                        {/* Ears */}
                        <ellipse cx="98" cy="128" rx="8" ry="12" fill={skinTone} />
                        <ellipse cx="98" cy="128" rx="5" ry="8" fill={skinShadow} opacity="0.3" />
                        <ellipse cx="202" cy="128" rx="8" ry="12" fill={skinTone} />
                        <ellipse cx="202" cy="128" rx="5" ry="8" fill={skinShadow} opacity="0.3" />
                    </motion.g>
                </motion.g>
            </motion.svg>
        </div>
    );
}
