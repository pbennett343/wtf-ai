import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const ai = new GoogleGenAI({ apiKey: key });

    try {
        const { text } = await req.json();
        if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });

        const prompt = `
            Rewrite the following sports statistic in the signature '@wtfstats' style.
            
            GOLDEN RULES:
            - NO HEADERS. Never add "WTF STATS" or any title at the top.
            - DATA FIRST. Start with the most impactful numbers.
            - PUNCHY & DIRECT. No friendly explanations or filler words.
            - RAW VOICE. Be shocked by the numbers. If Wembanyama blocks 50% of the league, say it simply and aggressively.
            - LINE BREAKS. Use line breaks for dramatic impact between data points.
            - NO MARKDOWN OVERLOAD. No excessive bolding (**) unless for extreme emphasis on a single word.
            
            FORMATTING RULE FOR TRENDS:
            Rephrase the stat without changing the truth. For example:
            Original: "Oklahoma City is 7-0 ATS in its last 7 games against LA Lakers"
            WTF Style: "The Thunder are 7-0 ATS in their last 7 games vs the Lakers."
            Make sure to use team mascots/short names and standard sports vernacular (vs instead of against).

            TEXT TO REWORD:
            "${text}"
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const rewordedText = response.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate text.";
        return NextResponse.json({ text: rewordedText.trim() });
    } catch (error: any) {
        console.error("Reword Error:", error);
        return NextResponse.json({ error: "Failed to reword text", details: error.message }, { status: 500 });
    }
}

