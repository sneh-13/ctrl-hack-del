import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export interface CortexInsight {
    readinessForecast: {
        predictedScore: number | null;
        trend: "improving" | "declining" | "stable";
        confidence: string;
    };
    overtrainingRisk: {
        level: "low" | "moderate" | "high";
        signal: string;
    };
    recoveryRecommendation: string;
    optimalTrainingDay: {
        day: string;
        reason: string;
    };
    source: "cortex" | "gemini";
}

const ANALYSIS_PROMPT_PREFIX = `You are a sports science AI analyzing an athlete's training data. Analyze the data and respond with ONLY a JSON object (no markdown, no code fences, no explanations outside JSON) with this exact structure:
{"readinessForecast":{"predictedScore":<number 0-100>,"trend":"<improving|declining|stable>","confidence":"<1-2 sentence explanation>"},"overtrainingRisk":{"level":"<low|moderate|high>","signal":"<1-2 sentence explanation>"},"recoveryRecommendation":"<specific actionable 1-2 sentence advice>","optimalTrainingDay":{"day":"<day of week>","reason":"<1-2 sentence explanation>"}}

ATHLETE DATA:
`;

function parseInsightsJson(raw: string, source: "cortex" | "gemini"): CortexInsight {
    try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found");

        const parsed = JSON.parse(jsonMatch[0]);
        return {
            readinessForecast: {
                predictedScore: parsed.readinessForecast?.predictedScore ?? null,
                trend: parsed.readinessForecast?.trend ?? "stable",
                confidence: parsed.readinessForecast?.confidence ?? "Based on recent data",
            },
            overtrainingRisk: {
                level: parsed.overtrainingRisk?.level ?? "low",
                signal: parsed.overtrainingRisk?.signal ?? "No significant signals detected",
            },
            recoveryRecommendation: parsed.recoveryRecommendation ?? "Continue current training pattern",
            optimalTrainingDay: {
                day: parsed.optimalTrainingDay?.day ?? "Wednesday",
                reason: parsed.optimalTrainingDay?.reason ?? "Mid-week tends to show best readiness",
            },
            source,
        };
    } catch {
        return {
            readinessForecast: { predictedScore: null, trend: "stable", confidence: "Analysis pending" },
            overtrainingRisk: { level: "low", signal: "Insufficient structured data" },
            recoveryRecommendation: raw.slice(0, 300),
            optimalTrainingDay: { day: "Unknown", reason: "Could not parse analysis" },
            source,
        };
    }
}

async function trySnowflakeCortex(dataSummary: string, dayCount: number): Promise<CortexInsight | null> {
    try {
        const { isSnowflakeConfigured, snowflakeQuery, initSnowflakeSchema } =
            await import("@/lib/snowflake");

        if (!isSnowflakeConfigured()) return null;

        await initSnowflakeSchema();

        const cortexResult = await snowflakeQuery<{ ANALYSIS: string }>(
            `SELECT SNOWFLAKE.CORTEX.COMPLETE(
        'mistral-large2',
        CONCAT(
          'You are a sports science AI analyzing an athlete''s training data over the last ',
          ?,
          ' days. Analyze the following data and provide a JSON response with EXACTLY this structure (no markdown, no code fences, just raw JSON):',
          '{"readinessForecast":{"predictedScore":<number 0-100>,"trend":"<improving|declining|stable>","confidence":"<explanation>"},"overtrainingRisk":{"level":"<low|moderate|high>","signal":"<explanation>"},"recoveryRecommendation":"<specific actionable advice>","optimalTrainingDay":{"day":"<day of week>","reason":"<explanation>"}}',
          '\n\nATHLETE DATA:\n',
          ?
        )
      ) AS ANALYSIS`,
            [String(dayCount), dataSummary]
        );

        if (!cortexResult.length || !cortexResult[0].ANALYSIS) return null;

        console.log("[Cortex] Successfully got analysis from Snowflake Cortex");
        return parseInsightsJson(cortexResult[0].ANALYSIS, "cortex");
    } catch (err) {
        console.log("[Cortex] Snowflake Cortex unavailable:", (err as Error).message);
        return null;
    }
}

