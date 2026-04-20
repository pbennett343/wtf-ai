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
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const isCartoon = style === 'cartoon';

        // Use Gemini to analyze the stat text and build a rich image description
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

        return NextResponse.json({
            success: true,
            message: "AI Generation Request Received",
            generatedPrompt
        });
    } catch (error: any) {
        console.error("Generate Error:", error);

        // Fallback: if Gemini fails, use a basic prompt
        try {
            const { prompt, style } = await req.json();
            const isCartoon = style === 'cartoon';
            const fallback = isCartoon
                ? `Playful kid-friendly cartoon character, Disney/Pixar 3D style, large eyes, vibrant team colors. Subject: ${prompt?.substring(0, 200)}`
                : `Realistic sports graphic, cinematic lighting, dynamic action. Subject: ${prompt?.substring(0, 200)}`;
            return NextResponse.json({ success: true, generatedPrompt: fallback });
        } catch {
            return NextResponse.json({ error: "Failed to generate image", details: error.message }, { status: 500 });
        }
    }
}
