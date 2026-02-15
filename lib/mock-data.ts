import type {
  Chronotype,
  DailyLogs,
  ExperienceLevel,
  MuscleGroup,
  ReadinessScore,
  ReadinessState,
  TrainingGoal,
  UserFitnessProfile,
  WorkoutSplit,
} from "@/types";

export const chronotypeOptions: Array<{
  value: Chronotype;
  title: string;
  window: string;
  description: string;
}> = [
  {
    value: "lion",
    title: "Lion",
    window: "Early explosive",
    description:
      "Early riser with high morning drive. Best for heavy compounds before midday.",
  },
  {
    value: "bear",
    title: "Bear",
    window: "Balanced midday",
    description:
      "Most common rhythm. Stable energy curve with reliable prime strength in late morning.",
  },
  {
    value: "wolf",
    title: "Wolf",
    window: "Late predator",
    description:
      "Night-leaning rhythm. Strong power output shifts later in the day.",
  },
  {
    value: "dolphin",
    title: "Dolphin",
    window: "Variable focus",
    description:
      "Lighter sleeper with fluctuating recovery. Tight recovery management matters most.",
  },
];

export const experienceLevels: Array<{
  value: ExperienceLevel;
  label: string;
  detail: string;
}> = [
  { value: "beginner", label: "Beginner", detail: "0-1 year structured lifting" },
  {
    value: "intermediate",
    label: "Intermediate",
    detail: "1-3 years with progressive overload",
  },
  {
    value: "advanced",
    label: "Advanced",
    detail: "3+ years, periodized blocks",
  },
];

export const trainingGoalOptions: Array<{
  value: TrainingGoal;
  label: string;
  detail: string;
}> = [
  {
    value: "hypertrophy",
    label: "Hypertrophy",
    detail: "Volume and muscular growth",
  },
  {
    value: "strength",
    label: "Strength",
    detail: "Neural output and 1RM focus",
  },
  {
    value: "cutting",
    label: "Cutting",
    detail: "Maintain power while reducing body fat",
  },
];

export const workoutSplitOptions: Array<{
  value: WorkoutSplit;
  label: string;
  detail: string;
}> = [
  { value: "ppl", label: "PPL", detail: "Push, Pull, Legs" },
  {
    value: "upper_lower",
    label: "Upper / Lower",
    detail: "Alternating upper and lower sessions",
  },
  {
    value: "arnold",
    label: "Arnold",
    detail: "Chest/Back, Shoulders/Arms, Legs",
  },
];

export const muscleGroups: MuscleGroup[] = [
  "shoulders",
  "chest",
  "biceps",
  "forearms",
  "abs",
  "quads",
  "calves",
  "traps",
  "lats",
  "triceps",
  "lower_back",
  "glutes",
  "hamstrings",
];

export const emptyMuscleSoreness: Record<MuscleGroup, 0 | 1 | 2> = {
  shoulders: 0,
  chest: 0,
  biceps: 0,
  forearms: 0,
  abs: 0,
  quads: 0,
  calves: 0,
  traps: 0,
  lats: 0,
  triceps: 0,
  lower_back: 0,
  glutes: 0,
  hamstrings: 0,
};

export const mockUserProfile: UserFitnessProfile = {
  id: "athlete-01",
  chronotype: "bear",
  experienceLevel: "intermediate",
  trainingGoal: "strength",
  targetSleepHours: 7.5,
  workoutSplit: "upper_lower",
  wakeTime: "06:45",
  timezone: "America/New_York",
};

export const RESET_BASELINE_DATE_ISO = "2026-02-15T12:00:00.000Z";

export function buildFreshAccountLog(
  profile: UserFitnessProfile,
  date: string = RESET_BASELINE_DATE_ISO,
): DailyLogs {
  return {
    date,
    sleepDurationHours: profile.targetSleepHours,
    wakeTime: profile.wakeTime,
    stress: 0,
    yesterdayWorkout: "",
    lastSessionRpe: 0,
    subjectiveSoreness: 0,
    muscleSoreness: { ...emptyMuscleSoreness },
  };
}

