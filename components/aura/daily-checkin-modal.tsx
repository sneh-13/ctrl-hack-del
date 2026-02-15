"use client";

import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";

import { BodyMapDisplay } from "@/components/aura/body-map-display";
import { MuscleGroupChecklist } from "@/components/aura/muscle-group-checklist";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { MUSCLE_GROUPS, type StatusType } from "@/lib/bodymap-data";
import type { DailyLogs, MuscleGroup, SorenessLevel, UserFitnessProfile } from "@/types";

interface DailyCheckInModalProps {
  profile: UserFitnessProfile;
  latestLog?: DailyLogs;
  onSubmit: (log: DailyLogs) => void;
}

type CheckInForm = {
  sleepDurationHours: number;
  wakeTime: string;
  stress: number;
  yesterdayWorkout: string;
  lastSessionRpe: number;
  subjectiveSoreness: number;
  statusByGroup: Record<string, StatusType | undefined>;
};

/** Map SorenessLevel (legacy) → StatusType */
function levelToStatus(level: SorenessLevel): StatusType | undefined {
  if (level === 2) return "sore";
  if (level === 1) return "recovering";
  return undefined;
}

/** Map StatusType → SorenessLevel for DailyLogs submission */
function statusToLevel(status: StatusType | undefined): SorenessLevel {
  if (status === "sore") return 2;
  if (status === "recovering") return 1;
  return 0;
}

function createInitialForm(profile: UserFitnessProfile, latestLog?: DailyLogs): CheckInForm {
  const statusByGroup: Record<string, StatusType | undefined> = {};
  if (latestLog?.muscleSoreness) {
    for (const [key, level] of Object.entries(latestLog.muscleSoreness)) {
      const status = levelToStatus(level as SorenessLevel);
      if (status) statusByGroup[key] = status;
    }
  }
  return {
    sleepDurationHours: latestLog?.sleepDurationHours ?? profile.targetSleepHours,
    wakeTime: latestLog?.wakeTime ?? profile.wakeTime,
    stress: latestLog?.stress ?? 4,
    yesterdayWorkout: latestLog?.yesterdayWorkout ?? "",
    lastSessionRpe: latestLog?.lastSessionRpe ?? 7,
    subjectiveSoreness: latestLog?.subjectiveSoreness ?? 4,
    statusByGroup,
  };
}

function sorenessToSubjective(statusByGroup: Record<string, StatusType | undefined>) {
  const total = MUSCLE_GROUPS.reduce<number>((acc, g) => acc + statusToLevel(statusByGroup[g.key]), 0);
  return Math.round((total / MUSCLE_GROUPS.length) * 5);
}

export function DailyCheckInModal({ profile, latestLog, onSubmit }: DailyCheckInModalProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CheckInForm>(() => createInitialForm(profile, latestLog));
  const [view, setView] = useState<"front" | "back">("front");
  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);

  /** Wrapper so MuscleGroupChecklist can update statusByGroup and auto-sync subjectiveSoreness */
  const setStatusByGroup: React.Dispatch<React.SetStateAction<Record<string, StatusType | undefined>>> = (action) => {
    setForm((prev) => {
      const next = typeof action === "function" ? action(prev.statusByGroup) : action;
      return { ...prev, statusByGroup: next, subjectiveSoreness: sorenessToSubjective(next) };
    });
  };

  const readinessHint = useMemo(() => {
    const sleepFactor = Math.max(0, 7.5 - form.sleepDurationHours) * 2;
    const strain = form.stress + form.subjectiveSoreness + Math.max(0, form.lastSessionRpe - 7);
    const estimate = Math.max(0, Math.round(100 - sleepFactor * 8 - strain * 3.2));
    return estimate;
  }, [form.lastSessionRpe, form.sleepDurationHours, form.stress, form.subjectiveSoreness]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setForm(createInitialForm(profile, latestLog));
    }
  };

  const submitCheckIn = () => {
    const muscleSoreness = Object.fromEntries(
      MUSCLE_GROUPS.map((g) => [g.key, statusToLevel(form.statusByGroup[g.key])])
    ) as Record<MuscleGroup, SorenessLevel>;

    onSubmit({
      date: new Date().toISOString(),
      sleepDurationHours: form.sleepDurationHours,
      wakeTime: form.wakeTime,
      stress: form.stress,
      yesterdayWorkout: form.yesterdayWorkout,
      lastSessionRpe: form.lastSessionRpe,
      subjectiveSoreness: form.subjectiveSoreness,
      muscleSoreness,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
          <CalendarClock className="mr-2 h-4 w-4" />
          Daily Check-in
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto border-slate-200 bg-white text-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl text-slate-900">Recovery Check-in</DialogTitle>
          <DialogDescription className="text-slate-500">
            Update sleep, strain, and soreness inputs to refresh today&apos;s Go/No-Go state.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sleep-duration">Sleep Duration (hours)</Label>
                <Input
                  id="sleep-duration"
                  type="number"
                  step="0.1"
                  min={3}
                  max={12}
                  value={form.sleepDurationHours}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      sleepDurationHours: Number(event.target.value),
                    }))
                  }
                  className="border-slate-300 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wake-time">Wake Time</Label>
                <Input
                  id="wake-time"
                  type="time"
                  value={form.wakeTime}
                  onChange={(event) => setForm((prev) => ({ ...prev, wakeTime: event.target.value }))}
                  className="border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Stress (0-10)</Label>
                  <span className="text-xl font-semibold text-slate-900">{form.stress}</span>
                </div>
                <Slider
                  value={[form.stress]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, stress: value[0] ?? 0 }))}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Last Session RPE</Label>
                  <span className="text-xl font-semibold text-slate-900">{form.lastSessionRpe}</span>
                </div>
                <Slider
                  value={[form.lastSessionRpe]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      lastSessionRpe: value[0] ?? 1,
                    }))
                  }
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Subjective Soreness (0-10)</Label>
                  <span className="text-xl font-semibold text-slate-900">{form.subjectiveSoreness}</span>
                </div>
                <Slider
                  value={[form.subjectiveSoreness]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      subjectiveSoreness: value[0] ?? 0,
                    }))
                  }
                />
              </div>

              {/* ── Muscle Groups inline below sliders ── */}
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Muscle Groups
                </p>
                <MuscleGroupChecklist
                  groups={MUSCLE_GROUPS}
                  statusByGroup={form.statusByGroup}
                  setStatusByGroup={setStatusByGroup}
                  hoveredGroupKey={hoveredGroupKey}
                  setHoveredGroupKey={setHoveredGroupKey}
                />
              </div>
            </div>

          </div>

          <div className="space-y-4">
            {/* Front / Back toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={view === "front" ? "default" : "outline"}
                className="h-8 flex-1 text-sm"
                onClick={() => setView("front")}
              >
                Front
              </Button>
              <Button
                type="button"
                variant={view === "back" ? "default" : "outline"}
                className="h-8 flex-1 text-sm"
                onClick={() => setView("back")}
              >
                Back
              </Button>
            </div>

            {/* Display-only body diagram */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <BodyMapDisplay
                view={view}
                statusByGroup={form.statusByGroup}
                hoveredGroupKey={hoveredGroupKey}
                groups={MUSCLE_GROUPS}
              />
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">Estimated Readiness (Pre-submit)</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900">{readinessHint}</p>
              <p className="text-sm text-slate-600">Final score updates after check-in submission.</p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button onClick={submitCheckIn} className="h-10 rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700">
            Save Daily Inputs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
