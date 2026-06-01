import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!key) return NextResponse.json({ error: "No API key" }, { status: 500 });

    try {
        const body = await req.json();
        const { text, images, winningAnswer, acceptMisspellings } = body;

        if (!text && (!images || images.length === 0)) {
            return NextResponse.json({ error: "No text or images provided" }, { status: 400 });
        }
        if (!winningAnswer) {
            return NextResponse.json({ error: "No winning answer provided" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const misspellingRule = acceptMisspellings 
            ? "Accept reasonable misspellings, abbreviations, or variations of the winning answer. For example if the answer is 'Spurs', accept 'spurs', 'SPURS', 'San Antonio Spurs', 'Spurss', etc." 
            : "Only accept EXACT text matches of the winning answer (case-insensitive).";

        const prompt = `You are a Giveaway Comment Scanner. You will be given screenshots or text from Instagram comments on a giveaway post.

YOUR TASK:
1. Look at each comment in the provided images/text.
2. Each comment has an Instagram username and their answer/guess.
3. Compare each person's answer against the WINNING ANSWER(S) below.
4. Return ONLY the usernames of people whose answer matches.

WINNING ANSWER(S): ${winningAnswer}
MATCHING RULE: ${misspellingRule}

IMPORTANT:
- Instagram usernames look like: mrj_2620, austin_sanchez_55, happy_thoughts_4days, etc.
- The username appears ABOVE or BEFORE the comment text.
- Do NOT include the @ symbol in your output.
- Remove duplicates.
- If you see the same username multiple times, include it only once.

Return your answer as a pure JSON array of strings. No markdown, no explanation, no code fences.
Example: ["mrj_2620", "austin_sanchez_55"]
If no one matched, return: []`;

        const contentParts: any[] = [prompt];

        if (text) {
            contentParts.push(`\n\nTEXT INPUT:\n${text}`);
        }

        if (images && images.length > 0) {
            for (const img of images) {
                const mimeMatch = img.match(/^data:(image\/\w+);base64,/);
                const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
                contentParts.push({
                    inlineData: {
                        data: img.split(",")[1],
                        mimeType,
                    },
                });
            }
        }

        const result = await model.generateContent(contentParts);
        const responseText = result.response.text();
        console.log("Gemini raw response:", responseText);
        
        let usernames: string[] = [];
        
        // Try direct JSON parse first
        try {
            const parsed = JSON.parse(responseText.trim());
            if (Array.isArray(parsed)) usernames = parsed;
        } catch (e) {
            // Regex fallback: extract JSON array from response text
            const match = responseText.match(/\[[\s\S]*?\]/);
            if (match) {
                try {
                    const parsed = JSON.parse(match[0]);
                    if (Array.isArray(parsed)) usernames = parsed;
                } catch (e2) {
                    console.error("Regex JSON extraction also failed:", match[0]);
                }
            } else {
                console.error("No JSON array found in response:", responseText);
            }
        }

        // Clean: remove @ symbols, trim whitespace, lowercase
        usernames = usernames
            .map(u => String(u).replace(/^@/, '').trim())
            .filter(u => u.length > 0);

        return NextResponse.json({ usernames });
    } catch (error: any) {
        console.error("Giveaway Scanner Error:", error);
        return NextResponse.json({ error: "Failed to scan", details: error.message }, { status: 500 });
    }
}
