import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate } from "@/lib/gemini";

const AURA_SYSTEM_PROMPT = `You are Aura, a virtual AI fitness coach and assistant built into the Aura Bio-Adaptive Gym Optimizer app.

ABOUT THE APP:
Aura is a fitness platform that uses bio-adaptive algorithms to optimize gym training. It tracks:
- Sleep duration & wake time
- Stress levels (0-10)
- Muscle soreness via an interactive body map (13 muscle groups, 3 levels: recovered/moderate/sore)
- Session RPE (Rate of Perceived Exertion)
- Yesterday's workout description

The app calculates a READINESS SCORE (0-100) that determines training state:
- GREEN (≥70): GO for high-intent training — full volume, heavy compounds
- YELLOW (50-69): CAUTION — calibrate volume, reduce intensity 10-15%
- RED (<50): NO-GO for max loading — do mobility, recovery, light work only

CHRONOTYPES (affect peak training windows):
- Lion: Early explosive — peak 6-10h post-wake, best for AM heavy compounds
- Bear: Balanced midday — peak 8-14h post-wake, most common rhythm
- Wolf: Late predator — peak 12-18h post-wake, strong PM performance
- Dolphin: Light/fragmented sleeper — narrow 10-14h post-wake window

FEATURES YOU CAN HELP WITH:
1. Explain readiness scores and what drives them
2. Recommend training adjustments based on soreness/fatigue
3. Suggest exercise swaps for sore muscle groups
4. Explain chronotype-based training windows
5. Guide users through the daily check-in process
6. Provide recovery and sleep optimization tips
7. Help interpret training trends and patterns

PERSONALITY:
- Speak like a knowledgeable, supportive coach — confident but not pushy
- Be concise (2-4 sentences usually). Use bold (**text**) for key points
- Reference the user's actual data when available
- Never say "as an AI" — you ARE Aura, their personal coach
- Use fitness terminology naturally: RPE, volume, deload, compounds, accessories etc.
- If asked about things outside fitness/health, politely redirect to training topics`;

export async function POST(req: NextRequest) {
    try {
        const { message, profile, readiness, latestLog, history } = await req.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "No message provided" }, { status: 400 });
        }

        // Build context prompt with user's current data
        const contextBlock = `
CURRENT USER CONTEXT:
- Name: ${profile?.name || "Athlete"}
- Chronotype: ${profile?.chronotype || "unknown"}
- Experience: ${profile?.experienceLevel || "unknown"}
- Goal: ${profile?.trainingGoal || "unknown"}
- Split: ${profile?.workoutSplit || "unknown"}
- Wake time: ${profile?.wakeTime || "unknown"}

CURRENT READINESS:
- Score: ${readiness?.score ?? "N/A"}/100
- State: ${readiness?.state ?? "unknown"} (${readiness?.state === "green" ? "GO" : readiness?.state === "yellow" ? "CAUTION" : "NO-GO"})

LATEST LOG:
- Sleep: ${latestLog?.sleepDurationHours ?? "unknown"}h
- Stress: ${latestLog?.stress ?? "unknown"}/10
- RPE: ${latestLog?.lastSessionRpe ?? "unknown"}/10
- Soreness: ${latestLog?.subjectiveSoreness ?? "unknown"}/10
- Sore muscles: ${JSON.stringify(latestLog?.muscleSoreness ?? {})}
- Yesterday's workout: ${latestLog?.yesterdayWorkout ?? "none logged"}`;

        // Build conversation history for multi-turn context
        const historyContext = (history || [])
            .slice(-6) // Keep last 6 messages for context
            .map((h: { role: string; text: string }) => `${h.role === "user" ? "User" : "Aura"}: ${h.text}`)
            .join("\n");

        const fullPrompt = `${contextBlock}
${historyContext ? `CONVERSATION SO FAR:\n${historyContext}\n` : ""}
User: ${message}

Respond as Aura:`;

        const reply = await geminiGenerate(fullPrompt, AURA_SYSTEM_PROMPT);

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("[AI Chat Error]", error);
        if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
            return NextResponse.json(
                { error: "Gemini API key not configured. Add GEMINI_API_KEY to .env.local" },
                { status: 503 }
            );
        }
        return NextResponse.json(
            { error: "Failed to generate response. Please try again." },
            { status: 500 }
        );
    }
}
