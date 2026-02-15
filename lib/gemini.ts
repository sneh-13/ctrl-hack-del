import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not set in .env.local");

const genAI = new GoogleGenerativeAI(apiKey);

export function getGeminiModel(systemInstruction?: string) {
    return genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        ...(systemInstruction ? { systemInstruction } : {}),
    });
}

/** Retry wrapper for Gemini calls — handles 429 rate limits with backoff */
export async function geminiGenerate(prompt: string, systemInstruction?: string): Promise<string> {
    const model = getGeminiModel(systemInstruction);
    const maxRetries = 3;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error: unknown) {
            const isRateLimit =
                error instanceof Error &&
                (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED"));

            if (isRateLimit && attempt < maxRetries) {
                const delay = [5000, 15000, 30000][attempt] ?? 30000;
                console.log(`[Gemini] Rate limited, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise((r) => setTimeout(r, delay));
                continue;
            }
            throw error;
        }
    }
    throw new Error("Max retries exceeded");
}
