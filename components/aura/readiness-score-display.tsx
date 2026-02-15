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
    lightBg: string;
    Icon: typeof CheckCircle2;
  }
> = {
  green: {
    label: "GO",
    title: "Prime for heavy lifting",
    color: "#15803d",
    lightBg: "#dcfce7",
    Icon: CheckCircle2,
  },
  yellow: {
    label: "CAUTION",
    title: "Moderate load recommended",
    color: "#b45309",
    lightBg: "#fef3c7",
    Icon: Activity,
  },
  red: {
    label: "NO-GO",
    title: "Recovery focus day",
    color: "#be123c",
    lightBg: "#ffe4e6",
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
          <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5">
            <active.Icon className="h-4 w-4" style={{ color: active.color }} />
            <span className="text-xs font-semibold tracking-[0.18em] text-slate-600 uppercase">{active.label}</span>
          </div>

          <div className="mx-auto grid w-[84px] gap-3 rounded-2xl border border-slate-200 bg-white p-3">
            {(["red", "yellow", "green"] as const).map((light) => {
              const isActive = light === readiness.state;
              return (
                <motion.div
                  key={light}
                  animate={{
                    opacity: isActive ? 1 : 0.35,
                    scale: isActive ? 1.04 : 0.94,
                  }}
                  transition={{ duration: 0.28 }}
                  className="h-14 w-14 rounded-full border border-slate-200"
                  style={{ backgroundColor: stateConfig[light].lightBg }}
                />
              );
            })}
          </div>

          <div>
            <div className="text-6xl font-semibold leading-none text-slate-900">{readiness.score}</div>
            <div className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Readiness Score</div>
          </div>

          <p className="max-w-xs text-sm text-slate-600">{active.title}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
