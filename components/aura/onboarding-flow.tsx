"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  Dumbbell,
  Flame,
  MoonStar,
  Sparkles,
  Sun,
  Sunrise,
  Waves,
} from "lucide-react";

import {
  chronotypeOptions,
  experienceLevels,
  trainingGoalOptions,
  workoutSplitOptions,
} from "@/lib/mock-data";
import type { UserFitnessProfile } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OnboardingFlowProps {
  onComplete: (profile: UserFitnessProfile) => void;
}

const chronotypeIcons = {
  lion: Sunrise,
  bear: Sun,
  wolf: MoonStar,
  dolphin: Waves,
};

const goalIcons = {
  hypertrophy: Dumbbell,
  strength: BrainCircuit,
  cutting: Flame,
};

const totalSteps = 4;

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [profileDraft, setProfileDraft] = useState<Partial<UserFitnessProfile>>({
    targetSleepHours: 7.5,
    wakeTime: "06:30",
  });

  const progress = ((step + 1) / totalSteps) * 100;

  const isCurrentStepValid = useMemo(() => {
    if (step === 0) return Boolean(profileDraft.chronotype);
    if (step === 1) return Boolean(profileDraft.experienceLevel && profileDraft.trainingGoal);
    if (step === 2) return Boolean(profileDraft.targetSleepHours && profileDraft.wakeTime);
    if (step === 3) return Boolean(profileDraft.workoutSplit);
    return false;
  }, [profileDraft, step]);

  const completeOnboarding = () => {
    if (!profileDraft.chronotype) return;
    if (!profileDraft.experienceLevel) return;
    if (!profileDraft.trainingGoal) return;
    if (!profileDraft.targetSleepHours) return;
    if (!profileDraft.workoutSplit) return;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `athlete-${Date.now()}`;

    onComplete({
      id,
      chronotype: profileDraft.chronotype,
      experienceLevel: profileDraft.experienceLevel,
      trainingGoal: profileDraft.trainingGoal,
      targetSleepHours: profileDraft.targetSleepHours,
      workoutSplit: profileDraft.workoutSplit,
      wakeTime: profileDraft.wakeTime ?? "06:30",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center p-4 md:p-8">
      <Card className="w-full border border-cyan-400/25 bg-slate-950/75 shadow-[0_0_55px_rgba(8,145,178,0.14)] backdrop-blur">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Badge className="bg-[#39ff14]/20 text-[#7eff61] hover:bg-[#39ff14]/20">Aura Setup</Badge>
                <Badge variant="outline" className="border-cyan-300/30 text-cyan-200">
                  Step {step + 1}/{totalSteps}
                </Badge>
              </div>
              <CardTitle className="font-display text-3xl text-white">Build Your Bio-Adaptive Profile</CardTitle>
              <CardDescription className="mt-2 text-slate-300">
                Static calibration for predicting your Biological Prime Time.
              </CardDescription>
            </div>
            <Sparkles className="h-10 w-10 text-cyan-300/85" />
          </div>
          <Progress value={progress} className="mt-4 h-2 bg-slate-800" />
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22 }}
            >
              {step === 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm tracking-[0.18em] text-slate-300 uppercase">Chronotype</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {chronotypeOptions.map((option) => {
                      const Icon = chronotypeIcons[option.value];
                      const selected = profileDraft.chronotype === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setProfileDraft((prev) => ({ ...prev, chronotype: option.value }))}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            selected
                              ? "border-[#39ff14]/70 bg-[#39ff14]/12 shadow-[0_0_24px_rgba(57,255,20,0.22)]"
                              : "border-white/10 bg-slate-900/60 hover:border-cyan-300/45"
                          }`}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <Icon className="h-5 w-5 text-cyan-300" />
                            <span className="font-display text-lg text-white">{option.title}</span>
                          </div>
                          <p className="text-xs tracking-[0.12em] text-slate-300 uppercase">{option.window}</p>
                          <p className="mt-2 text-sm text-slate-300">{option.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm tracking-[0.18em] text-slate-300 uppercase">Lifting Experience</h3>
                    <Select
                      value={profileDraft.experienceLevel}
                      onValueChange={(value) =>
                        setProfileDraft((prev) => ({
                          ...prev,
                          experienceLevel: value as UserFitnessProfile["experienceLevel"],
                        }))
                      }
                    >
                      <SelectTrigger className="w-full border-white/15 bg-slate-900/70 text-white">
                        <SelectValue placeholder="Select your lifting experience" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span>{option.label}</span>
                              <span className="text-xs text-slate-500">{option.detail}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm tracking-[0.18em] text-slate-300 uppercase">Training Goal</h3>
                    <div className="grid gap-3 md:grid-cols-3">
                      {trainingGoalOptions.map((option) => {
                        const Icon = goalIcons[option.value];
                        const selected = profileDraft.trainingGoal === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setProfileDraft((prev) => ({ ...prev, trainingGoal: option.value }))}
                            className={`rounded-2xl border p-4 text-left transition-all ${
                              selected
                                ? "border-cyan-300/60 bg-cyan-400/10"
                                : "border-white/10 bg-slate-900/60 hover:border-cyan-300/35"
                            }`}
                          >
                            <Icon className="mb-2 h-5 w-5 text-cyan-300" />
                            <p className="font-semibold text-white">{option.label}</p>
                            <p className="mt-1 text-sm text-slate-300">{option.detail}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm tracking-[0.18em] text-slate-300 uppercase">Target Sleep Duration</h3>
                    <p className="mt-1 text-sm text-slate-400">Hours per night for baseline recovery.</p>
                    <div className="mt-3 flex items-center gap-3">
                      <Input
                        type="number"
                        step="0.1"
                        min={5}
                        max={10}
                        value={profileDraft.targetSleepHours ?? 7.5}
                        onChange={(event) =>
                          setProfileDraft((prev) => ({
                            ...prev,
                            targetSleepHours: Number(event.target.value),
                          }))
                        }
                        className="w-36 border-white/15 bg-slate-900/65 text-white"
                      />
                      <span className="text-sm text-slate-300">hours</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm tracking-[0.18em] text-slate-300 uppercase">Typical Wake Time</h3>
                    <p className="mt-1 text-sm text-slate-400">Used to anchor your 6-11 hour strength peak model.</p>
                    <Input
                      type="time"
                      value={profileDraft.wakeTime ?? "06:30"}
                      onChange={(event) =>
                        setProfileDraft((prev) => ({
                          ...prev,
                          wakeTime: event.target.value,
                        }))
                      }
                      className="mt-3 w-44 border-white/15 bg-slate-900/65 text-white"
                    />
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-4">
                  <h3 className="text-sm tracking-[0.18em] text-slate-300 uppercase">Workout Split</h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    {workoutSplitOptions.map((option) => {
                      const selected = profileDraft.workoutSplit === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setProfileDraft((prev) => ({ ...prev, workoutSplit: option.value }))}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            selected
                              ? "border-[#39ff14]/60 bg-[#39ff14]/11"
                              : "border-white/10 bg-slate-900/65 hover:border-cyan-300/35"
                          }`}
                        >
                          <p className="font-display text-lg text-white">{option.label}</p>
                          <p className="mt-2 text-sm text-slate-300">{option.detail}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-300">
                    <p className="mb-2 text-xs tracking-[0.14em] text-slate-400 uppercase">Profile Snapshot</p>
                    <p>Chronotype: {profileDraft.chronotype}</p>
                    <p>Goal: {profileDraft.trainingGoal}</p>
                    <p>Sleep target: {profileDraft.targetSleepHours}h</p>
                    <p>Split: {profileDraft.workoutSplit}</p>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0}
              className="border-white/20 bg-slate-900 text-slate-200 hover:bg-slate-800"
            >
              Back
            </Button>

            {step < totalSteps - 1 ? (
              <Button
                onClick={() => setStep((current) => Math.min(totalSteps - 1, current + 1))}
                disabled={!isCurrentStepValid}
                className="bg-[#39ff14] text-slate-950 hover:bg-[#7eff61]"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={completeOnboarding}
                disabled={!isCurrentStepValid}
                className="bg-[#39ff14] text-slate-950 hover:bg-[#7eff61]"
              >
                Launch Aura Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
