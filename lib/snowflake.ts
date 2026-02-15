import snowflake from "snowflake-sdk";

let connectionPool: snowflake.Connection | null = null;

function getConnection(): Promise<snowflake.Connection> {
    if (connectionPool) return Promise.resolve(connectionPool);

    return new Promise((resolve, reject) => {
        const conn = snowflake.createConnection({
            account: process.env.SNOWFLAKE_ACCOUNT || "",
            username: process.env.SNOWFLAKE_USERNAME || "",
            password: process.env.SNOWFLAKE_PASSWORD || "",
            warehouse: process.env.SNOWFLAKE_WAREHOUSE || "COMPUTE_WH",
            database: process.env.SNOWFLAKE_DATABASE || "AURA",
            schema: "PUBLIC",
        });

        conn.connect((err) => {
            if (err) {
                console.error("[Snowflake] Connection failed:", err.message);
                reject(err);
                return;
            }
            console.log("[Snowflake] Connected successfully");
            connectionPool = conn;
            resolve(conn);
        });
    });
}

export async function snowflakeQuery<T = Record<string, unknown>>(
    sql: string,
    binds: snowflake.Binds = []
): Promise<T[]> {
    const conn = await getConnection();

    return new Promise((resolve, reject) => {
        conn.execute({
            sqlText: sql,
            binds,
            complete: (err, _stmt, rows) => {
                if (err) {
                    console.error("[Snowflake] Query error:", err.message);
                    reject(err);
                    return;
                }
                resolve((rows ?? []) as T[]);
            },
        });
    });
}

/** Initialize the AURA database and tables if they don't exist */
export async function initSnowflakeSchema(): Promise<void> {
    try {
        await snowflakeQuery(`CREATE DATABASE IF NOT EXISTS AURA`);
        await snowflakeQuery(`USE DATABASE AURA`);
        await snowflakeQuery(`CREATE SCHEMA IF NOT EXISTS PUBLIC`);

        await snowflakeQuery(`
      CREATE TABLE IF NOT EXISTS DAILY_LOGS (
        ID STRING DEFAULT UUID_STRING(),
        USER_ID STRING NOT NULL,
        LOG_DATE DATE NOT NULL,
        SLEEP_HOURS FLOAT,
        WAKE_TIME STRING,
        STRESS INT,
        LAST_SESSION_RPE INT,
        SUBJECTIVE_SORENESS INT,
        YESTERDAY_WORKOUT STRING,
        MUSCLE_SORENESS VARIANT,
        READINESS_SCORE INT,
        READINESS_STATE STRING,
        CREATED_AT TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
        PRIMARY KEY (ID)
      )
    `);

        await snowflakeQuery(`
      CREATE TABLE IF NOT EXISTS USER_PROFILES (
        USER_ID STRING NOT NULL,
        CHRONOTYPE STRING,
        EXPERIENCE_LEVEL STRING,
        TRAINING_GOAL STRING,
        WORKOUT_SPLIT STRING,
        TARGET_SLEEP_HOURS FLOAT,
        WAKE_TIME STRING,
        UPDATED_AT TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
        PRIMARY KEY (USER_ID)
      )
    `);

        console.log("[Snowflake] Schema initialized");
    } catch (err) {
        console.error("[Snowflake] Schema init error:", err);
    }
}

/** Check if Snowflake credentials are configured */
export function isSnowflakeConfigured(): boolean {
    return !!(
        process.env.SNOWFLAKE_ACCOUNT &&
        process.env.SNOWFLAKE_USERNAME &&
        process.env.SNOWFLAKE_PASSWORD &&
        process.env.SNOWFLAKE_PASSWORD !== "YOUR_PASSWORD_HERE"
    );
}

