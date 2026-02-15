import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import DailyLog from "@/lib/models/DailyLog";
import type { DailyLogs } from "@/types";

interface DailyLogDocumentShape extends DailyLogs {
  _id?: string;
  userId?: string;
  dayKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

function toDayKey(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function normalizeLog(log: DailyLogDocumentShape): DailyLogs {
  return {
    date: log.date,
    sleepDurationHours: log.sleepDurationHours,
    wakeTime: log.wakeTime,
    stress: log.stress,
    yesterdayWorkout: log.yesterdayWorkout ?? "",
    lastSessionRpe: log.lastSessionRpe,
    subjectiveSoreness: log.subjectiveSoreness,
    muscleSoreness: log.muscleSoreness,
    readinessScore: log.readinessScore,
    readinessState: log.readinessState,
    profileSnapshot: log.profileSnapshot,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const logs = await DailyLog.find({ userId: session.user.id })
    .sort({ date: -1 })
    .lean<DailyLogDocumentShape[]>();

  return NextResponse.json({ logs: logs.map(normalizeLog) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as DailyLogs;

  if (
    !payload ||
    typeof payload.date !== "string" ||
    typeof payload.sleepDurationHours !== "number" ||
    typeof payload.wakeTime !== "string" ||
    typeof payload.stress !== "number" ||
    typeof payload.lastSessionRpe !== "number" ||
    typeof payload.subjectiveSoreness !== "number" ||
    typeof payload.muscleSoreness !== "object" ||
    (payload.readinessScore !== undefined && typeof payload.readinessScore !== "number") ||
    (payload.readinessState !== undefined &&
      payload.readinessState !== "green" &&
      payload.readinessState !== "yellow" &&
      payload.readinessState !== "red") ||
    (payload.profileSnapshot !== undefined && typeof payload.profileSnapshot !== "object")
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const dayKey = toDayKey(payload.date);

  if (!dayKey) {
    return NextResponse.json({ error: "Invalid log date" }, { status: 400 });
  }

  await connectToDatabase();

  const saved = await DailyLog.findOneAndUpdate(
    { userId: session.user.id, dayKey },
    {
      $set: {
        userId: session.user.id,
        dayKey,
        date: payload.date,
        sleepDurationHours: payload.sleepDurationHours,
        wakeTime: payload.wakeTime,
        stress: payload.stress,
        yesterdayWorkout: payload.yesterdayWorkout,
        lastSessionRpe: payload.lastSessionRpe,
        subjectiveSoreness: payload.subjectiveSoreness,
        muscleSoreness: payload.muscleSoreness,
        readinessScore: payload.readinessScore,
        readinessState: payload.readinessState,
        profileSnapshot: payload.profileSnapshot,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  ).lean<DailyLogDocumentShape>();

  // Fire-and-forget sync to Snowflake (non-blocking)
  import("@/lib/snowflake").then(({ syncLogToSnowflake, syncProfileToSnowflake }) => {
    syncLogToSnowflake({
      userId: session.user!.id,
      date: dayKey,
      sleepHours: payload.sleepDurationHours,
      wakeTime: payload.wakeTime,
      stress: payload.stress,
      lastSessionRpe: payload.lastSessionRpe,
      subjectiveSoreness: payload.subjectiveSoreness,
      yesterdayWorkout: payload.yesterdayWorkout ?? "",
      muscleSoreness: payload.muscleSoreness,
      readinessScore: payload.readinessScore,
      readinessState: payload.readinessState,
    });

    // Also sync profile if snapshot is included
    if (payload.profileSnapshot) {
      syncProfileToSnowflake({
        userId: session.user!.id,
        chronotype: payload.profileSnapshot.chronotype,
        experienceLevel: payload.profileSnapshot.experienceLevel,
        trainingGoal: payload.profileSnapshot.trainingGoal,
        workoutSplit: payload.profileSnapshot.workoutSplit,
        wakeTime: payload.profileSnapshot.wakeTime,
      });
    }
  }).catch((err) => console.error("[Snowflake] Import failed:", err));

  return NextResponse.json({ log: normalizeLog(saved) }, { status: 201 });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const result = await DailyLog.deleteMany({ userId: session.user.id });

  return NextResponse.json({
    ok: true,
    deletedCount: result.deletedCount ?? 0,
  });
}
