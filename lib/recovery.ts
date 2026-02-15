/**
 * Muscle recovery algorithm.
 *
 * Each muscle group is classified as small / medium / large, which determines
 * the base recovery window.  The user's subjective‑soreness score (0‑10)
 * interpolates between "perfect rest" and "horrible rest" recovery times.
 *
 * For testing: each check‑in entry is treated as one elapsed day.
 */

import type { DailyLogs, MuscleGroup, SorenessLevel } from "@/types";

// ── Muscle‑size classification ───────────────────────────────────────────────

type MuscleSize = "small" | "medium" | "large";

const MUSCLE_SIZE: Record<MuscleGroup, MuscleSize> = {
    biceps: "small",
    triceps: "small",
    calves: "small",
    forearms: "small",
    chest: "medium",
    shoulders: "medium",
    lats: "medium",
    abs: "medium",
    traps: "medium",
    lower_back: "medium",
    quads: "large",
    hamstrings: "large",
    glutes: "large",
};

// Recovery windows in **days** (perfect → horrible rest)
const RECOVERY_DAYS: Record<MuscleSize, { perfect: number; horrible: number }> = {
    small: { perfect: 1.25, horrible: 3 },   // 24‑36 h → 48‑72 h
    medium: { perfect: 1.75, horrible: 4 },   // 36‑48 h → 72‑96 h
    large: { perfect: 2.5, horrible: 6 },     // 48‑72 h → 5‑7 days
};

// ── Recovery‑time helper ─────────────────────────────────────────────────────

/**
 * Returns the estimated *full* recovery time (in days) for a muscle group
 * given the user's subjective soreness rating (0‑10).
 *
 * soreness 0  → perfect‑rest time
 * soreness 10 → horrible‑rest time
 */
export function getRecoveryDays(muscle: MuscleGroup, soreness: number): number {
    const size = MUSCLE_SIZE[muscle];
    const { perfect, horrible } = RECOVERY_DAYS[size];
    const t = Math.min(Math.max(soreness, 0), 10) / 10; // normalise 0‑1
    return perfect + t * (horrible - perfect);
}

// ── Compute current soreness across muscle groups ────────────────────────────

/**
 * Walk the log history (most‑recent first) and compute the **current**
 * soreness level for every muscle group, factoring in recovery time.
 *
 * Each log entry is treated as one day for testing purposes.
 *
 * Returns a Record<MuscleGroup, SorenessLevel> that can be fed directly into
 * the body‑map component.
 */
export function computeRecoveredSoreness(
    logs: DailyLogs[],
): Record<MuscleGroup, SorenessLevel> {
    const allMuscles: MuscleGroup[] = Object.keys(MUSCLE_SIZE) as MuscleGroup[];

    // Default: everything is 0 (recovered / no data)
    const result: Record<string, SorenessLevel> = {};
    for (const m of allMuscles) result[m] = 0;

    if (logs.length === 0) return result as Record<MuscleGroup, SorenessLevel>;

    // Logs are expected newest-first. Use actual dates for elapsed time.
    const newestDate = new Date(logs[0].date).getTime();

    for (const muscle of allMuscles) {
        // Find the most recent log where this muscle was flagged (level > 0)
        let flagDate: number | null = null;
        let flagLevel: SorenessLevel = 0;
        let flagSoreness = 0;

        for (let i = 0; i < logs.length; i++) {
            const level = logs[i].muscleSoreness?.[muscle] ?? 0;
            if (level > 0) {
                flagDate = new Date(logs[i].date).getTime();
                flagLevel = level as SorenessLevel;
                flagSoreness = logs[i].subjectiveSoreness;
                break;
            }
        }

        if (flagDate === null) {
            // Never flagged → stays 0
            continue;
        }

        const recoveryTime = getRecoveryDays(muscle, flagSoreness);
        // Calculate actual elapsed days from date difference
        const elapsed = (newestDate - flagDate) / (24 * 60 * 60 * 1000);

        if (elapsed >= recoveryTime) {
            // Fully recovered
            result[muscle] = 0;
        } else if (elapsed < 1) {
            // Day 0 (same day as flagged) → always stay sore (red)
            result[muscle] = 2;
        } else if (elapsed >= recoveryTime * 0.5) {
            // Past halfway → recovering (1)
            result[muscle] = 1;
        } else {
            // Still early but past day 1 → keep as sore (2)
            result[muscle] = 2;
        }
    }

    return result as Record<MuscleGroup, SorenessLevel>;
}
