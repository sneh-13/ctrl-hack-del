import { NextResponse } from "next/server";
import { getCortexInsights } from "@/lib/cortex";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId") || undefined;

        const insights = await getCortexInsights(userId);

        if (!insights) {
            return NextResponse.json(
                { error: "Prediction failed or insufficient data" },
                { status: 500 }
            );
        }

        return NextResponse.json({ insights });
    } catch (error) {
        console.error("[Cortex Predict Error]", error);
        return NextResponse.json(
            { error: "Prediction failed", message: (error as Error).message },
            { status: 500 }
        );
    }
}
