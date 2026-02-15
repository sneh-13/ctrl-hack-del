"use client";

import { memo, useMemo } from "react";

import {
  FRONT_PART_INDEX,
  BACK_PART_INDEX,
  FRONT_W, FRONT_H,
  BACK_W,  BACK_H,
  STATUS_COLOR,
  PREVIEW_COLOR,
  type MuscleGroupEntry,
  type StatusType,
} from "@/lib/bodymap-data";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OverlayDef {
  key: string;
  file: string;
  bbox: [number, number, number, number];
  color: string;
}

interface BodyMapDisplayProps {
  view: "front" | "back";
  statusByGroup: Record<string, StatusType | undefined>;
  hoveredGroupKey: string | null;
  groups: MuscleGroupEntry[];
}

// ─── Memoised single overlay div ─────────────────────────────────────────────

const Overlay = memo(function Overlay({
  file,
  bbox,
  color,
  baseW,
  baseH,
}: {
  file: string;
  bbox: [number, number, number, number];
  color: string;
  baseW: number;
  baseH: number;
}) {
  const [x0, y0, x1, y1] = bbox;
  const maskUrl = `url(/bodymap/${file})`;

  return (
    <div
      style={{
        position: "absolute",
        left:   `${(x0 / baseW) * 100}%`,
        top:    `${(y0 / baseH) * 100}%`,
        width:  `${((x1 - x0) / baseW) * 100}%`,
        height: `${((y1 - y0) / baseH) * 100}%`,
        backgroundColor: color,
        // mask — alpha channel of each cropped PNG drives which pixels show
        WebkitMaskImage: maskUrl,
        WebkitMaskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskImage: maskUrl,
        maskSize: "100% 100%",
        maskRepeat: "no-repeat",
        // diagram is display-only — no pointer events on overlays
        pointerEvents: "none",
        transition: "background-color 0.12s ease",
      }}
    />
  );
});

// ─── Main display component ───────────────────────────────────────────────────

export const BodyMapDisplay = memo(function BodyMapDisplay({
  view,
  statusByGroup,
  hoveredGroupKey,
  groups,
}: BodyMapDisplayProps) {
  const partIndex = view === "front" ? FRONT_PART_INDEX : BACK_PART_INDEX;
  const baseW     = view === "front" ? FRONT_W : BACK_W;
  const baseH     = view === "front" ? FRONT_H : BACK_H;
  const baseImg   = `/bodymap/body_${view}_base.png`;

  /**
   * Build the overlay list in a single pass:
   *   1. Status overlays for every group that has a status
   *   2. Preview overlay on top for the hovered group
   *
   * Each overlay uses the part's pre-indexed file + bbox so no manifest
   * search is needed at render time (O(parts) not O(groups × parts)).
   */
  const overlays = useMemo<OverlayDef[]>(() => {
    const result: OverlayDef[] = [];

    for (const group of groups) {
      const status = statusByGroup[group.key];
      if (!status) continue;
      const color = STATUS_COLOR[status];
      for (const id of group.parts[view]) {
        const part = partIndex[id];
        if (!part) continue;
        result.push({ key: id, file: part.file, bbox: part.bbox, color });
      }
    }

    // Preview layer rendered last so it appears on top of status layers
    if (hoveredGroupKey) {
      const hg = groups.find((g) => g.key === hoveredGroupKey);
      if (hg) {
        for (const id of hg.parts[view]) {
          const part = partIndex[id];
          if (!part) continue;
          // unique key prevents React from reusing the status layer node
          result.push({ key: `${id}__preview`, file: part.file, bbox: part.bbox, color: PREVIEW_COLOR });
        }
      }
    }

    return result;
  }, [groups, statusByGroup, hoveredGroupKey, view, partIndex]);

  return (
    // `relative` so absolutely-positioned overlays are anchored to the image
    <div className="relative w-full" style={{ userSelect: "none" }}>
      {/* Base silhouette — sets the container height via normal flow */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={baseImg}
        alt={`${view} body`}
        className="block w-full"
        draggable={false}
        style={{ pointerEvents: "none" }}
      />

      {overlays.map(({ key, file, bbox, color }) => (
        <Overlay
          key={key}
          file={file}
          bbox={bbox}
          color={color}
          baseW={baseW}
          baseH={baseH}
        />
      ))}
    </div>
  );
});
