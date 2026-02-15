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
