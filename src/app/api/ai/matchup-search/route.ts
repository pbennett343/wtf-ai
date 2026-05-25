import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!key) return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

    try {
        const { statText } = await req.json();
        if (!statText) return NextResponse.json({ error: "No stat text provided" }, { status: 400 });

        const prompt = `
            Today is ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" })}.
            Based on this sports statistic text:
            "${statText}"

            Use your Google Search tool to:
            1. Identify the primary MLB team mentioned in this stat.
            2. Find their next scheduled MLB game (opponent, date/time in EST).
            3. Retrieve the real-time, current records for BOTH teams playing in that next game.
            4. Retrieve the current sports betting Moneyline and Runline odds for BOTH teams for that game.

            Return EXACTLY a pure JSON object. No markdown block, no extra explanation text.
            Required fields:
            - "league": "MLB" (hardcode as MLB)
            - "time": Next game time (e.g. "Today, 6:10 PM EST" or "Tuesday, 7:05 PM EST")
            - "awayTeam": {
                "name": Team name only (e.g. "Rockies"),
                "abbr": Standard 3-letter lowercase abbreviation mapping to ESPN scoreboard logos (e.g. "col" for Rockies, "lad" for Dodgers, "phi" for Phillies, "mil" for Brewers, "bos" for Red Sox),
                "record": Real-time record (e.g. "15-28"),
                "ml": Moneyline odds (e.g. "+180"),
                "rl": Runline odds (e.g. "+1.5 (-115)")
              }
            - "homeTeam": {
                "name": Team name only (e.g. "Dodgers"),
                "abbr": Standard 3-letter lowercase abbreviation (e.g. "lad"),
                "record": Real-time record (e.g. "29-17"),
                "ml": Moneyline odds (e.g. "-220"),
                "rl": Runline odds (e.g. "-1.5 (-105)")
              }

            If no game or odds can be found, return empty strings for those specific fields.
        `;

        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.1,
            }
        });

        const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        let outputText = rawText;
        const jsonMatch = outputText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            outputText = jsonMatch[0];
        }

        const data = JSON.parse(outputText);
        return NextResponse.json({ success: true, matchup: data });
    } catch (error: any) {
        console.error("Matchup search failed:", error);
        return NextResponse.json({ error: error.message || "Failed to search matchup" }, { status: 500 });
    }
}