async function tryGemini(dataSummary: string): Promise<CortexInsight | null> {
    try {
        const { geminiGenerate } = await import("@/lib/gemini");

        const result = await geminiGenerate(
            ANALYSIS_PROMPT_PREFIX + dataSummary,
            "You are a sports science AI. Respond only with valid JSON, no other text."
        );

        console.log("[Cortex] Used Gemini fallback for analysis");
        return parseInsightsJson(result, "gemini");
    } catch (err) {
        console.error("[Cortex] Gemini fallback failed:", (err as Error).message);
        return null;
    }
}

async function getTrainingData(userId?: string): Promise<{ data: string; count: number } | null> {
    // Try Snowflake first
    try {
        const { isSnowflakeConfigured, snowflakeQuery, initSnowflakeSchema } =
            await import("@/lib/snowflake");

        if (isSnowflakeConfigured()) {
            await initSnowflakeSchema();

            const logs = await snowflakeQuery<{
                LOG_DATE: string;
                SLEEP_HOURS: number;
                STRESS: number;
                LAST_SESSION_RPE: number;
                SUBJECTIVE_SORENESS: number;
                READINESS_SCORE: number;
                READINESS_STATE: string;
                YESTERDAY_WORKOUT: string;
            }>(
                `SELECT LOG_DATE, SLEEP_HOURS, STRESS, LAST_SESSION_RPE,
                SUBJECTIVE_SORENESS, READINESS_SCORE, READINESS_STATE,
                YESTERDAY_WORKOUT
         FROM AURA.PUBLIC.DAILY_LOGS
         WHERE READINESS_SCORE IS NOT NULL
         ORDER BY LOG_DATE DESC
         LIMIT 14`
            );

            if (logs.length >= 2) {
                const reversed = logs.reverse();
                return {
                    data: reversed.map((l) =>
                        `Date: ${l.LOG_DATE} | Sleep: ${l.SLEEP_HOURS}h | Stress: ${l.STRESS}/10 | RPE: ${l.LAST_SESSION_RPE}/10 | Soreness: ${l.SUBJECTIVE_SORENESS}/10 | Readiness: ${l.READINESS_SCORE}/100 (${l.READINESS_STATE}) | Workout: ${l.YESTERDAY_WORKOUT || "rest"}`
                    ).join("\n"),
                    count: reversed.length
                };
            }
        }
    } catch (err) {
        console.log("[Cortex] Snowflake data fetch failed:", (err as Error).message);
    }

    // Fallback: MongoDB
    try {
        const { connectToDatabase } = await import("@/lib/mongodb");
        const DailyLog = (await import("@/lib/models/DailyLog")).default;

        const session = await getServerSession(authOptions);
        const targetUserId = userId || session?.user?.id;

        if (!targetUserId) return null;

        const query = { userId: targetUserId };

        await connectToDatabase();

        const logs = await DailyLog.find(query)
            .sort({ date: -1 })
            .limit(14)
            .lean<Array<{
                date: string;
                sleepDurationHours: number;
                stress: number;
                lastSessionRpe: number;
                subjectiveSoreness: number;
                readinessScore?: number;
                readinessState?: string;
                yesterdayWorkout?: string;
            }>>();

        if (logs.length < 2) return null;

        const reversed = [...logs].reverse();
        return {
            data: reversed.map((l) =>
                `Date: ${new Date(l.date).toISOString().slice(0, 10)} | Sleep: ${l.sleepDurationHours}h | Stress: ${l.stress}/10 | RPE: ${l.lastSessionRpe}/10 | Soreness: ${l.subjectiveSoreness}/10 | Readiness: ${l.readinessScore ?? "N/A"}/100 (${l.readinessState ?? "unknown"}) | Workout: ${l.yesterdayWorkout || "rest"}`
            ).join("\n"),
            count: reversed.length
        };
    } catch (err) {
        console.log("[Cortex] MongoDB data fetch failed:", (err as Error).message);
    }

    return null;
}

export async function getCortexInsights(userId?: string): Promise<CortexInsight | null> {
    const trainingData = await getTrainingData(userId);
    if (!trainingData) return null;

    let insights = await trySnowflakeCortex(trainingData.data, trainingData.count);
    if (!insights) {
        insights = await tryGemini(trainingData.data);
    }

    return insights;
}
