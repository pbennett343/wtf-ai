import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!key) return NextResponse.json({ error: "No API key" }, { status: 500 });

    try {
        const { transcript, numClips = 5 } = await req.json();

        if (!transcript || !transcript.length) {
            return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const transcriptText = transcript
            .map((s: { start: number; end: number; text: string }) =>
                `[${s.start.toFixed(1)}s-${s.end.toFixed(1)}s] ${s.text}`
            )
            .join("\n");

        const prompt = `You are a short-form video editor. Find the ${numClips} best clips for social media (Reels/TikTok).

Pick moments that are:
- Self-contained (make sense without context)
- 30-90 seconds long
- Strong hook in the first 5 seconds
- Surprising, emotional, or insightful

TRANSCRIPT:
${transcriptText}

Return ONLY valid JSON, no markdown:
{"clips":[{"start":12.5,"end":67.3,"hook":"One-sentence hook for this clip","reason":"Why it works"}]}`;

        const result = await model.generateContent(prompt);
        let raw = result.response.text().trim();

        // Strip markdown fences if present
        raw = raw.replace(/^```json\s*/m, "").replace(/\s*```$/m, "").trim();

        let clips;
        try {
            clips = JSON.parse(raw).clips;
        } catch {
            const match = raw.match(/\{[\s\S]*\}/);
            if (match) clips = JSON.parse(match[0]).clips;
            else throw new Error("Could not parse Gemini response");
        }

        return NextResponse.json({ clips });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        console.error("Clip Finder Error:", msg);
        return NextResponse.json({ error: "Failed to find clips", details: msg }, { status: 500 });
    }
}
