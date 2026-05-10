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
5. RECENCY: All stats MUST relate to games or events from the last 24 hours (since ${TODAY}). Do not use old stats.
6. SOURCES: Do NOT search X/Twitter. Use Google Search to find historical anomalies and recap articles from ESPN, CBS Sports, MLB.com, NBA.com, Elias Sports Bureau, or Opta Analyst for games played yesterday or today.

### OUTPUT ###
Return exactly 8 stats as a pure JSON array. No markdown, no extra text. Each object:
- "section": "WTF Stat"
- "date": The exact date of the game/event (e.g. "${TODAY}", "Last Night")
- "source": Source name only — never a full URL (e.g. "@OptaSTATS", "ESPN")
- "text": The full stat string. Do NOT include the source inside the text.`;

const PROMPT_WTF_BETS = `### ROLE: LEAD SPORTS BETTING ANALYST FOR "WTF BETS" ###
Today's date is ${TODAY}. Your mission is to find real MLB betting trends for games scheduled TODAY or TOMORROW ONLY.

### MANDATORY COMPLIANCE RULES ###
1. ZERO HALLUCINATION POLICY: You MUST extract literal, real betting trends. Do NOT invent or fabricate stats to make them look more impressive.
2. EXTREME TRENDS ONLY: A "WTF Bet" must be a jaw-dropping anomaly. Hunt for massive, lopsided streaks (e.g., 9-1, 15-3, 12-0). Reject weak/random trends like 4-2, 6-4, or 5-3. The trend MUST have at least a 75% win rate over a minimum of 8 games. ANTI-TIMEOUT RULE: If you cannot find stats that meet this high bar after 2 searches, you MUST stop searching and simply return the best stats you found, even if they are only 4-2 or 6-4. Do NOT endlessly search.
3. ODDSSHARK ONLY: You MUST ONLY pull stats from OddsShark. Do not use Covers, Action Network, or any other site. If you cannot scrape OddsShark directly, use Google Search to find OddsShark articles or tweets containing today's trends.
4. ONLY MLB: Do NOT include NBA, NFL, NHL, or any other sport.
5. ACTIVE GAMES ONLY: REJECT any team that is not playing in the next 48 hours.
6. EXACT DATES ONLY: The date field MUST be the exact date of the game (e.g. "${TODAY}"). NEVER say "Today" or "Tonight".
7. MANDATORY CATEGORY QUOTA (8 slots, in this order):
   1. OVER Trend (Highest ratio found)
   2. OVER Trend (Second highest)
   3. UNDER Trend (Highest ratio)
   4. UNDER Trend (Second highest)
   5. Runline Trend (Highest ratio)
   6. Runline Trend (Second highest)
   7. ANY Trend (Highest remaining, NO "SU")
   8. ANY Trend (Second highest remaining, NO "SU")
7. NO SPORT TAG: Do NOT start the stat with [MLB].
8. NO SU RULE: Do NOT include Straight Up (SU) streaks unless you literally cannot find enough Over/Under/Runline trends to fill the 8 slots.

### OUTPUT ###
Return exactly 8 stats as a pure JSON array. No markdown, no extra text. Each object:
- "section": "WTF Bets"
- "date": Exact game date (e.g. "${TODAY}")
- "source": The source website (e.g. "OddsShark", "Action Network")
- "text": The full trend string. Do NOT include the source or sport tag in the text.`;

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
            return NextResponse.json({ error: "Parse Error. AI said: " + rawText.substring(0, 200) + "..." }, { status: 500 });
        }

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Failed to find stats";
        console.error("Find Stats Error:", msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
