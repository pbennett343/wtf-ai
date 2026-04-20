import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    console.log("POST /api/ai/generate - Key Length:", key.length);

    // Parse body ONCE, store in outer scope so catch block can access
    let prompt = "";
    let style = "cartoon";
    let context = "";

    try {
        const body = await req.json();
        prompt = body.prompt || "";
        style = body.style || "cartoon";
        context = body.context || "";

        if (!prompt) return NextResponse.json({ error: "No prompt provided" }, { status: 400 });

        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const isCartoon = style === 'cartoon';

        const analysisPrompt = `You are an image prompt engineer for an AI image generator. Analyze this sports stat text and generate a vivid image prompt (max 100 words).

STAT TEXT / CONTEXT:
"""
${(context || prompt).substring(0, 500)}
"""

USER PROMPT:
"""
${prompt.substring(0, 200)}
"""

CRITICAL INSTRUCTIONS:
1. Identify the athlete mentioned in the text
2. Look up their CURRENT team and EXACT team colors (primary + secondary). Be very specific — say "wearing a black and silver San Antonio Spurs jersey" not just "team colors"
3. Describe their real appearance briefly (skin tone, hair, height/build)
4. Determine the action from the stat (blocking, shooting, dunking, etc.)

THE TEAM JERSEY COLORS MUST APPEAR AT THE VERY START OF YOUR PROMPT AND BE REPEATED. Example: "wearing a purple and gold Los Angeles Lakers jersey, purple and gold uniform..."

${isCartoon
                ? `Style: Kid-friendly Disney/Pixar 3D cartoon, large expressive eyes, friendly smile, vibrant colors, chibi proportions. START the prompt with the exact jersey colors.`
                : `Style: Realistic sports photography, cinematic lighting, high-contrast, dynamic action, 8k. START the prompt with the exact jersey colors.`
            }

Return ONLY the image prompt, no explanation.`;

        const result = await model.generateContent(analysisPrompt);
        const generatedPrompt = result.response.text().trim().substring(0, 500);

        console.log("Gemini enriched prompt:", generatedPrompt);

        if (!generatedPrompt) throw new Error("Gemini returned empty response");

        return NextResponse.json({
            success: true,
            generatedPrompt
        });
    } catch (error: any) {
        console.error("Generate Error:", error?.message || error);

        // Fallback: Gemini failed, use a basic prompt from the already-parsed body
        const isCartoon = style === 'cartoon';
        const fallback = isCartoon
            ? `Kid-friendly Disney Pixar 3D cartoon character, large expressive eyes, vibrant colors. Subject: ${prompt.substring(0, 200)}`
            : `Realistic sports graphic, cinematic lighting, dynamic action. Subject: ${prompt.substring(0, 200)}`;

        return NextResponse.json({ success: true, generatedPrompt: fallback });
    }
}
