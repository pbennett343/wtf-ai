import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;


export async function POST(req: Request) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!key) return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

    try {
        const body = await req.json();
        const { statsList, images, additionalNotes } = body;

        if (!statsList && (!images || images.length === 0)) {
            return NextResponse.json({ error: "No stats or images provided" }, { status: 400 });
        }

        const ai = new GoogleGenAI({ apiKey: key });

        const STORY_STRUCTURE = `
## 2026 TikTok Short-Form Story Structure

You MUST follow this EXACT structure for the script. Every section must be present.

1. **The 3-Layer Hook Stack (0:00–0:03)**
   - Visual Trigger: Immediate pattern interrupt or striking imagery in frame one (no logos, dead air, or fade-ins).
   - Verbal Trigger: Spoken in sentence one, packed with natural search keywords to optimize for TikTok SEO.
   - Text Overlay: Bold, high-contrast headline inside the screen safe zone that poses a question or presents a counterintuitive claim.

2. **The Retention Bridge (0:03–0:08)**
   - Directly addresses the obvious surface answer, then introduces a curiosity gap ("The short answer is X, but the real reason is much deeper...").
   - Signals to the viewer that staying past the 3-second mark guarantees an exclusive payoff.

3. **Context & Foundation (0:08–0:25)**
   - Delivers rapid-fire backstory, origins, or baseline examples.
   - Visual pacing shifts every 2 to 3 seconds with B-roll, on-screen callouts, or zooms to prevent watch-time decay.

4. **The Midpoint Re-Hook (0:25–0:35)**
   - Re-engages the viewer at the classic 30-second drop-off window by introducing a paradox, a surprising stat, or a second question.
   - Shatters common assumptions ("Here's the twist: it's not even required...").

5. **The Conflict & Escalation (0:35–1:05)**
   - Builds the tension: outlines the strict rules, obstacles, or contrasting circumstances that make the situation unique.
   - Establishes the real stakes that explain why the initial question mattered in the first place.

6. **The Climax & Core Payoff (1:05–1:25)**
   - Delivers the core revelation and payoff promised in the hook.
   - Connects all preceding context into a single insight, framework, or takeaway.

7. **The Comment / Loop Trigger (Final 5–10s)**
   - Replaces traditional sign-offs or calls to follow with an open-ended debate question that provokes comments and shares.
   - Phrases the final line to transition naturally back into the opening frame for seamless replay looping.
`;

        const systemPrompt = `You are an elite short-form sports video scriptwriter for WTF Stats, a viral sports media brand. 

${STORY_STRUCTURE}

## YOUR TASK
Given a collection of stats and/or images of stats, write a complete short-form video script (60-90 seconds) that:
1. Finds the most compelling narrative angle from the provided stats
2. Follows the EXACT 7-section structure above
3. Writes a detailed AI video generation prompt for each section's visual — rich enough to copy-paste directly into Sora, Runway, Pika, or Kling
4. Weaves the stats naturally into the narrative - don't just list them
5. Creates a script that sounds conversational and authentic, NOT robotic or corporate
6. Uses the stats to tell a STORY, not just present data

## OUTPUT FORMAT
Return a valid JSON object with this exact structure:
{
  "title": "Short catchy title for the video",
  "topic": "Brief 1-line description of the angle",
  "estimatedDuration": "e.g. 75 seconds",
  "sections": [
    {
      "id": 1,
      "name": "The 3-Layer Hook Stack",
      "timestamp": "0:00–0:03",
      "script": "Exact words spoken by narrator",
      "textOverlay": "Text shown on screen",
      "visualSuggestion": "A detailed, copy-paste-ready AI video generation prompt for this section. Write it like a professional prompt engineer. Include: the exact subject and action, camera angle and movement (e.g. slow-motion close-up, aerial pull-back, whip pan), lighting and atmosphere (e.g. golden-hour stadium glow, dramatic rim lighting, foggy arena), specific visual details (crowd reactions, jersey colors, environmental elements), cinematic style references (e.g. hyperrealistic, broadcast television aesthetic, ESPN Films documentary style). Do NOT include aspect ratio, duration, or frame count. Make it vivid, specific, and immediately usable."
    },
    {
      "id": 2,
      "name": "The Retention Bridge",
      "timestamp": "0:03–0:08",
      "script": "...",
      "textOverlay": "...",
      "visualSuggestion": "..."
    },
    {
      "id": 3,
      "name": "Context & Foundation",
      "timestamp": "0:08–0:25",
      "script": "...",
      "textOverlay": "",
      "visualSuggestion": "..."
    },
    {
      "id": 4,
      "name": "The Midpoint Re-Hook",
      "timestamp": "0:25–0:35",
      "script": "...",
      "textOverlay": "...",
      "visualSuggestion": "..."
    },
    {
      "id": 5,
      "name": "The Conflict & Escalation",
      "timestamp": "0:35–1:05",
      "script": "...",
      "textOverlay": "",
      "visualSuggestion": "..."
    },
    {
      "id": 6,
      "name": "The Climax & Core Payoff",
      "timestamp": "1:05–1:25",
      "script": "...",
      "textOverlay": "...",
      "visualSuggestion": "..."
    },
    {
      "id": 7,
      "name": "The Comment / Loop Trigger",
      "timestamp": "Final 5–10s",
      "script": "...",
      "textOverlay": "",
      "visualSuggestion": "..."
    }
  ],
  "fullScript": "The complete script as one continuous block of text with no section markers, ready to read aloud or copy"
}

Return ONLY the JSON object — no markdown fences, no explanation.`;

        const parts: any[] = [];

        // Add text stats
        let userMessage = "";
        if (statsList) {
            userMessage += `## STATS PROVIDED:\n${statsList}\n\n`;
        }
        if (additionalNotes) {
            userMessage += `## ADDITIONAL NOTES FROM USER:\n${additionalNotes}\n\n`;
        }
        userMessage += "Write the script now following the exact format.";

        parts.push({ text: userMessage });

        // Add images (base64)
        if (images && images.length > 0) {
            for (const img of images) {
                if (img.startsWith('data:')) {
                    const match = img.match(/^data:(.*?);base64,(.*)$/);
                    if (match) {
                        parts.push({
                            inlineData: {
                                mimeType: match[1],
                                data: match[2],
                            }
                        });
                    }
                }
            }
        }

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts }],
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.9,
            },
        });

        const raw = result.text || "";
        const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

        try {
            const parsed = JSON.parse(cleaned);
            return NextResponse.json({ script: parsed });
        } catch {
            return NextResponse.json({ script: null, rawText: raw });
        }

    } catch (err: any) {
        console.error("Script writer error:", err);
        return NextResponse.json({ error: err.message || "Script generation failed" }, { status: 500 });
    }
}
