/**
 * Shared data and types for the image-based body map feature.
 *
 * MUSCLE_GROUPS maps each logical group key to the manifest part IDs that
 * belong to it in the front and back views.  Part IDs come directly from
 * /public/bodymap/manifest.json ("id" field).
 */

import manifestData from "@/public/bodymap/manifest.json";

// ─── Status types ─────────────────────────────────────────────────────────────

export type StatusType = "sore" | "recovering";

export const STATUS_COLOR: Record<StatusType, string> = {
  sore:       "rgba(225, 29, 72, 0.72)",
  recovering: "rgba(217, 119, 6, 0.72)",
};

export const STATUS_LABEL: Record<StatusType, string> = {
  sore:       "Sore",
  recovering: "Recovering",
};

/** Blue preview shown while hovering over a checklist row. */
export const PREVIEW_COLOR = "rgba(59, 130, 246, 0.48)";

/** Cycle order: none → sore → recovering → none */
export const STATUS_CYCLE: Array<StatusType | undefined> = [
  undefined,
  "sore",
  "recovering",
];

// ─── Muscle group definition ──────────────────────────────────────────────────

export interface MuscleGroupEntry {
  key: string;
  label: string;
  /** Which manifest part IDs belong to this group in each view. */
  parts: { front: string[]; back: string[] };
}

export const MUSCLE_GROUPS: MuscleGroupEntry[] = [
  {
    key: "chest",
    label: "Chest",
    parts: {
      front: ["front_030","front_031","front_038","front_039","front_046","front_047",
              "front_056","front_057","front_058","front_063","front_064","front_079","front_080"],
      back:  [],
    },
  },
  {
    key: "shoulders",
    label: "Shoulders",
    parts: {
      front: ["front_002","front_003","front_022","front_023","front_040","front_042"],
      back:  ["back_016","back_017","back_026","back_027"],
    },
  },
  {
    key: "biceps",
    label: "Biceps",
    parts: {
      front: ["front_006","front_007","front_054","front_055","front_067","front_068","front_073","front_074"],
      back:  [],
    },
  },
  {
    key: "triceps",
    label: "Triceps",
    parts: {
      front: [],
      back:  ["back_022","back_023","back_030","back_031","back_036","back_037",
              "back_042","back_043","back_056","back_057","back_060","back_061"],
    },
  },
  {
    key: "forearms",
    label: "Forearms",
    parts: {
      front: ["front_018","front_019","front_020","front_021","front_048","front_049",
              "front_050","front_051","front_052","front_053","front_061","front_062",
              "front_065","front_066","front_069","front_070","front_071","front_072",
              "front_075","front_076"],
      back:  [],
    },
  },
  {
    key: "abs",
    label: "Abs",
    parts: {
      front: ["front_012","front_013","front_024","front_025","front_028","front_029",
              "front_034","front_035","front_044","front_045"],
      back:  [],
    },
  },
  {
    key: "traps",
    label: "Traps",
    parts: {
      front: [],
      back:  ["back_001","back_020","back_021","back_058","back_059"],
    },
  },
  {
    key: "lats",
    label: "Lats",
    parts: {
      front: [],
      back:  ["back_002","back_003","back_006","back_007","back_024","back_025","back_048","back_049"],
    },
  },
  {
    key: "lower_back",
    label: "Lower Back",
    parts: {
      front: [],
      back:  ["back_034","back_035"],
    },
  },
  {
    key: "quads",
    label: "Quads",
    parts: {
      front: ["front_004","front_005","front_010","front_011","front_014","front_015",
              "front_026","front_027","front_059","front_060"],
      back:  [],
    },
  },
  {
    key: "hamstrings",
    label: "Hamstrings",
    parts: {
      front: [],
      back:  ["back_010","back_011","back_014","back_015","back_018","back_019","back_044","back_045"],
    },
  },
  {
    key: "glutes",
    label: "Glutes",
    parts: {
      front: [],
      back:  ["back_004","back_005","back_028","back_029","back_046","back_047",
              "back_050","back_051","back_054","back_055","back_062","back_063"],
    },
  },
  {
    key: "calves",
    label: "Calves",
    parts: {
      front: ["front_008","front_009","front_016","front_017","front_032","front_033",
              "front_036","front_037","front_041","front_043","front_077","front_078",
              "front_081","front_082"],
      back:  ["back_008","back_009","back_012","back_013","back_032","back_033",
              "back_038","back_039","back_040","back_041","back_052","back_053"],
    },
  },
];

// ─── Manifest part index (O(1) lookup by part id) ────────────────────────────

export interface ManifestPart {
  id: string;
  file: string;
  bbox: [number, number, number, number];
}

function buildIndex(
  parts: Array<{ id: string; file: string; bbox: number[] }>,
): Record<string, ManifestPart> {
  const idx: Record<string, ManifestPart> = {};
  for (const p of parts) {
    idx[p.id] = { id: p.id, file: p.file, bbox: p.bbox as [number, number, number, number] };
  }
  return idx;
}

export const FRONT_PART_INDEX: Record<string, ManifestPart> = buildIndex(manifestData.front);
export const BACK_PART_INDEX:  Record<string, ManifestPart> = buildIndex(manifestData.back);

export const FRONT_W = manifestData._meta.front_base_size[0];
export const FRONT_H = manifestData._meta.front_base_size[1];
export const BACK_W  = manifestData._meta.back_base_size[0];
export const BACK_H  = manifestData._meta.back_base_size[1];
