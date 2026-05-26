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

        const TODAY = new Date().toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York"
        });

        const prompt = `
            Today is ${TODAY}.
            You are an elite sports data researcher. Read the following stat and determine what context a curious reader would MOST want to see visualized in a chart or table.

            STAT: "${statText}"

            ### YOUR TASK ###
            1. COMPREHEND the stat. Identify the core historical claim (e.g. "5th player to do X", "first since 19XX", "highest in Y years").
            2. RESEARCH using Google Search to find the FULL factual context:
               - If the stat says "Nth player to do X" → find ALL N players who did it, with dates.
               - If the stat says "first since [year]" → find who did it last and when.
               - If the stat says "most/least in X years" → find the historical leaders/ranking.
               - If the stat is a streak → find the longest comparable streaks in history.
            3. Return structured data for a visual table.

            ### OUTPUT FORMAT ###
            Return EXACTLY a pure JSON object (no markdown, no backticks, no extra text):
            {
                "title": "Short chart title (e.g. 'Players with 6+ HR in a Single Game')",
                "subtitle": "Context line (e.g. 'All-Time MLB History')",
                "columns": ["Rank", "Player", "Team", "Date", "Stat Value Label"],
                "rows": [
                    {
                        "rank": "1",
                        "player": "Player Full Name",
                        "teamAbbr": "nyy",
                        "team": "Yankees",
                        "date": "Sep 14, 1999",
                        "value": "6 HR",
                        "isHighlight": false
                    }
                ],
                "highlight": "Name of the player/team that the original stat is about (the subject)",
                "footnote": "Source: Baseball Reference"
            }

            ### RULES ###
            - "teamAbbr" MUST be the standard lowercase ESPN abbreviation for the team's logo (e.g. "nyy", "lad", "bos", "mil", "chw", "chc", "sf", "tb", "kc", "sd", "wsh", "nym", "stl", "col", "ari", "atl", "bal", "cin", "cle", "det", "hou", "laa", "mia", "min", "oak", "phi", "pit", "sea", "tex", "tor").
            - For NFL teams use: "ne", "dal", "gb", "kc", "buf", "sf", "phi", "det", "bal", "hou", "mia", "min", "cin", "pit", "cle", "den", "lac", "lv", "jax", "ten", "ind", "atl", "no", "tb", "car", "chi", "ari", "sea", "lar", "nyg", "nyj", "wsh".
            - For NBA teams use: "bos", "mil", "cle", "ny", "phi", "ind", "chi", "mia", "orl", "atl", "bkn", "tor", "det", "cha", "wsh", "okc", "den", "min", "lac", "dal", "phx", "sac", "lal", "gs", "mem", "no", "hou", "sa", "por", "uth".
            - "isHighlight" should be true for the row that is the SUBJECT of the original stat.
            - Include 3-8 rows maximum. Quality over quantity.
            - The data MUST be factually accurate. If you cannot verify a data point, omit it.
            - If the stat doesn't lend itself to a table (e.g. it's a simple fact), create a comparison/ranking chart instead.
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
        return NextResponse.json({ success: true, context: data });
    } catch (error: any) {
        console.error("Stat context search failed:", error);
        return NextResponse.json({ error: error.message || "Failed to search stat context" }, { status: 500 });
    }
}
