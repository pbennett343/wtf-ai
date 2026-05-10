import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!key) return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

    let statText = "";
    try {
        const body = await req.json();
        statText = body.statText || "";
    } catch (_) { }

    if (!statText) return NextResponse.json({ error: "No stat text provided" }, { status: 400 });

    const prompt = `You are a sports image researcher. I need you to find 4 high-quality sports action photos related to the primary subject of this stat:

STAT: "${statText}"

INSTRUCTIONS:
1. Identify the main PLAYER or TEAM mentioned in the stat.
2. Search Google Images for high-quality action photos of that player or team.
3. Return up to 4 direct image URLs. The URLs must point directly to image files (ending in .jpg, .png, .webp, etc. or served as image content).
4. PRIORITIZE in this order:
   a. ESPN CDN headshots: \`https://a.espncdn.com/combiner/i?img=/i/headshots/mlb/players/full/[ESPN_ID].png\` (search "[player name] espn profile" to find the ID)
   b. ESPN team logos: \`https://a.espncdn.com/i/teamlogos/mlb/500/[TEAM_ABBREVIATION].png\`
   c. Wikipedia/Wikimedia Commons images (URLs starting with https://upload.wikimedia.org/)
   d. Any other direct image URL from Google Images results
5. ANTI-TIMEOUT: Do NOT endlessly search. After 2-3 searches, return the best URLs you found.

Search query examples:
- "[player name] espn mlb profile"
- "[player name] [team] action photo"
- "[team name] baseball photo"

Return ONLY a raw JSON array of up to 4 image URLs. Requirements:
- Do NOT return an empty array. Always return at least 1 URL (use ESPN team logo as fallback).
- No markdown, no explanation, no other text. Just the raw JSON array.

Example format: ["https://a.espncdn.com/combiner/i?img=/i/headshots/mlb/players/full/12345.png", "https://upload.wikimedia.org/wikipedia/commons/..."]

Return ONLY the JSON array.`;

    try {
        const ai = new GoogleGenAI({ apiKey: key });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.1,
            }
        });

        const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        let outputText = rawText;
        
        // Extract JSON array using regex in case there is surrounding text
        const jsonMatch = outputText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            outputText = jsonMatch[0];
        }

        try {
            const images: string[] = JSON.parse(outputText);
            const validImages = images.filter(u => typeof u === 'string' && u.startsWith('http'));
            return NextResponse.json({ success: true, images: validImages.slice(0, 4) });
        } catch (parseError) {
            console.error("JSON Parse Error. Raw text was:", rawText);
            return NextResponse.json({ error: "Parse Error. AI said: " + rawText.substring(0, 200) + "..." }, { status: 500 });
        }

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Failed to find images";
        console.error("Find Image Error:", msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
