import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    console.log("POST /api/ai/generate - Key Length:", key.length);
    try {
        const { prompt, style, context } = await req.json();
        if (!prompt) return NextResponse.json({ error: "No prompt provided" }, { status: 400 });

        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const isCartoon = style === 'cartoon';
        const generatedPrompt = isCartoon
            ? `Professional vector cartoon headshot/avatar. Simple flat colors, clean professional lines, minimalist sticker-style aesthetic. Solid neutral grey background. Subject: ${prompt}. CONTEXT: ${context || ""}. Focus on the player's face and shoulders wearing their team's colors. Professional sports portrait style.`
            : `A professional realistic sports graphic concept. SUBJECT: ${prompt}. CONTEXT/DATA: ${context || "N/A"}. AESTHETICS: High-contrast, dynamic action, cinematic lighting, 8k resolution, suitable for a premium sports brand like @wtfstats.`;

        console.log("Generate Success - Prompting for:", prompt);
        return NextResponse.json({
            success: true,
            message: "AI Generation Request Received",
            generatedPrompt
        });
    } catch (error: any) {
        console.error("Generate Error:", error);
        return NextResponse.json({ error: "Failed to generate image", details: error.message }, { status: 500 });
    }
}

