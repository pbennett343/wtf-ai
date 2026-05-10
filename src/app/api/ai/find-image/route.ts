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

    const prompt = `You are a sports image researcher. I need you to find 4 high-quality, publicly accessible sports action photos related to the primary subject of this stat:

STAT: "${statText}"

INSTRUCTIONS:
1. Identify the main Player or Team mentioned in the stat.
2. Search Google Images for recent action photos of THAT specific player or team. Do NOT search the exact stat text.
3. EXTREMELY IMPORTANT: Do NOT use images from Getty Images, AP Images, or Reuters. They block embedding and will break the app.
4. Prefer images from Wikipedia, Wikimedia Commons, official team sites, or ESPN.

Search query examples:
- "[player name] [team] action photo"
- "[team] game photo 2026"

Return ONLY a raw JSON array of 4 image URLs. Requirements:
- URLs must point directly to an image file if possible.
- Must be publicly accessible.
- Prefer Wikipedia, Wikimedia, ESPN, or official team sites.
- NEVER use Getty Images or AP Images (they block embedding).

Example format: ["https://upload.wikimedia.org/wikipedia/commons/...", "https://a.espncdn.com/photo/...", "https://...", "https://..."]

Return ONLY the JSON array. No markdown, no explanation, no other text.`;

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
