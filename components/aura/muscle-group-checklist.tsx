"use client";

import { memo } from "react";
import { Check } from "lucide-react";

import {
  STATUS_COLOR,
  STATUS_CYCLE,
  type MuscleGroupEntry,
  type StatusType,
} from "@/lib/bodymap-data";
import { cn } from "@/lib/utils";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MuscleGroupChecklistProps {
  groups: MuscleGroupEntry[];
  statusByGroup: Record<string, StatusType | undefined>;
  setStatusByGroup: React.Dispatch<React.SetStateAction<Record<string, StatusType | undefined>>>;
  hoveredGroupKey: string | null;
  setHoveredGroupKey: (key: string | null) => void;
}

// ─── Row ──────────────────────────────────────────────────────────────────────

interface RowProps {
  group: MuscleGroupEntry;
  status: StatusType | undefined;
  isHovered: boolean;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
  onActivate: () => void;
}

const ChecklistRow = memo(function ChecklistRow({
  group,
  status,
  isHovered,
  onHoverEnter,
  onHoverLeave,
  onActivate,
}: RowProps) {
  const dotColor = status ? STATUS_COLOR[status] : undefined;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${group.label}${status ? ` — ${status}` : ""}`}
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
        isHovered && !status
          ? "border-blue-200 bg-blue-50 text-blue-800"
          : isHovered && status
            ? "border-blue-200 bg-blue-50 text-blue-900"
            : status
              ? "border-slate-200 bg-white text-slate-800"
              : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900",
      )}
      // Mouse
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
      // Keyboard / focus (also provides preview via hover state)
      onFocus={onHoverEnter}
      onBlur={onHoverLeave}
      // Activate — click or Enter/Space
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
    >
      {/* Status indicator circle */}
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
        style={
          status
            ? { backgroundColor: dotColor, borderColor: dotColor }
            : { borderColor: "#cbd5e1", backgroundColor: "transparent" }
        }
      >
        {status && (
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        )}
      </span>

      {/* Muscle group label */}
      <span className="flex-1 truncate leading-none">{group.label}</span>
    </div>
  );
});

// ─── Checklist ────────────────────────────────────────────────────────────────

export const MuscleGroupChecklist = memo(function MuscleGroupChecklist({
  groups,
  statusByGroup,
  setStatusByGroup,
  hoveredGroupKey,
  setHoveredGroupKey,
}: MuscleGroupChecklistProps) {
  /**
   * Toggle: clicking a muscle marks it as "sore" (red).
   * Clicking again clears it. "Recovering" state only comes from the
   * recovery algorithm — never from manual input.
   */
  const cycleStatus = (key: string) => {
    setStatusByGroup((prev) => {
      const current = prev[key];
      const updated = { ...prev };
      if (current === "sore") {
        // Already sore → clear it
        delete updated[key];
      } else {
        // None, recovering, or recovered → mark as sore
        updated[key] = "sore";
      }
      return updated;
    });
  };

  return (
    <div className="grid grid-cols-2 gap-0.5">
      {groups.map((group) => (
        <ChecklistRow
          key={group.key}
          group={group}
          status={statusByGroup[group.key]}
          isHovered={hoveredGroupKey === group.key}
          onHoverEnter={() => setHoveredGroupKey(group.key)}
          onHoverLeave={() => setHoveredGroupKey(null)}
          onActivate={() => cycleStatus(group.key)}
        />
      ))}
    </div>
  );
});
