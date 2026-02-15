export type Chronotype = "lion" | "bear" | "wolf" | "dolphin";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type TrainingGoal = "hypertrophy" | "strength" | "cutting";

export type WorkoutSplit = "ppl" | "upper_lower" | "arnold";

export type ReadinessState = "green" | "yellow" | "red";

export type SorenessLevel = 0 | 1 | 2;

export type MuscleGroup =
  | "shoulders"
  | "chest"
  | "biceps"
  | "forearms"
  | "abs"
  | "quads"
  | "calves"
  | "traps"
  | "lats"
  | "triceps"
  | "lower_back"
  | "glutes"
  | "hamstrings";

export interface UserFitnessProfile {
  id: string;
  chronotype: Chronotype;
  experienceLevel: ExperienceLevel;
  trainingGoal: TrainingGoal;
  targetSleepHours: number;
  workoutSplit: WorkoutSplit;
  wakeTime: string;
  timezone: string;
}

export interface DailyLogs {
  date: string;
  sleepDurationHours: number;
  wakeTime: string;
  stress: number;
  yesterdayWorkout: string;
  lastSessionRpe: number;
  subjectiveSoreness: number;
  muscleSoreness: Record<MuscleGroup, SorenessLevel>;
  readinessScore?: number;
  readinessState?: ReadinessState;
  profileSnapshot?: UserFitnessProfile;
}

export interface ReadinessScore {
  score: number;
  state: ReadinessState;
  summary: string;
  peakWindow: {
    startHour: number;
    endHour: number;
  };
  hourlyPerformance: number[];
  updatedAt: string;
}
