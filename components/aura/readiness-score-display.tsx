"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

import type { ReadinessScore, ReadinessState } from "@/types";

interface ReadinessScoreDisplayProps {
  readiness: ReadinessScore;
}

const stateConfig: Record<
  ReadinessState,
  {
    label: string;
    title: string;
    color: string;
    bg: string;
    glow: string;
    Icon: typeof CheckCircle2;
  }
> = {
  green: {
    label: "GO",
    title: "Prime for heavy lifting",
    color: "#39ff14",
    bg: "bg-[#39ff14]",
    glow: "0 0 40px rgba(57,255,20,0.55)",
    Icon: CheckCircle2,
  },
  yellow: {
    label: "CAUTION",
    title: "Moderate load recommended",
    color: "#ffb020",
    bg: "bg-[#ffb020]",
    glow: "0 0 40px rgba(255,176,32,0.48)",
    Icon: Activity,
  },
  red: {
    label: "NO-GO",
    title: "Recovery focus day",
    color: "#ff355e",
    bg: "bg-[#ff355e]",
    glow: "0 0 40px rgba(255,53,94,0.52)",
    Icon: AlertTriangle,
  },
};

export function ReadinessScoreDisplay({ readiness }: ReadinessScoreDisplayProps) {
  const active = stateConfig[readiness.state];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={readiness.state}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-white/15 px-4 py-1.5">
            <active.Icon className="h-4 w-4" style={{ color: active.color }} />
            <span className="text-xs tracking-[0.24em] text-slate-300 uppercase">{active.label}</span>
          </div>

          <div className="mx-auto grid w-[84px] gap-3 rounded-2xl border border-white/15 bg-slate-950/70 p-3">
            {(["red", "yellow", "green"] as const).map((light) => {
              const isActive = light === readiness.state;
              return (
                <motion.div
                  key={light}
                  animate={{
                    opacity: isActive ? 1 : 0.25,
                    scale: isActive ? 1.05 : 0.95,
                    boxShadow: isActive ? stateConfig[light].glow : "none",
                  }}
                  transition={{ duration: 0.28 }}
                  className={`h-14 w-14 rounded-full ${stateConfig[light].bg}`}
                />
              );
            })}
          </div>

          <div>
            <div className="font-display text-6xl leading-none text-white">{readiness.score}</div>
            <div className="text-xs tracking-[0.22em] text-slate-300 uppercase">Readiness Score</div>
          </div>

          <p className="max-w-xs text-sm text-slate-300">{active.title}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
