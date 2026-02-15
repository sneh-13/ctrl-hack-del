"use client";

import { memo, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MuscleGroup, SorenessLevel } from "@/types";
import manifestData from "@/public/bodymap/manifest.json";

// ─── Types ────────────────────────────────────────────────────────────────────

type BodySide = "front" | "back";

interface ManifestPart {
  id: string;
  file: string;
  bbox: [number, number, number, number];
}

// ─── Status colours (identical to original) ──────────────────────────────────

const sorenessColor: Record<SorenessLevel, string> = {
  0: "rgba(22, 163, 74, 0.72)",
  1: "rgba(217, 119, 6, 0.72)",
  2: "rgba(225, 29, 72, 0.72)",
};

const sorenessLabel: Record<SorenessLevel, string> = {
  0: "Recovered",
  1: "Recovering",
  2: "Sore",
};

// ─── Base image dimensions from manifest ─────────────────────────────────────

const FRONT_W = manifestData._meta.front_base_size[0]; // 998
const FRONT_H = manifestData._meta.front_base_size[1]; // 1819
const BACK_W  = manifestData._meta.back_base_size[0];  // 994
const BACK_H  = manifestData._meta.back_base_size[1];  // 1819

// ─── Part → MuscleGroup mapping ──────────────────────────────────────────────
// Derived from centroid positions relative to the 998×1819 (front) /
// 994×1819 (back) base images. Parts not listed here (e.g. head/neck)
// are intentionally skipped and receive no coloured overlay.

const FRONT_MAP: Partial<Record<string, MuscleGroup>> = {
  // shoulders  (y≈330–420, lateral upper torso)
  front_022: "shoulders", front_023: "shoulders",
  front_040: "shoulders", front_042: "shoulders",

  // chest  (y≈245–486, centre upper torso)
  front_002: "chest", front_003: "chest",
  front_046: "chest", front_047: "chest",
  front_056: "chest", front_057: "chest",
  front_058: "chest",

  // biceps  (y≈430–650, upper arm)
  front_006: "biceps", front_007: "biceps",
  front_054: "biceps", front_055: "biceps",
  front_067: "biceps", front_068: "biceps",
  front_073: "biceps", front_074: "biceps",

  // forearms  (y≈580–930, lower arm / far lateral)
  front_018: "forearms", front_019: "forearms",
  front_020: "forearms", front_021: "forearms",
  front_048: "forearms", front_049: "forearms",
  front_050: "forearms", front_051: "forearms",
  front_052: "forearms", front_053: "forearms",
  front_061: "forearms", front_062: "forearms",
  front_065: "forearms", front_066: "forearms",
  front_069: "forearms", front_070: "forearms",
  front_071: "forearms", front_072: "forearms",
  front_075: "forearms", front_076: "forearms",

  // abs  (y≈500–996, centre torso)
  front_030: "abs", front_031: "abs",
  front_038: "abs", front_039: "abs",
  front_012: "abs", front_013: "abs",
  front_024: "abs", front_025: "abs",
  front_028: "abs", front_029: "abs",
  front_034: "abs", front_035: "abs",
  front_044: "abs", front_045: "abs",
  front_063: "abs", front_064: "abs",
  front_079: "abs", front_080: "abs",

  // quads  (y≈800–1260, thighs)
  front_004: "quads", front_005: "quads",
  front_010: "quads", front_011: "quads",
  front_014: "quads", front_015: "quads",
  front_026: "quads", front_027: "quads",
  front_059: "quads", front_060: "quads",

  // calves  (y≈1260–1820, lower leg)
  front_008: "calves", front_009: "calves",
  front_016: "calves", front_017: "calves",
  front_032: "calves", front_033: "calves",
  front_036: "calves", front_037: "calves",
  front_041: "calves", front_043: "calves",
  front_077: "calves", front_078: "calves",
  front_081: "calves", front_082: "calves",
};

const BACK_MAP: Partial<Record<string, MuscleGroup>> = {
  // traps  (upper-centre, y≈0–330)
  back_001: "traps",
  back_020: "traps", back_021: "traps",
  back_058: "traps", back_059: "traps",

  // shoulders  (y≈330–450, lateral upper)
  back_016: "shoulders", back_017: "shoulders",
  back_026: "shoulders", back_027: "shoulders",

  // lats  (y≈320–780, side of torso)
  back_002: "lats", back_003: "lats",
  back_006: "lats", back_007: "lats",
  back_024: "lats", back_025: "lats",
  back_048: "lats", back_049: "lats",

  // triceps  (y≈430–830, back of upper arm)
  back_022: "triceps", back_023: "triceps",
  back_030: "triceps", back_031: "triceps",
  back_036: "triceps", back_037: "triceps",
  back_042: "triceps", back_043: "triceps",
  back_056: "triceps", back_057: "triceps",
  back_060: "triceps", back_061: "triceps",

  // lower_back  (y≈744–820, centre)
  back_034: "lower_back", back_035: "lower_back",

  // glutes  (y≈790–990, lower centre)
  back_004: "glutes", back_005: "glutes",
  back_028: "glutes", back_029: "glutes",
  back_046: "glutes", back_047: "glutes",
  back_050: "glutes", back_051: "glutes",
  back_054: "glutes", back_055: "glutes",
  back_062: "glutes", back_063: "glutes",

  // hamstrings  (y≈912–1240, back of thigh)
  back_010: "hamstrings", back_011: "hamstrings",
  back_014: "hamstrings", back_015: "hamstrings",
  back_018: "hamstrings", back_019: "hamstrings",
  back_044: "hamstrings", back_045: "hamstrings",

  // calves  (y≈1200–1800, lower leg)
  back_008: "calves", back_009: "calves",
  back_012: "calves", back_013: "calves",
  back_032: "calves", back_033: "calves",
  back_038: "calves", back_039: "calves",
  back_040: "calves", back_041: "calves",
  back_052: "calves", back_053: "calves",
};

