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
2. Search Google Images for action photos of THAT specific player or team from the last month. Do NOT search the exact stat text.
3. EXTREMELY IMPORTANT: You MUST ONLY return non-copyrighted, creative commons, or fair-use images that permit hotlinking. 
4. Do NOT use images from Getty Images, AP Images, Reuters, or USA Today. They strictly block embedding and will break the app.
5. Prioritize images from Wikipedia, Wikimedia Commons, Flickr (Creative Commons), or official team/league CDNs.
6. ANTI-TIMEOUT RULE: Do NOT endlessly search. If you cannot find good Creative Commons action photos after 2 searches, immediately fallback to returning official ESPN/Wikipedia team logos or player headshots.

Search query examples:
- "[player name] [team] action photo 2026"
- "[team] game photo 2026 creative commons"

Return ONLY a raw JSON array of up to 4 image URLs. Requirements:
- URLs must point directly to an image file.
- It is CRITICAL that you return at least 1 image. Do NOT return an empty array. If you can only find 1 or 2 good images, that is fine.
- If you cannot find action photos, it is acceptable to return a direct link to the team's logo (e.g. ESPN CDN logo) or a player headshot.
- NEVER use Getty Images or AP Images (they block embedding).

Example format: ["https://upload.wikimedia.org/wikipedia/commons/...", "https://a.espncdn.com/i/teamlogos/..."]

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
