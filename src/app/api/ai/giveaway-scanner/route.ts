import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow more time for processing multiple frames

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
        // Using pro for better accuracy with many frames and complex instructions
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const misspellingRule = acceptMisspellings 
            ? "Accept reasonable misspellings or variations of the winning answer." 
            : "Only accept EXACT matches of the winning answer.";

        const prompt = `You are a Giveaway Scanner.
Your job is to look at the provided text and/or image frames (which may be screenshots or frames from a video of Instagram comments).
Find all Instagram usernames who correctly guessed the winning answer.

WINNING ANSWER(S): ${winningAnswer}
RULE: ${misspellingRule}

Return ONLY a JSON array of strings containing the valid usernames. Ensure there are no duplicate usernames. Do not include the @ symbol.
Example: ["john_doe123", "sports_fan99"]`;

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
        
        let usernames = [];
        try {
            usernames = JSON.parse(responseText);
            if (!Array.isArray(usernames)) usernames = [];
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", responseText);
        }

        return NextResponse.json({ usernames });
    } catch (error: any) {
        console.error("Giveaway Scanner Error:", error);
        return NextResponse.json({ error: "Failed to scan", details: error.message }, { status: 500 });
    }
}
