import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";
// Rachel voice — warm, clear female voice good for coaching
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.ELEVENLABS_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "ElevenLabs API key not configured. Add ELEVENLABS_API_KEY to .env.local" },
                { status: 503 }
            );
        }

        const { text, voiceId } = await req.json();

        if (!text || typeof text !== "string") {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        // Limit text length for free tier
        const trimmedText = text.slice(0, 500);

        const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId || DEFAULT_VOICE_ID}`, {
            method: "POST",
            headers: {
                "xi-api-key": apiKey,
                "Content-Type": "application/json",
                Accept: "audio/mpeg",
            },
            body: JSON.stringify({
                text: trimmedText,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.6,
                    similarity_boost: 0.75,
                    style: 0.3,
                },
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("[ElevenLabs Error]", response.status, err);
            return NextResponse.json(
                { error: "TTS generation failed" },
                { status: response.status }
            );
        }

        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": String(audioBuffer.byteLength),
            },
        });
    } catch (error) {
        console.error("[TTS Error]", error);
        return NextResponse.json(
            { error: "Failed to generate speech" },
            { status: 500 }
        );
    }
}
