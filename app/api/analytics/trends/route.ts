import { NextResponse } from "next/server";

interface TrendData {
    readinessByDay: { day: string; avgScore: number }[];
    sleepVsReadiness: { sleepHours: number; readinessScore: number }[];
    sorenessFrequency: { muscle: string; frequency: number }[];
    weeklyVolume: { week: string; sessions: number; avgRpe: number }[];
}

function generateMockTrends(): TrendData {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return {
        readinessByDay: days.map((day) => ({
            day,
            avgScore: Math.round(55 + Math.random() * 30),
        })),
        sleepVsReadiness: Array.from({ length: 14 }, () => ({
            sleepHours: +(5 + Math.random() * 4).toFixed(1),
            readinessScore: Math.round(30 + (5 + Math.random() * 4) * 8 + Math.random() * 10),
        })),
        sorenessFrequency: [
            { muscle: "quads", frequency: 8 },
            { muscle: "hamstrings", frequency: 6 },
            { muscle: "shoulders", frequency: 5 },
            { muscle: "chest", frequency: 4 },
            { muscle: "lower_back", frequency: 4 },
            { muscle: "lats", frequency: 3 },
            { muscle: "glutes", frequency: 3 },
        ],
        weeklyVolume: Array.from({ length: 8 }, (_, i) => ({
            week: `W${i + 1}`,
            sessions: 3 + Math.floor(Math.random() * 3),
            avgRpe: Math.round((5 + Math.random() * 4) * 10) / 10,
        })),
    };
}

async function getTrendsData(): Promise<TrendData> {
    try {
        const { isSnowflakeConfigured, snowflakeQuery, initSnowflakeSchema } =
            await import("@/lib/snowflake");

        if (!isSnowflakeConfigured()) {
            console.log("[Analytics] Snowflake not configured, using mock data");
            return generateMockTrends();
        }

        await initSnowflakeSchema();

        // --- 1. Readiness by day of week ---
        const readinessByDayRaw = await snowflakeQuery<{
            DOW: string;
            AVG_SCORE: number;
        }>(
            `SELECT DAYNAME(LOG_DATE) AS DOW, ROUND(AVG(READINESS_SCORE)) AS AVG_SCORE
       FROM AURA.PUBLIC.DAILY_LOGS
       WHERE READINESS_SCORE IS NOT NULL
       GROUP BY DAYNAME(LOG_DATE)
       ORDER BY MIN(DAYOFWEEK(LOG_DATE))`
        );

        // --- 2. Sleep vs readiness scatter ---
        const sleepVsReadinessRaw = await snowflakeQuery<{
            SLEEP_HOURS: number;
            READINESS_SCORE: number;
        }>(
            `SELECT SLEEP_HOURS, READINESS_SCORE
       FROM AURA.PUBLIC.DAILY_LOGS
       WHERE SLEEP_HOURS IS NOT NULL AND READINESS_SCORE IS NOT NULL
       ORDER BY LOG_DATE DESC
       LIMIT 30`
        );

        // --- 3. Soreness frequency (parse VARIANT column) ---
        const sorenessRaw = await snowflakeQuery<{
            MUSCLE: string;
            FREQ: number;
        }>(
            `SELECT f.key AS MUSCLE, COUNT(*) AS FREQ
       FROM AURA.PUBLIC.DAILY_LOGS,
            LATERAL FLATTEN(input => MUSCLE_SORENESS) f
       WHERE f.value::STRING IN ('moderate', 'sore')
       GROUP BY f.key
       ORDER BY FREQ DESC
       LIMIT 10`
        );

        // --- 4. Weekly volume ---
        const weeklyVolumeRaw = await snowflakeQuery<{
            WEEK_NUM: string;
            SESSIONS: number;
            AVG_RPE: number;
        }>(
            `SELECT CONCAT('W', WEEKISO(LOG_DATE)) AS WEEK_NUM,
              COUNT(*) AS SESSIONS,
              ROUND(AVG(LAST_SESSION_RPE), 1) AS AVG_RPE
       FROM AURA.PUBLIC.DAILY_LOGS
       WHERE LAST_SESSION_RPE IS NOT NULL
       GROUP BY WEEKISO(LOG_DATE), YEAR(LOG_DATE)
       ORDER BY YEAR(LOG_DATE) DESC, WEEKISO(LOG_DATE) DESC
       LIMIT 8`
        );

        // Check if we got enough data from Snowflake
        const hasData =
            readinessByDayRaw.length > 0 ||
            sleepVsReadinessRaw.length > 0 ||
            sorenessRaw.length > 0 ||
            weeklyVolumeRaw.length > 0;

        if (!hasData) {
            console.log("[Analytics] Snowflake connected but no data yet, using mock");
            return generateMockTrends();
        }

        console.log(`[Analytics] Snowflake data: ${readinessByDayRaw.length} days, ${sleepVsReadinessRaw.length} sleep records, ${sorenessRaw.length} soreness entries, ${weeklyVolumeRaw.length} weeks`);

        // Map day abbreviations
        const dayMap: Record<string, string> = {
            Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thu",
            Fri: "Fri", Sat: "Sat", Sun: "Sun",
        };

        const mock = generateMockTrends();

        return {
            readinessByDay: readinessByDayRaw.length > 0
                ? readinessByDayRaw.map((r) => ({
                    day: dayMap[r.DOW] || r.DOW,
                    avgScore: r.AVG_SCORE,
                }))
                : mock.readinessByDay,

            sleepVsReadiness: sleepVsReadinessRaw.length > 0
                ? sleepVsReadinessRaw.map((r) => ({
                    sleepHours: r.SLEEP_HOURS,
                    readinessScore: r.READINESS_SCORE,
                }))
                : mock.sleepVsReadiness,

            sorenessFrequency: sorenessRaw.length > 0
                ? sorenessRaw.map((r) => ({
                    muscle: r.MUSCLE,
                    frequency: r.FREQ,
                }))
                : mock.sorenessFrequency,

            weeklyVolume: weeklyVolumeRaw.length > 0
                ? weeklyVolumeRaw.reverse().map((r) => ({
                    week: r.WEEK_NUM,
                    sessions: r.SESSIONS,
                    avgRpe: r.AVG_RPE,
                }))
                : mock.weeklyVolume,
        };
    } catch (err) {
        console.log("[Analytics] Snowflake query failed, using mock data:", (err as Error).message);
        return generateMockTrends();
    }
}

export async function GET() {
    try {
        const trends = await getTrendsData();
        return NextResponse.json(trends);
    } catch (error) {
        console.error("[Analytics Error]", error);
        return NextResponse.json(
            { error: "Failed to fetch trends" },
            { status: 500 }
        );
    }
}
