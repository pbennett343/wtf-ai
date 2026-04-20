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
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const isCartoon = style === 'cartoon';

        // Use Gemini to analyze the stat text and build a rich image description
        const analysisPrompt = `You are an image prompt engineer. Analyze this sports stat text and generate a short, vivid image prompt (max 120 words).

STAT TEXT / CONTEXT:
"""
${(context || prompt).substring(0, 500)}
"""

USER PROMPT:
"""
${prompt.substring(0, 200)}
"""

Your task:
1. Identify the main athlete/person mentioned
2. Recall their real appearance: skin tone, hair style, facial hair, height/build
3. Identify their current team and exact team colors (jersey color, accent colors)
4. Determine the key action from the stat (blocking, scoring, dunking, etc.)

${isCartoon
                ? `Generate a prompt for a CARTOON image: kid-friendly Disney/Pixar 3D style, large expressive eyes, friendly smile, vibrant colors, chibi proportions. The character should be recognizable as the real athlete wearing their actual team jersey colors.`
                : `Generate a prompt for a REALISTIC sports graphic: cinematic lighting, high-contrast, dynamic action pose, 8k resolution, dramatic atmosphere.`
            }

Return ONLY the image generation prompt, nothing else. No quotes, no explanation.`;

        const result = await model.generateContent(analysisPrompt);
        const generatedPrompt = result.response.text().trim().substring(0, 500);

        console.log("Gemini enriched prompt:", generatedPrompt);

        if (!generatedPrompt) throw new Error("Gemini returned empty response");

        return NextResponse.json({
            success: true,
            message: "AI Generation Request Received",
            generatedPrompt
        });
    } catch (error: any) {
        console.error("Generate Error:", error);

        // Fallback: if Gemini fails, use a basic prompt
        const isCartoon = style === 'cartoon';
        const fallback = isCartoon
            ? `Playful kid-friendly cartoon character, Disney/Pixar 3D style, large eyes, vibrant team colors. Subject: ${prompt.substring(0, 200)}`
            : `Realistic sports graphic, cinematic lighting, dynamic action. Subject: ${prompt.substring(0, 200)}`;
        return NextResponse.json({ success: true, generatedPrompt: fallback });
    }
}
