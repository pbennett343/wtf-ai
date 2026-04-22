import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Reference dataset: NFL team colors (from WTF Sports master sheet)
const TEAM_COLORS: Record<string, { primary: string; primaryHex: string; secondary: string; secondaryHex: string; tertiary: string; tertiaryHex: string }> = {
    "Arizona Cardinals": { primary: "Cardinal Red", primaryHex: "#97233F", secondary: "Black", secondaryHex: "#000000", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Atlanta Falcons": { primary: "Red", primaryHex: "#A71930", secondary: "Black", secondaryHex: "#000000", tertiary: "Silver", tertiaryHex: "#A5ACAF" },
    "Baltimore Ravens": { primary: "Purple", primaryHex: "#241773", secondary: "Black", secondaryHex: "#000000", tertiary: "Metallic Gold", tertiaryHex: "#9E7C0C" },
    "Buffalo Bills": { primary: "Royal Blue", primaryHex: "#00338D", secondary: "Red", secondaryHex: "#C60C30", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Carolina Panthers": { primary: "Process Blue", primaryHex: "#0085CA", secondary: "Black", secondaryHex: "#000000", tertiary: "Silver", tertiaryHex: "#BFC0BF" },
    "Chicago Bears": { primary: "Navy Blue", primaryHex: "#0B162A", secondary: "Orange", secondaryHex: "#C83803", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Cincinnati Bengals": { primary: "Orange", primaryHex: "#FB4F14", secondary: "Black", secondaryHex: "#000000", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Cleveland Browns": { primary: "Brown", primaryHex: "#311D00", secondary: "Orange", secondaryHex: "#FF3C00", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Dallas Cowboys": { primary: "Navy Blue", primaryHex: "#003594", secondary: "Silver", secondaryHex: "#869397", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Denver Broncos": { primary: "Orange", primaryHex: "#FB4F14", secondary: "Navy Blue", secondaryHex: "#002244", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Detroit Lions": { primary: "Honolulu Blue", primaryHex: "#0076B6", secondary: "Silver", secondaryHex: "#B0B7BC", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Green Bay Packers": { primary: "Dark Green", primaryHex: "#203731", secondary: "Gold", secondaryHex: "#FFB612", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Houston Texans": { primary: "Deep Steel Blue", primaryHex: "#03202F", secondary: "Battle Red", secondaryHex: "#A71930", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Indianapolis Colts": { primary: "Speed Blue", primaryHex: "#002C5F", secondary: "White", secondaryHex: "#FFFFFF", tertiary: "Black", tertiaryHex: "#000000" },
    "Jacksonville Jaguars": { primary: "Teal", primaryHex: "#006778", secondary: "Black", secondaryHex: "#000000", tertiary: "Gold", tertiaryHex: "#D7A22A" },
    "Kansas City Chiefs": { primary: "Red", primaryHex: "#E31837", secondary: "Gold", secondaryHex: "#FFB612", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Las Vegas Raiders": { primary: "Silver", primaryHex: "#A5ACAF", secondary: "Black", secondaryHex: "#000000", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Los Angeles Chargers": { primary: "Powder Blue", primaryHex: "#0080C6", secondary: "Sunshine Gold", secondaryHex: "#FFC20E", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Los Angeles Rams": { primary: "Rams Royal", primaryHex: "#003594", secondary: "Sol Yellow", secondaryHex: "#FFA300", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Miami Dolphins": { primary: "Aqua", primaryHex: "#008E97", secondary: "Orange", secondaryHex: "#F26A24", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Minnesota Vikings": { primary: "Purple", primaryHex: "#4F2683", secondary: "Gold", secondaryHex: "#FFC62F", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "New England Patriots": { primary: "Nautical Blue", primaryHex: "#002244", secondary: "Red", secondaryHex: "#C60C30", tertiary: "Silver", tertiaryHex: "#B0B7BC" },
    "New Orleans Saints": { primary: "Old Gold", primaryHex: "#D3BC8D", secondary: "Black", secondaryHex: "#000000", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "New York Giants": { primary: "Dark Blue", primaryHex: "#0B2265", secondary: "Red", secondaryHex: "#A71930", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "New York Jets": { primary: "Gotham Green", primaryHex: "#125740", secondary: "White", secondaryHex: "#FFFFFF", tertiary: "Black", tertiaryHex: "#000000" },
    "Philadelphia Eagles": { primary: "Midnight Green", primaryHex: "#004C54", secondary: "Silver", secondaryHex: "#A5ACAF", tertiary: "Black", tertiaryHex: "#000000" },
    "Pittsburgh Steelers": { primary: "Black", primaryHex: "#000000", secondary: "Gold", secondaryHex: "#FFB612", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "San Francisco 49ers": { primary: "Red", primaryHex: "#AA0000", secondary: "Gold", secondaryHex: "#B3995D", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Seattle Seahawks": { primary: "College Navy", primaryHex: "#002244", secondary: "Action Green", secondaryHex: "#69BE28", tertiary: "Wolf Grey", tertiaryHex: "#A5ACAF" },
    "Tampa Bay Buccaneers": { primary: "Red", primaryHex: "#D50A0A", secondary: "Pewter", secondaryHex: "#34302B", tertiary: "White", tertiaryHex: "#FFFFFF" },
    "Tennessee Titans": { primary: "Navy", primaryHex: "#0C2340", secondary: "Titans Blue", secondaryHex: "#4B92DB", tertiary: "Silver", tertiaryHex: "#8A8D8F" },
    "Washington Commanders": { primary: "Burgundy", primaryHex: "#5A1414", secondary: "Gold", secondaryHex: "#FFB612", tertiary: "White", tertiaryHex: "#FFFFFF" },
};

// Build a compact string of team colors for the AI prompt
function getTeamColorReference(): string {
    return Object.entries(TEAM_COLORS)
        .map(([team, c]) => `${team}: ${c.primary} (${c.primaryHex}), ${c.secondary} (${c.secondaryHex})`)
        .join("\n");
}

export async function POST(req: Request) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    console.log("POST /api/ai/generate - Key Length:", key.length);

    let prompt = "";
    let style = "cartoon";
    let context = "";
    let referenceImage = "";

    try {
        const body = await req.json();
        prompt = body.prompt || "";
        style = body.style || "cartoon";
        context = body.context || "";
        referenceImage = body.referenceImage || "";

        if (!prompt && !referenceImage) return NextResponse.json({ error: "No prompt or reference image provided" }, { status: 400 });

        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const statText = (context || prompt).substring(0, 600);

        const analysisPrompt = `You are an expert image prompt engineer specializing in 3D clay figurine art. I need you to create a precise image generation prompt that produces CLAY FIGURINE style sports figures.

${referenceImage ? "A REFERENCE IMAGE has been provided. Analyze it to identify the athlete, their team, jersey style, and the action/pose shown. Use these visual details." : ""}

STAT TEXT:
"""
${statText}
"""

TEAM COLOR REFERENCE (use EXACT hex colors):
${getTeamColorReference()}

INSTRUCTIONS — follow every step:

STEP 1: Identify the athlete(s) and their team from the stat${referenceImage ? " and/or reference image" : ""}.
STEP 2: Look up the team's EXACT colors from the reference table above. Use the hex codes.
STEP 3: Determine the sport-appropriate uniform (football jersey + helmet, baseball jersey + cap, basketball jersey, etc.)
STEP 4: What action or pose matches the stat? (throwing, catching, dunking, batting, etc.)

NOW BUILD THE PROMPT using this EXACT structure — the output MUST produce a 3D CLAY FIGURINE:

"Clean white/light gray solid background. 3D clay figurine of a [SPORT] player in [ACTION/POSE]. The figure is wearing a [team primary color name] ([PRIMARY HEX]) jersey with [team secondary color name] ([SECONDARY HEX]) accents and [appropriate headwear in team primary color]. The figurine has SMOOTH FEATURELESS FACE with NO eyes, NO mouth, NO nose — completely blank smooth oval head like a mannequin. Soft matte clay/plastic material with subtle shadows. The figure has realistic human proportions (NOT chibi, NOT cartoonish). Smooth rounded limbs. Warm soft studio lighting from above. Clean minimal white background. Professional 3D render, high quality, sharp details."

CRITICAL RULES:
- The figure MUST have a completely BLANK FEATURELESS FACE — no eyes, no mouth, no nose, just smooth clay
- Use REALISTIC proportions — NOT chibi, NOT oversized head
- Material must be SMOOTH MATTE CLAY or PLASTIC (like the reference image style)
- Include the EXACT hex color codes from the team reference table
- Background must be CLEAN WHITE or LIGHT GRAY — no stadium, no scenery
- Mention team colors BY NAME and HEX at least twice
- Keep under 150 words

Return ONLY the prompt. No quotes, no explanation, no preamble.`;

        // Build content parts — include reference image if provided
        const contentParts: any[] = [analysisPrompt];
        if (referenceImage) {
            const mimeMatch = referenceImage.match(/^data:(image\/\w+);base64,/);
            const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
            contentParts.push({
                inlineData: {
                    data: referenceImage.split(",")[1],
                    mimeType,
                },
            });
        }

        const result = await model.generateContent(contentParts);
        const generatedPrompt = result.response.text().trim().substring(0, 600);

        console.log("Gemini enriched prompt:", generatedPrompt);

        if (!generatedPrompt) throw new Error("Gemini returned empty response");

        return NextResponse.json({
            success: true,
            source: "gemini",
            generatedPrompt
        });
    } catch (error: any) {
        console.error("Generate Error:", error?.message || error);

        // Fallback: generic clay figurine prompt
        const fallback = `Clean white background. 3D clay figurine of a sports player in an athletic pose. Smooth featureless face with NO eyes, NO mouth, NO nose. Soft matte clay material with subtle shadows. Realistic human proportions. Warm studio lighting. Subject: ${prompt.substring(0, 200)}. Minimal white background, professional 3D render.`;

        return NextResponse.json({ success: true, source: "fallback", generatedPrompt: fallback });
    }
}
