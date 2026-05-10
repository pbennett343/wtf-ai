import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Web search might take time

export async function POST() {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!key) return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

    try {
        const ai = new GoogleGenAI({ apiKey: key });

        const prompt = `### ROLE: LEAD RESEARCHER FOR "WTF STATS" ###
Your mission is to generate a two-part data report for the "WTF Stats" app. These two sections MUST be sourced using entirely different methodologies and have ZERO overlapping data types.

### MANDATORY COMPLIANCE RULES — DO NOT IGNORE ###
1. STYLE REFERENCE: Analyze @wtfstats on X. A "WTF Stat" is NOT a "hot streak" or a highlight. It is a historical anomaly. If the stat doesn't include phrases like "First time since 19XX," "Only player in history," or "Highest/Lowest in [X] years," it is NOT a WTF stat.
2. DATA ONLY FILTER: Section 1 must contain quantitative historical anomalies. DO NOT include "Player X hit a HR" or "Team Y won 10 in a row." These are news, not WTF stats.
3. SOURCE SEPARATION: Section 1 = Web Search & X Links ONLY. Section 2 = OddsShark ONLY.
4. NO BETTING TERMS IN SECTION 1: Phrases like "SU", "ATS", "Over/Under", or "Covered" are BANNED from Section 1.
5. SPORT PRIORITY: Focus ONLY on NFL, MLB, NBA, and NHL. No Lacrosse, Soccer, or WNBA unless the stat is a once-in-a-century event.

---

### SECTION 1: THE DAILY WTF STATS (WEB & X SCOUTING) ###
METHODOLOGY: Use your Google Search tool to find quantitative historical anomalies from the last 24 hours. To find viral stats from X, use search queries like "site:twitter.com/optastats" or "site:twitter.com/espnstatsinfo" along with phrases like "first time" or "since".
- COMPLETED EVENTS ONLY: You MUST ONLY pull stats for games and events that have ALREADY FINISHED. Absolutely NO "aiming to," "on pace for," "if they win tonight," or future predictions. The stat must be locked in history.
- THE FILTER: Reject any post that is just a "cool video" or news update. (Example: "Bobby Witt Jr. hits an inside-the-park HR" is REJECTED. "Bobby Witt Jr. is the first player in MLB history to have 20/20 stats by May 10th" is ACCEPTED).
- REQUIREMENT: Provide exactly 8 stats. Every entry MUST have a direct source URL (X link or credible sports news URL).

### SECTION 2: THE WTF BETTING TRENDS (STRICT QUOTA & HIGHEST NUMBERS) ###
METHODOLOGY: Navigate directly to Oddsshark.com (e.g., /nba/trends, /nhl/trends, /mlb/trends).
- THE FILTER (HIGHER NUMBERS!): Hunt for the most lopsided mathematical streaks. Look for denominators of 15, 20, or 25 games.
- MANDATORY CATEGORY QUOTA (8 SLOTS TOTAL): You must fill the slots in this exact order to ensure variety:
1. OVER Trend (Highest ratio found)
2. OVER Trend (Second highest)
3. UNDER Trend (Highest ratio found)
4. UNDER Trend (Second highest)
5. ATS/Runline/Puckline Trend (Highest ratio found)
6. ATS/Runline/Puckline Trend (Second highest)
7. ANY Trend (Highest remaining number, NO "SU")
8. ANY Trend (Highest remaining number, NO "SU")
- THE "NO SU" RULE: Do NOT include "SU" (Straight Up) streaks unless the ratio is mind-blowing (e.g., 20-1 or 15-0). If an Over/Under or ATS exists, prioritize it.
- FORMATTING: Start every line with the [SPORT] in brackets.

### OUTPUT REQUIREMENT ###
You MUST return your final response as a pure JSON array containing exactly 16 objects. 
Each object must have the following properties:
- "section": Either "WTF Stat" or "WTF Bets Stat"
- "date": The date of the stat or game (e.g. "May 9, 2026", "Last Night", "Upcoming")
- "source": The source of the stat (e.g. "X/@OptaSTATS", "OddsShark", "ESPN")
- "text": The formatted stat string exactly as requested (Do NOT put the source or link inside the text string itself).

Do NOT wrap the JSON in markdown formatting blocks like \`\`\`json. Return ONLY the raw JSON array string. DO NOT INCLUDE ANY OTHER TEXT.`;

        // gemini-2.5-flash is required for Google Search Grounding
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.2, // Low temp for factual data
            }
        });

        let outputText = response.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        
        // Clean up markdown just in case the model ignored the instruction
        outputText = outputText.replace(/^```json\n/, "").replace(/^```\n/, "").replace(/\n```$/, "");

        const stats = JSON.parse(outputText);

        return NextResponse.json({ success: true, stats });

    } catch (error: any) {
        console.error("Find Stats Error:", error?.message || error);
        return NextResponse.json({ error: error?.message || "Failed to find stats" }, { status: 500 });
    }
}