// ─── Single coloured muscle layer ────────────────────────────────────────────

interface LayerProps {
  part: ManifestPart;
  baseW: number;
  baseH: number;
  color: string;
  group: MuscleGroup;
  interactive: boolean;
  onToggle: (g: MuscleGroup) => void;
}

const MuscleLayer = memo(function MuscleLayer({
  part,
  baseW,
  baseH,
  color,
  group,
  interactive,
  onToggle,
}: LayerProps) {
  const [x0, y0, x1, y1] = part.bbox;
  const maskUrl = `url(/bodymap/${part.file})`;

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${(x0 / baseW) * 100}%`,
    top:  `${(y0 / baseH) * 100}%`,
    width:  `${((x1 - x0) / baseW) * 100}%`,
    height: `${((y1 - y0) / baseH) * 100}%`,
    backgroundColor: color,
    // mask — alpha channel of the PNG drives visibility
    WebkitMaskImage: maskUrl,
    WebkitMaskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskImage: maskUrl,
    maskSize: "100% 100%",
    maskRepeat: "no-repeat",
    cursor: interactive ? "pointer" : "default",
    // pointer-events follow the element box, not the mask shape — acceptable
    // for a muscle map where bbox overlap is minimal.
    pointerEvents: interactive ? "auto" : "none",
    transition: "background-color 0.15s ease",
  };

  return (
    <div
      style={style}
      title={group.replace(/_/g, " ")}
      onClick={interactive ? () => onToggle(group) : undefined}
    />
  );
});

// ─── Canvas: base image + overlay layers ─────────────────────────────────────

interface CanvasProps {
  side: BodySide;
  value: Record<MuscleGroup, SorenessLevel>;
  interactive: boolean;
  onToggle: (g: MuscleGroup) => void;
}

const BodyMapCanvas = memo(function BodyMapCanvas({
  side,
  value,
  interactive,
  onToggle,
}: CanvasProps) {
  const rawParts = side === "front" ? manifestData.front : manifestData.back;
  const parts = rawParts as unknown as ManifestPart[];
  const groupMap = side === "front" ? FRONT_MAP : BACK_MAP;
  const baseW   = side === "front" ? FRONT_W : BACK_W;
  const baseH   = side === "front" ? FRONT_H : BACK_H;
  const baseImg = `/bodymap/body_${side}_base.png`;

  // Build only the layers that have a group mapping — memoised so it
  // only recomputes when value or side changes.
  const layers = useMemo(
    () =>
      parts.flatMap((part) => {
        const group = groupMap[part.id];
        if (!group) return [];
        const level = value[group] ?? 0;
        return [{ part, group, color: sorenessColor[level] }];
      }),
    [parts, groupMap, value],
  );

  return (
    // `relative` container — the <img> sets the height; absolutely-positioned
    // overlays are then sized with percentages of that height.
    <div className="relative w-full">
      {/* Base silhouette */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={baseImg}
        alt={`${side} body`}
        className="block w-full select-none"
        draggable={false}
        style={{ pointerEvents: "none" }}
      />

      {/* Muscle overlays */}
      {layers.map(({ part, group, color }) => (
        <MuscleLayer
          key={part.id}
          part={part}
          baseW={baseW}
          baseH={baseH}
          color={color}
          group={group}
          interactive={interactive}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
});

// ─── Public component — identical external API to the original ────────────────

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

  const toggleGroup = (group: MuscleGroup) => {
    if (!interactive || !onChange) return;
    const current = value[group] ?? 0;
    const nextLevel = ((current + 1) % 3) as SorenessLevel;
    onChange({ ...value, [group]: nextLevel });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Front / Back toggle + Reset */}
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
            className="ml-auto h-8 text-slate-600 hover:text-slate-900"
            onClick={() =>
              onChange(
                Object.fromEntries(
                  Object.keys(value).map((key) => [key, 0]),
                ) as Record<MuscleGroup, SorenessLevel>,
              )
            }
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset
          </Button>
        ) : null}
      </div>

      {/* Map + legend */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mx-auto max-w-[220px]">
          <BodyMapCanvas
            side={side}
            value={value}
            interactive={interactive}
            onToggle={toggleGroup}
          />
        </div>

        {/* Legend — identical to original */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] uppercase">
          {(Object.keys(sorenessColor) as Array<`${SorenessLevel}`>).map((key) => {
            const level = Number(key) as SorenessLevel;
            return (
              <div key={key} className="rounded-lg border border-slate-200 bg-white p-2">
                <div
                  className="mx-auto mb-1 h-2.5 w-8 rounded-full"
                  style={{ backgroundColor: sorenessColor[level] }}
                />
                <span className="tracking-[0.12em] text-slate-600">{sorenessLabel[level]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
