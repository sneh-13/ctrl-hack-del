"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MuscleGroup, SorenessLevel } from "@/types";

type BodySide = "front" | "back";

type RectShape = {
  side: BodySide;
  group: MuscleGroup;
  shape: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
};

type EllipseShape = {
  side: BodySide;
  group: MuscleGroup;
  shape: "ellipse";
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

type BodyShape = RectShape | EllipseShape;

const sorenessColor: Record<SorenessLevel, string> = {
  0: "rgba(34, 197, 94, 0.82)",
  1: "rgba(251, 191, 36, 0.88)",
  2: "rgba(239, 68, 68, 0.9)",
};

const sorenessLabel: Record<SorenessLevel, string> = {
  0: "Recovered",
  1: "Recovering",
  2: "Sore",
};

const bodyShapes: BodyShape[] = [
  { side: "front", group: "shoulders", shape: "ellipse", cx: 66, cy: 70, rx: 18, ry: 12 },
  { side: "front", group: "shoulders", shape: "ellipse", cx: 134, cy: 70, rx: 18, ry: 12 },
  { side: "front", group: "chest", shape: "rect", x: 62, y: 84, width: 76, height: 34, rx: 14 },
  { side: "front", group: "biceps", shape: "ellipse", cx: 47, cy: 111, rx: 12, ry: 23 },
  { side: "front", group: "biceps", shape: "ellipse", cx: 153, cy: 111, rx: 12, ry: 23 },
  { side: "front", group: "forearms", shape: "ellipse", cx: 44, cy: 154, rx: 11, ry: 24 },
  { side: "front", group: "forearms", shape: "ellipse", cx: 156, cy: 154, rx: 11, ry: 24 },
  { side: "front", group: "abs", shape: "rect", x: 73, y: 121, width: 54, height: 56, rx: 14 },
  { side: "front", group: "quads", shape: "rect", x: 72, y: 191, width: 22, height: 60, rx: 10 },
  { side: "front", group: "quads", shape: "rect", x: 106, y: 191, width: 22, height: 60, rx: 10 },
  { side: "front", group: "calves", shape: "rect", x: 72, y: 258, width: 20, height: 50, rx: 10 },
  { side: "front", group: "calves", shape: "rect", x: 108, y: 258, width: 20, height: 50, rx: 10 },

  { side: "back", group: "shoulders", shape: "ellipse", cx: 66, cy: 72, rx: 18, ry: 12 },
  { side: "back", group: "shoulders", shape: "ellipse", cx: 134, cy: 72, rx: 18, ry: 12 },
  { side: "back", group: "traps", shape: "rect", x: 74, y: 84, width: 52, height: 22, rx: 10 },
  { side: "back", group: "lats", shape: "rect", x: 58, y: 106, width: 28, height: 62, rx: 12 },
  { side: "back", group: "lats", shape: "rect", x: 114, y: 106, width: 28, height: 62, rx: 12 },
  { side: "back", group: "triceps", shape: "ellipse", cx: 47, cy: 128, rx: 12, ry: 24 },
  { side: "back", group: "triceps", shape: "ellipse", cx: 153, cy: 128, rx: 12, ry: 24 },
  { side: "back", group: "lower_back", shape: "rect", x: 76, y: 168, width: 48, height: 36, rx: 12 },
  { side: "back", group: "glutes", shape: "rect", x: 74, y: 206, width: 24, height: 34, rx: 10 },
  { side: "back", group: "glutes", shape: "rect", x: 102, y: 206, width: 24, height: 34, rx: 10 },
  { side: "back", group: "hamstrings", shape: "rect", x: 72, y: 243, width: 24, height: 58, rx: 10 },
  { side: "back", group: "hamstrings", shape: "rect", x: 104, y: 243, width: 24, height: 58, rx: 10 },
  { side: "back", group: "calves", shape: "rect", x: 72, y: 306, width: 20, height: 44, rx: 10 },
  { side: "back", group: "calves", shape: "rect", x: 108, y: 306, width: 20, height: 44, rx: 10 },
];

interface InteractiveBodyMapProps {
  value: Record<MuscleGroup, SorenessLevel>;
  onChange?: (next: Record<MuscleGroup, SorenessLevel>) => void;
  interactive?: boolean;
  className?: string;
}

export function InteractiveBodyMap({
  value,
  onChange,
  interactive = true,
  className,
}: InteractiveBodyMapProps) {
  const [side, setSide] = useState<BodySide>("front");

  const visibleShapes = useMemo(
    () => bodyShapes.filter((shape) => shape.side === side),
    [side],
  );

  const toggleGroup = (group: MuscleGroup) => {
    if (!interactive || !onChange) return;
    const current = value[group] ?? 0;
    const nextLevel = ((current + 1) % 3) as SorenessLevel;
    onChange({
      ...value,
      [group]: nextLevel,
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={side === "front" ? "default" : "outline"}
          onClick={() => setSide("front")}
          className="h-8"
        >
          Front
        </Button>
        <Button
          type="button"
          variant={side === "back" ? "default" : "outline"}
          onClick={() => setSide("back")}
          className="h-8"
        >
          Back
        </Button>

        {interactive && onChange ? (
          <Button
            type="button"
            variant="ghost"
            className="ml-auto h-8 text-slate-300"
            onClick={() => onChange(Object.fromEntries(Object.keys(value).map((key) => [key, 0])) as Record<MuscleGroup, SorenessLevel>)}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset
          </Button>
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <svg viewBox="0 0 200 360" className="mx-auto h-[320px] w-full max-w-[220px]">
          <circle cx="100" cy="30" r="16" fill="rgba(148,163,184,0.18)" stroke="rgba(148,163,184,0.4)" />
          <rect x="68" y="50" width="64" height="140" rx="30" fill="rgba(148,163,184,0.12)" stroke="rgba(148,163,184,0.25)" />
          <rect x="72" y="190" width="56" height="54" rx="20" fill="rgba(148,163,184,0.1)" stroke="rgba(148,163,184,0.2)" />
          <rect x="70" y="242" width="24" height="108" rx="14" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.18)" />
          <rect x="106" y="242" width="24" height="108" rx="14" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.18)" />
          <rect x="28" y="90" width="20" height="102" rx="12" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.18)" />
          <rect x="152" y="90" width="20" height="102" rx="12" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.18)" />

          {visibleShapes.map((shape, index) => {
            const level = value[shape.group] ?? 0;
            const commonProps = {
              fill: sorenessColor[level],
              stroke: "rgba(10, 15, 22, 0.85)",
              strokeWidth: 1.2,
              onClick: () => toggleGroup(shape.group),
              style: {
                cursor: interactive ? "pointer" : "default",
              },
            };

            if (shape.shape === "rect") {
              return (
                <rect
                  key={`${shape.group}-${index}`}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  rx={shape.rx}
                  {...commonProps}
                >
                  <title>{`${shape.group.replace("_", " ")} · ${sorenessLabel[level]}`}</title>
                </rect>
              );
            }

            return (
              <ellipse
                key={`${shape.group}-${index}`}
                cx={shape.cx}
                cy={shape.cy}
                rx={shape.rx}
                ry={shape.ry}
                {...commonProps}
              >
                <title>{`${shape.group.replace("_", " ")} · ${sorenessLabel[level]}`}</title>
              </ellipse>
            );
          })}
        </svg>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] uppercase">
          {(Object.keys(sorenessColor) as Array<`${SorenessLevel}`>).map((key) => {
            const level = Number(key) as SorenessLevel;
            return (
              <div key={key} className="rounded-lg border border-white/10 bg-slate-900/70 p-2">
                <div className="mx-auto mb-1 h-2.5 w-8 rounded-full" style={{ backgroundColor: sorenessColor[level] }} />
                <span className="tracking-[0.12em] text-slate-300">{sorenessLabel[level]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
