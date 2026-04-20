import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    console.log("POST /api/ai/generate - Key Length:", key.length);

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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const isCartoon = style === 'cartoon';

        const analysisPrompt = `You are an expert image prompt engineer. I need you to create a precise, detailed image generation prompt based on a sports statistic.

STAT TEXT:
"""
${(context || prompt).substring(0, 600)}
"""

INSTRUCTIONS — follow every step:

STEP 1: Identify the athlete in the stat. Who is this person?
STEP 2: What team do they play for RIGHT NOW? What are the team's EXACT primary and secondary colors? (e.g. San Antonio Spurs = black and silver, Los Angeles Lakers = purple and gold, Boston Celtics = green and white)
STEP 3: What does this athlete actually look like? (skin tone, hair color/style, facial hair, build, height)
STEP 4: What action is described in the stat? (blocking shots, scoring, dunking, passing, etc.)

NOW BUILD THE PROMPT using this exact structure:
"[BACKGROUND COLOR] solid flat background in [team primary color]. [ATHLETE DESCRIPTION] wearing a [team primary color] and [team secondary color] [team name] jersey, [team primary color] and [team secondary color] shorts. [ACTION from stat]. ${isCartoon
                ? `Kid-friendly 3D cartoon character in Disney Pixar style, chibi proportions, oversized head, large round expressive eyes, cute friendly smile, smooth 3D render, vibrant saturated colors.`
                : `Realistic digital art, dramatic studio lighting, sharp details, professional sports photography style, 8k resolution.`
            } The background MUST be a solid flat [team primary color] color with no other elements."

CRITICAL RULES:
- The FIRST words must describe the solid colored background matching the team's primary color
- Mention the team colors AT LEAST 3 times in the prompt
- The background must be SOLID and FLAT — no stadium, no crowd, no scenery
- Keep it under 150 words

Return ONLY the prompt. No quotes, no explanation, no preamble.`;

        const result = await model.generateContent(analysisPrompt);
        const generatedPrompt = result.response.text().trim().substring(0, 600);

        console.log("Gemini enriched prompt:", generatedPrompt);

        if (!generatedPrompt) throw new Error("Gemini returned empty response");

        return NextResponse.json({
            success: true,
            source: "gemini",
            generatedPrompt
        });
    } catch (error: any) {
        console.error("Generate Error:", error?.message || error);

        const isCartoon = style === 'cartoon';
        const fallback = isCartoon
            ? `Solid blue background. Kid-friendly Disney Pixar 3D cartoon character, chibi proportions, large expressive eyes, cute smile, wearing a sports jersey. Subject: ${prompt.substring(0, 200)}. Solid colored background, no scenery.`
            : `Solid dark background. Realistic sports portrait, dramatic studio lighting, sharp details. Subject: ${prompt.substring(0, 200)}. Solid colored background, no scenery.`;

        return NextResponse.json({ success: true, source: "fallback", generatedPrompt: fallback });
    }
}
