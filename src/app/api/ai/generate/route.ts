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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const isCartoon = style === 'cartoon';
        const generatedPrompt = isCartoon
            ? `Playful kid-friendly character, Disney/Pixar style, large eyes, vibrant colors, 3D render. Subject: ${prompt.substring(0, 300)}. Wearing team colors.`
            : `Realistic sports graphic. Subject: ${prompt.substring(0, 300)}. High-contrast, dynamic action, 8k resolution, @wtfstats style.`;

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

