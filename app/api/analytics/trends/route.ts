import { NextResponse } from "next/server";

// This endpoint returns mock analytics data.
// When Snowflake is connected, it will query real aggregated training data.
// For now, we generate realistic sample data so the assistant can reference trends.

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
        sleepVsReadiness: Array.from({ length: 14 }, (_, i) => ({
            sleepHours: 5 + Math.random() * 4,
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

// Try Snowflake query, fall back to mock data
async function getTrendsData(): Promise<TrendData> {
    try {
        // Only attempt Snowflake if credentials are configured
        if (
            process.env.SNOWFLAKE_ACCOUNT &&
            process.env.SNOWFLAKE_PASSWORD &&
            process.env.SNOWFLAKE_PASSWORD !== "YOUR_PASSWORD_HERE"
        ) {
            const { snowflakeQuery, initSnowflakeSchema } = await import("@/lib/snowflake");

            // Ensure schema exists
            await initSnowflakeSchema();

            // Try to query real data
            const logs = await snowflakeQuery<{
                LOG_DATE: string;
                SLEEP_HOURS: number;
                READINESS_SCORE: number;
                STRESS: number;
            }>(
                `SELECT LOG_DATE, SLEEP_HOURS, READINESS_SCORE, STRESS
         FROM AURA.PUBLIC.DAILY_LOGS
         ORDER BY LOG_DATE DESC
         LIMIT 30`
            );

            if (logs.length > 0) {
                // Build real trends from Snowflake data
                // For now, return mock — real queries will be added as data is collected
                console.log(`[Snowflake] Found ${logs.length} log records`);
            }
        }
    } catch (err) {
        console.log("[Snowflake] Not available, using mock data:", (err as Error).message);
    }

    return generateMockTrends();
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
