"use client";

import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";

import { InteractiveBodyMap } from "@/components/aura/interactive-body-map";
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
import { emptyMuscleSoreness } from "@/lib/mock-data";
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
  muscleSoreness: Record<MuscleGroup, SorenessLevel>;
};

function createInitialForm(profile: UserFitnessProfile, latestLog?: DailyLogs): CheckInForm {
  return {
    sleepDurationHours: latestLog?.sleepDurationHours ?? profile.targetSleepHours,
    wakeTime: latestLog?.wakeTime ?? profile.wakeTime,
    stress: latestLog?.stress ?? 4,
    yesterdayWorkout: latestLog?.yesterdayWorkout ?? "",
    lastSessionRpe: latestLog?.lastSessionRpe ?? 7,
    subjectiveSoreness: latestLog?.subjectiveSoreness ?? 4,
    muscleSoreness: latestLog?.muscleSoreness ?? { ...emptyMuscleSoreness },
  };
}

function sorenessToSubjective(muscleSoreness: Record<MuscleGroup, SorenessLevel>) {
  const values = Object.values(muscleSoreness);
  const total = values.reduce<number>((acc, value) => acc + value, 0);
  const average = values.length > 0 ? total / values.length : 0;
  return Math.round(average * 5);
}

export function DailyCheckInModal({ profile, latestLog, onSubmit }: DailyCheckInModalProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CheckInForm>(() => createInitialForm(profile, latestLog));

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
    onSubmit({
      date: new Date().toISOString(),
      sleepDurationHours: form.sleepDurationHours,
      wakeTime: form.wakeTime,
      stress: form.stress,
      yesterdayWorkout: form.yesterdayWorkout,
      lastSessionRpe: form.lastSessionRpe,
      subjectiveSoreness: form.subjectiveSoreness,
      muscleSoreness: form.muscleSoreness,
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="yesterday-workout">Yesterday&apos;s Workout</Label>
              <Textarea
                id="yesterday-workout"
                value={form.yesterdayWorkout}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    yesterdayWorkout: event.target.value,
                  }))
                }
                className="min-h-[120px] border-slate-300 bg-white"
                placeholder="Session type, key lifts, and notable fatigue..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Tap a region to toggle soreness state: Green (Recovered), Yellow (Recovering), Red (Sore).
            </p>

            <InteractiveBodyMap
              value={form.muscleSoreness}
              onChange={(next) =>
                setForm((prev) => ({
                  ...prev,
                  muscleSoreness: next,
                  subjectiveSoreness: sorenessToSubjective(next),
                }))
              }
            />

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