/** Sync a daily log to Snowflake (fire-and-forget, non-blocking) */
export async function syncLogToSnowflake(log: {
    userId: string;
    date: string;
    sleepHours: number;
    wakeTime: string;
    stress: number;
    lastSessionRpe: number;
    subjectiveSoreness: number;
    yesterdayWorkout: string;
    muscleSoreness: Record<string, unknown>;
    readinessScore?: number;
    readinessState?: string;
}): Promise<void> {
    if (!isSnowflakeConfigured()) return;

    try {
        await initSnowflakeSchema();

        // Use MERGE for upsert behavior based on USER_ID + LOG_DATE
        await snowflakeQuery(
            `MERGE INTO AURA.PUBLIC.DAILY_LOGS AS target
       USING (SELECT ? AS USER_ID, ?::DATE AS LOG_DATE) AS source
       ON target.USER_ID = source.USER_ID AND target.LOG_DATE = source.LOG_DATE
       WHEN MATCHED THEN UPDATE SET
         SLEEP_HOURS = ?, WAKE_TIME = ?, STRESS = ?,
         LAST_SESSION_RPE = ?, SUBJECTIVE_SORENESS = ?,
         YESTERDAY_WORKOUT = ?, MUSCLE_SORENESS = PARSE_JSON(?),
         READINESS_SCORE = ?, READINESS_STATE = ?,
         CREATED_AT = CURRENT_TIMESTAMP()
       WHEN NOT MATCHED THEN INSERT (
         USER_ID, LOG_DATE, SLEEP_HOURS, WAKE_TIME, STRESS,
         LAST_SESSION_RPE, SUBJECTIVE_SORENESS, YESTERDAY_WORKOUT,
         MUSCLE_SORENESS, READINESS_SCORE, READINESS_STATE
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, PARSE_JSON(?), ?, ?)`,
            [
                // source
                log.userId, log.date,
                // WHEN MATCHED — update values
                log.sleepHours, log.wakeTime, log.stress,
                log.lastSessionRpe, log.subjectiveSoreness,
                log.yesterdayWorkout, JSON.stringify(log.muscleSoreness),
                log.readinessScore ?? null, log.readinessState ?? null,
                // WHEN NOT MATCHED — insert values
                log.userId, log.date,
                log.sleepHours, log.wakeTime, log.stress,
                log.lastSessionRpe, log.subjectiveSoreness,
                log.yesterdayWorkout, JSON.stringify(log.muscleSoreness),
                log.readinessScore ?? null, log.readinessState ?? null,
            ]
        );

        console.log(`[Snowflake] Synced log for ${log.date}`);
    } catch (err) {
        console.error("[Snowflake] Log sync error:", (err as Error).message);
    }
}

/** Sync a user profile to Snowflake (fire-and-forget, non-blocking) */
export async function syncProfileToSnowflake(profile: {
    userId: string;
    chronotype?: string;
    experienceLevel?: string;
    trainingGoal?: string;
    workoutSplit?: string;
    targetSleepHours?: number;
    wakeTime?: string;
}): Promise<void> {
    if (!isSnowflakeConfigured()) return;

    try {
        await initSnowflakeSchema();

        await snowflakeQuery(
            `MERGE INTO AURA.PUBLIC.USER_PROFILES AS target
       USING (SELECT ? AS USER_ID) AS source
       ON target.USER_ID = source.USER_ID
       WHEN MATCHED THEN UPDATE SET
         CHRONOTYPE = ?, EXPERIENCE_LEVEL = ?, TRAINING_GOAL = ?,
         WORKOUT_SPLIT = ?, TARGET_SLEEP_HOURS = ?, WAKE_TIME = ?,
         UPDATED_AT = CURRENT_TIMESTAMP()
       WHEN NOT MATCHED THEN INSERT (
         USER_ID, CHRONOTYPE, EXPERIENCE_LEVEL, TRAINING_GOAL,
         WORKOUT_SPLIT, TARGET_SLEEP_HOURS, WAKE_TIME
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                // source
                profile.userId,
                // WHEN MATCHED
                profile.chronotype ?? null, profile.experienceLevel ?? null,
                profile.trainingGoal ?? null, profile.workoutSplit ?? null,
                profile.targetSleepHours ?? null, profile.wakeTime ?? null,
                // WHEN NOT MATCHED
                profile.userId,
                profile.chronotype ?? null, profile.experienceLevel ?? null,
                profile.trainingGoal ?? null, profile.workoutSplit ?? null,
                profile.targetSleepHours ?? null, profile.wakeTime ?? null,
            ]
        );

        console.log(`[Snowflake] Synced profile for ${profile.userId}`);
    } catch (err) {
        console.error("[Snowflake] Profile sync error:", (err as Error).message);
    }
}