export const mockDailyLog: DailyLogs = {
  date: new Date().toISOString(),
  sleepDurationHours: 7.1,
  bedTime: "23:15",
  wakeTime: "06:40",
  stress: 4,
  yesterdayWorkout: "Upper strength block, 5x3 bench and weighted pull-ups",
  lastSessionRpe: 8,
  subjectiveSoreness: 5,
  muscleSoreness: {
    ...emptyMuscleSoreness,
    chest: 1,
    triceps: 1,
    shoulders: 1,
    lats: 1,
  },
};

const chronotypeShift: Record<Chronotype, number> = {
  lion: -1,
  bear: 0,
  wolf: 2,
  dolphin: 1,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function getReadinessState(score: number): ReadinessState {
  if (score >= 85) return "green";
  if (score >= 30) return "yellow";
  return "red";
}

function averageMuscleSoreness(log: DailyLogs): number {
  const total = muscleGroups.reduce((sum, group) => sum + (log.muscleSoreness[group] ?? 0), 0);
  return total / muscleGroups.length;
}

function buildRecoveryTrendPenalty(current: DailyLogs, history: DailyLogs[]): number {
  const recent = history.filter((item) => item.date !== current.date).slice(0, 3);
  if (recent.length === 0) return 0;

  const weights = [0.65, 0.45, 0.25];
  const weightedLoad = recent.reduce(
    (sum, item, index) => sum + averageMuscleSoreness(item) * (weights[index] ?? 0),
    0
  );

  return weightedLoad * 2.2;
}

export function buildHourlyPerformance(
  wakeTime: string,
  chronotype: Chronotype,
  stress: number,
  sleepDurationHours: number,
): number[] {
  const wakeHour = Number.parseInt(wakeTime.split(":")[0] ?? "6", 10);
  const shift = chronotypeShift[chronotype];
  const sleepDelta = (sleepDurationHours - 7.5) * 4.5;
  const stressPenalty = stress * 1.8;

  return Array.from({ length: 24 }, (_, hour) => {
    const circadianWave = 61 + 27 * Math.cos(((hour - wakeHour - 8 - shift) / 24) * Math.PI * 2);
    const ultradianWave = 6 * Math.sin((hour / 24) * Math.PI * 6);
    const score = circadianWave + ultradianWave + sleepDelta - stressPenalty;
    return clamp(Math.round(score), 12, 99);
  });
}

export function buildReadinessScore(
  profile: UserFitnessProfile,
  log: DailyLogs,
  history: DailyLogs[] = [],
): ReadinessScore {
  const sleepPenalty = Math.max(0, profile.targetSleepHours - log.sleepDurationHours) * 10;
  const stressPenalty = log.stress * 4;
  const exertionPenalty = Math.max(0, log.lastSessionRpe - 7) * 3;
  const sorenessPenalty = log.subjectiveSoreness * 2.3;
  const musclePenalty = averageMuscleSoreness(log) * 5.5;
  const recoveryTrendPenalty = buildRecoveryTrendPenalty(log, history);

  const score = clamp(
    Math.round(
      96 -
        sleepPenalty -
        stressPenalty -
        exertionPenalty -
        sorenessPenalty -
        musclePenalty -
        recoveryTrendPenalty
    ),
    0,
    100,
  );

  const state = getReadinessState(score);

  const summaryByState: Record<ReadinessState, string> = {
    green: "Go for heavy compounds and high intent sets.",
    yellow: "Proceed with calibrated volume and keep 1-2 reps in reserve.",
    red: "No-go for maximal lifting. Prioritize mobility, blood flow, and recovery.",
  };

  return {
    score,
    state,
    summary: summaryByState[state],
    peakWindow: {
      startHour: 6,
      endHour: 11,
    },
    hourlyPerformance: buildHourlyPerformance(
      log.wakeTime,
      profile.chronotype,
      log.stress,
      log.sleepDurationHours,
    ),
    updatedAt: new Date().toISOString(),
  };
}

export const mockReadinessScore: ReadinessScore = buildReadinessScore(
  mockUserProfile,
  mockDailyLog,
);
