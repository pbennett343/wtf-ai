import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!key) return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

    try {
        const body = await req.json();
        const { statText, chartImage, userPrompt, mode } = body;

        if (!statText && !chartImage && !userPrompt) {
            return NextResponse.json({ error: "No input provided" }, { status: 400 });
        }

        const TODAY = new Date().toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York"
        });

        const ai = new GoogleGenAI({ apiKey: key });

        // Mode: "extract" = read an uploaded chart image and reproduce the data
        // Mode: "generate" = AI generates chart data from stat text + optional prompt
        const isExtract = mode === "extract" && chartImage;

        const chartTypeDefinitions = `
### AVAILABLE CHART TYPES ###
Pick the BEST chart type for the data. Return EXACTLY one "chartType" value:

1. "player-stats-row" — Single player stat line (e.g. C/ATT, YDS, TD, INT, CAR, YDS, AVG, TD)
   Data: { title?: string, playerNumber?: string, playerName: string, columns: string[], values: string[] }

2. "game-log" — Multi-row game log with dates, opponents, results, stats
   Data: { title: string, subtitle?: string, headerColumns: string[], rows: [{ cells: string[], isHighlight?: boolean }], totalRow?: string[] }

3. "box-score" — Two-team stat comparison with side-by-side values and optional bars
   Data: { awayAbbr: string, homeAbbr: string, league: string, rows: [{ label: string, awayValue: string, homeValue: string, awayBar?: number, homeBar?: number, awayHighlight?: boolean, homeHighlight?: boolean }] }

4. "series-summary" — Stacked game results for a series (e.g. NLCS)
   Data: { title?: string, games: [{ label: string, awayAbbr: string, homeAbbr: string, awayName: string, homeName: string, awayScore: number, homeScore: number, winnerSide: "away"|"home" }] }

5. "season-stats-box" — Big stat numbers in a colored header strip (e.g. 2026 SEASON STATS: REC 38, YDS 932, TD 12, AVG 24.5)
   Data: { title: string, headerColor?: string, stats: [{ label: string, value: string, rank?: string }] }

6. "ranking-table" — Two-column ranking with optional team logos (e.g. teams with fewest TDs)
   Data: { title: string, columns: [string, string], rows: [{ logoAbbr?: string, league?: string, name: string, value: string, isHighlight?: boolean }] }

7. "score-grid" — Multi-game score grid laid out in a 2×N grid
   Data: { title?: string, games: [{ label: string, awayAbbr: string, homeAbbr: string, awayScore: string, homeScore: string, extra?: string }] }

8. "head-to-head" — Two-team comparison table with team headers and stat rows
   Data: { leftHeader: string, rightHeader: string, leftAbbr: string, rightAbbr: string, league: string, subLeft?: string, subRight?: string, rows: [{ label: string, leftValue: string, rightValue: string, highlight?: boolean }] }

9. "series-badge" — Simple big series result badge (e.g. MIL 4-0 LAD) with logos
   Data: { leftAbbr: string, rightAbbr: string, league: string, leftScore: string, rightScore: string, leftColor?: string, rightColor?: string }

10. "context-table" — Generic ranked context table (like the original stat context chart)
    Data: { title: string, subtitle?: string, columns: string[], rows: [{ rank?: string, player: string, teamAbbr?: string, team?: string, date?: string, value: string, isHighlight?: boolean }], highlight?: string, footnote?: string, league?: string }
`;

        let prompt: string;
        const contentParts: any[] = [];

        if (isExtract) {
            // Extract mode: read the uploaded chart image
            prompt = `Today is ${TODAY}.
You are an elite sports data extraction AI. The user has uploaded an image of a sports chart, table, box score, or stat graphic. Your job is to:

1. READ the image carefully and extract ALL visible data points, numbers, team names, player names, labels, headers, and structure.
2. Determine which chart type below BEST represents this data.
3. Return the structured data in JSON format.

${chartTypeDefinitions}

### OUTPUT FORMAT ###
Return EXACTLY a pure JSON object (no markdown, no backticks):
{
    "chartType": "<one of the types above>",
    "data": { <structured data matching the chosen type's schema> }
}

### RULES ###
- Extract data EXACTLY as shown in the image. Do not infer or make up numbers.
- "league" abbreviations for logos: MLB, NFL, NBA, NCAAF, NCAAB.
- Team abbreviations must be lowercase ESPN-standard (e.g. "lad", "mil", "buf", "lar", "nyy").
- If you cannot identify a value, use "—".
${userPrompt ? `\nUser's additional instructions: "${userPrompt}"` : ""}`;

            contentParts.push({ text: prompt });

            // Add the image
            const mimeMatch = chartImage.match(/^data:(image\/\w+);base64,/);
            const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
            contentParts.push({
                inlineData: {
                    mimeType,
                    data: chartImage.split(",")[1],
                },
            });
        } else {
            // Generate mode: AI creates chart from stat text
            prompt = `Today is ${TODAY}.
You are an elite sports data researcher. Read the following stat and determine what type of chart or data visualization would BEST complement this stat when shown as an overlay on a sports graphic.

STAT: "${statText}"
${userPrompt ? `USER REQUEST: "${userPrompt}"` : ""}

### YOUR TASK ###
1. COMPREHEND the stat. Identify the core claim.
2. RESEARCH using Google Search to find REAL, VERIFIED, ACCURATE data.
3. Determine the BEST chart type from the list below.
4. Return structured data for that chart type.

${chartTypeDefinitions}

### OUTPUT FORMAT ###
Return EXACTLY a pure JSON object (no markdown, no backticks):
{
    "chartType": "<one of the types above>",
    "data": { <structured data matching the chosen type's schema> }
}

### CRITICAL RULES ###
- All data MUST be factually accurate and verified via search.
- Team abbreviations MUST be lowercase ESPN-standard (e.g. "nyy", "lad", "buf", "lar").
- "league" for logo URLs: "mlb", "nfl", "nba", "college-football" etc.
- Include 3-10 rows maximum. Quality over quantity.
- Pick the chart type that makes the stat MOST visually impactful.
- If the stat mentions a head-to-head comparison, use "head-to-head" or "box-score".
- If the stat mentions a series, use "series-summary" or "series-badge".
- If the stat mentions a player's stats, use "player-stats-row" or "season-stats-box".
- If the stat mentions a ranking or list, use "ranking-table" or "context-table".`;

            contentParts.push({ text: prompt });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contentParts,
            config: {
                tools: isExtract ? [] : [{ googleSearch: {} }],
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
        return NextResponse.json({ success: true, chart: data });
    } catch (error: any) {
        console.error("Chart builder failed:", error);
        return NextResponse.json({ error: error.message || "Failed to build chart" }, { status: 500 });
    }
}
