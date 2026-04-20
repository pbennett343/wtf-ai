import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(key);

export async function POST(req: Request) {
    console.log("POST /api/ai/reword - Key Length:", key.length);
    try {
        const { text } = await req.json();
        if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ]
        });

        const prompt = `
            Rewrite the following sports statistic in the signature '@wtfstats' style.
            
            GOLDEN RULES:
            - NO HEADERS. Never add "WTF STATS" or any title at the top.
            - DATA FIRST. Start with the most impactful numbers.
            - PUNCHY & DIRECT. No friendly explanations or filler words.
            - RAW VOICE. Be shocked by the numbers. If Wembanyama blocks 50% of the league, say it simply and aggressively.
            - LINE BREAKS. Use line breaks for dramatic impact between data points.
            - NO MARKDOWN OVERLOAD. No excessive bolding (**) unless for extreme emphasis on a single word.
            
            TEXT TO REWORD:
            "${text}"
        `;

        const result = await model.generateContent(prompt);
        const rewordedText = result.response.text();
        console.log("Reword Success");
        return NextResponse.json({ text: rewordedText });
    } catch (error: any) {
        console.error("Reword Error:", error);
        return NextResponse.json({ error: "Failed to reword text", details: error.message }, { status: 500 });
    }
}

