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
1. Identify if the stat is primarily about a specific PLAYER or a TEAM.
2. If it is a PLAYER: Search Google for the player's ESPN profile to find their ESPN Player ID. Return their official transparent headshot using this exact format: \`https://a.espncdn.com/combiner/i?img=/i/headshots/mlb/players/full/[ESPN_ID].png\`
3. If it is a TEAM: Return their official ESPN logo using this exact format: \`https://a.espncdn.com/i/teamlogos/mlb/500/[TEAM_ABBREVIATION].png\` (e.g., 'phi', 'nyy', 'lad').
4. WIKIPEDIA FALLBACK: For your remaining image slots, search Wikipedia or Wikimedia Commons for action photos of the player or team. These URLs MUST start with \`https://upload.wikimedia.org/\`.
5. EXTREMELY IMPORTANT: Do NOT return any URLs from local news, Yahoo, Bleacher Report, USA Today, or Getty/AP. They will ALL be blocked by CORS protections. ONLY return ESPN CDN links or Wikimedia Commons links.

Search query examples:
- "[player name] espn mlb profile"
- "[player name] wikimedia commons photo"

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
