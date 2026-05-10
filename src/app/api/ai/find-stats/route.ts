import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TODAY = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York"
});

const PROMPT_WTF_STATS = `### ROLE: LEAD RESEARCHER FOR "WTF STATS" ###
Today's date is ${TODAY}. Your mission is to find the best WTF Stats from the last 24 hours.

### MANDATORY COMPLIANCE RULES ###
1. STYLE REFERENCE: A "WTF Stat" is NOT a hot streak or a highlight. It is a historical anomaly.
   It MUST include language like "First time since 19XX," "Only player in history," or "Highest/Lowest in [X] years."
   If it does NOT have that historical context, it is REJECTED.
2. DATA ONLY: Must be quantitative historical anomalies. No "Player X hit a HR" news items.
3. NO BETTING TERMS: Phrases like "SU", "ATS", "Over/Under", or "Covered" are BANNED.
4. SPORT PRIORITY: NFL, MLB, NBA, NHL only. No Soccer, Lacrosse, or WNBA unless once-in-a-century.
5. RECENCY: All stats MUST relate to games or events from the last 24 hours (since ${TODAY}).
6. SOURCES: Scan @ESPNinsights, @jaycuda, @mlbstats, @MLB, @NBA, @NFL, @OPTAStats, @slangonsports on X.

### OUTPUT ###
Return exactly 8 stats as a pure JSON array. No markdown, no extra text. Each object:
- "section": "WTF Stat"
- "date": The exact date of the game/event (e.g. "${TODAY}", "Last Night")
- "source": Source name only — never a full URL (e.g. "@OptaSTATS", "ESPN")
- "text": The full stat string. Do NOT include the source inside the text.`;

const PROMPT_WTF_BETS = `### ROLE: ODDSSHARK TREND RESEARCHER FOR "WTF BETS" ###
Today's date is ${TODAY}. You MUST navigate to oddsshark.com/mlb/trends and find the most lopsided betting trends for MLB games scheduled TODAY (${TODAY}) or tomorrow ONLY.

### MANDATORY COMPLIANCE RULES ###
1. ONLY MLB: We are in MLB season. Do NOT include NBA (season is over), NFL (off-season), or any other sport.
2. ACTIVE GAMES ONLY: Every single trend MUST be for a team that has a game scheduled TODAY or TOMORROW. Verify the team is playing.
3. EXACT DATES: Use the exact game date (e.g. "May 10, 2026"). NEVER say "Tonight" or "Today".
4. HIGHEST RATIOS: Find the most extreme/lopsided trends. Prefer 15+ game samples (e.g. 18-4, 21-3).
5. NO BRACKETS: Do NOT prefix stats with [MLB] or any sport tag.
6. CATEGORY MIX (8 slots):
   - 2x OVER trends (highest ratios)
   - 2x UNDER trends (highest ratios)  
   - 2x ATS/Runline trends (highest ratios)
   - 2x ANY remaining extreme trends (NO "SU" unless 15-0+)
7. VERIFY ON ODDSSHARK: Every trend must come from oddsshark.com/mlb/trends. Cross-check that the team is playing.

### OUTPUT ###
Return exactly 8 stats as a pure JSON array. No markdown, no extra text. Each object:
- "section": "WTF Bets"
- "date": Exact game date (e.g. "${TODAY}")
- "source": "OddsShark"
- "text": The full trend string. No source or sport tags in the text.`;

export async function POST(req: Request) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!key) return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

    let brand = "wtf-x-logo.jpg";
    try {
        const body = await req.json();
        if (body.brand) brand = body.brand;
    } catch (_) { /* default brand */ }

    const isWTFBets = brand === "bets-x-logo.jpg";
    const prompt = isWTFBets ? PROMPT_WTF_BETS : PROMPT_WTF_STATS;

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
            const stats = JSON.parse(outputText);
            return NextResponse.json({ success: true, stats, brand });
        } catch (parseError) {
            console.error("JSON Parse Error. Raw text was:", rawText);
            throw new Error("Failed to parse AI response as JSON.");
        }

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Failed to find stats";
        console.error("Find Stats Error:", msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
