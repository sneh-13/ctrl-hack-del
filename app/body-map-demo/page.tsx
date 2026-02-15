"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { SiteNav } from "@/components/site/site-nav";
import { Button } from "@/components/ui/button";
import { BodyMapDisplay } from "@/components/aura/body-map-display";
import { MuscleGroupChecklist } from "@/components/aura/muscle-group-checklist";
import {
  MUSCLE_GROUPS,
  STATUS_COLOR,
  STATUS_LABEL,
  PREVIEW_COLOR,
  type StatusType,
} from "@/lib/bodymap-data";

const STATUS_LIST = Object.keys(STATUS_LABEL) as StatusType[];

export default function BodyMapDemoPage() {
  const [view, setView] = useState<"front" | "back">("front");
  const [statusByGroup, setStatusByGroup] = useState<Record<string, StatusType | undefined>>({});
  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);

  const markedCount = Object.values(statusByGroup).filter(Boolean).length;

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <SiteNav current="dashboard" />

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-slate-900">
              Muscle Status Map
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Hover a group to preview it · click to cycle its status
            </p>
          </div>

          <div className="flex items-center gap-2">
            {markedCount > 0 && (
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                {markedCount} marked
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusByGroup({})}
              className="border-slate-200 text-slate-600"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Clear all
            </Button>
          </div>
        </div>

        {/* Main layout
            Mobile:  map on top, checklist below (single column)
            Desktop: checklist on left (flex-1), diagram on right (fixed width)
        */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* ── Checklist ────────────────────────────────────────────────── */}
          <div className="order-2 lg:order-1 lg:flex-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Muscle Groups
              </p>
              <MuscleGroupChecklist
                groups={MUSCLE_GROUPS}
                statusByGroup={statusByGroup}
                setStatusByGroup={setStatusByGroup}
                hoveredGroupKey={hoveredGroupKey}
                setHoveredGroupKey={setHoveredGroupKey}
              />
            </div>
          </div>

          {/* ── Diagram panel ─────────────────────────────────────────────── */}
          <div className="order-1 flex flex-col gap-3 lg:order-2 lg:w-56 lg:shrink-0">

            {/* Front / Back toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={view === "front" ? "default" : "outline"}
                className="h-8 flex-1"
                onClick={() => setView("front")}
              >
                Front
              </Button>
              <Button
                type="button"
                variant={view === "back" ? "default" : "outline"}
                className="h-8 flex-1"
                onClick={() => setView("back")}
              >
                Back
              </Button>
            </div>

            {/* Body map */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <BodyMapDisplay
                view={view}
                statusByGroup={statusByGroup}
                hoveredGroupKey={hoveredGroupKey}
                groups={MUSCLE_GROUPS}
              />
            </div>

            {/* Legend */}
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Legend
              </p>
              <div className="space-y-1.5">
                {STATUS_LIST.map((status) => (
                  <div key={status} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_COLOR[status] }}
                    />
                    <span className="text-xs text-slate-600">{STATUS_LABEL[status]}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: PREVIEW_COLOR }}
                  />
                  <span className="text-xs text-slate-500">Hover preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
