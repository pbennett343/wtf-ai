import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!key) return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

    let prompt = "";
    let referenceImage = "";

    try {
        const body = await req.json();
        prompt = body.prompt || "";
        referenceImage = body.referenceImage || "";

        if (!prompt && !referenceImage) {
            return NextResponse.json({ error: "No prompt or reference image provided" }, { status: 400 });
        }

        // New @google/genai SDK — required for Nano Banana image generation
        const ai = new GoogleGenAI({ apiKey: key });

        const isBookIllustrations = body.mode === 'book-illustrations' || body.brand === 'book-illustrations';

        let enrichedContext = prompt;
        if (prompt && !referenceImage) {
            try {
                const searchRes = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: isBookIllustrations
                        ? `Identify the main athlete and the SPECIFIC DRAMATIC ACTION or EVENT described in this text: "${prompt}". Return a short, vivid sentence for an image generator capturing the player AND the dramatic action (e.g. if text mentions Ray Caldwell being struck by lightning, return 'Baseball pitcher Ray Caldwell getting dramatically struck by a bolt of lightning mid-throw on the pitcher mound').`
                        : `Identify the main athlete or team mentioned in this text: "${prompt}". Use Google Search to find their current team and their primary team uniform colors. Return a short, visually descriptive sentence for an image generator (e.g., "Bobby Witt Jr. wearing a Kansas City Royals white and royal blue uniform").`,
                    config: { tools: isBookIllustrations ? [] : [{ googleSearch: {} }] }
                });
                if (searchRes.text) {
                    enrichedContext = searchRes.text;
                }
            } catch (e) {
                console.error("Search enrichment failed:", e);
            }
        }

        const imageInstruction = isBookIllustrations
            ? (referenceImage
                ? `Transform this image into a simplified, minimal black ink sketch illustration for a book. DYNAMICALLY DEPICT the specific action described: "${prompt}". IMPORTANT RESTRICTIONS: Render ONLY clean black ink line art strokes and outlines of the subject and action. NO colors, NO shading, NO gray tones, NO background scenery. Isolated on a plain solid white background. MUST BE A PERFECT 1:1 SQUARE ASPECT RATIO.${prompt ? ` Context: ${prompt}` : ""}`
                : `Create a simplified, minimal black ink line art sketch illustration for a book that DYNAMICALLY DEPICTS the specific event and action described here: "${prompt}". Visual action details: "${enrichedContext}". CRITICAL INSTRUCTIONS: Depict the key action vividly (for example: if the stat mentions being struck by lightning, show a dramatic black ink lightning bolt striking the pitcher on the mound; if it mentions a dunk, show the player dunking). Render ONLY clean black ink outlines and strokes. NO colors, NO shading, NO gray tones, NO text, NO numbers, NO background scenery. Isolated on a plain solid white background. MUST BE A PERFECT 1:1 SQUARE ASPECT RATIO.`)
            : (referenceImage
                ? `Transform this image into a 3D clay figurine style. Keep the EXACT same pose, composition, player number, jersey colors, and body proportions from the original image. Only change the material/texture: make everything look like smooth matte clay or soft plastic. The face should remain recognizable but simplified. Place the characters on the appropriate sports field, zoomed in, with a heavily blurred background of fans in the stands. Nothing else going on in the background. Do NOT change the pose or add new elements. MUST BE A PERFECT 1:1 SQUARE ASPECT RATIO.${prompt ? ` Additional context: ${prompt}` : ""}`
                : `Create a simple 3D clay figurine sports illustration based on this context: "${enrichedContext}". IMPORTANT RESTRICTIONS: Do NOT generate or include any text, words, or numbers floating in the image. Do NOT include scoreboards, UI elements, or infographics. ONLY generate the simple clay figurine character(s) in their accurate team uniform. The background MUST be the appropriate sports field, zoomed in, with a heavily blurred background of fans in the stands. Nothing else going on in the background. Smooth matte clay material, soft studio lighting. MUST BE A PERFECT 1:1 SQUARE ASPECT RATIO.`);

        // Build content parts array
        const contentParts: any[] = [{ text: imageInstruction }];

        if (referenceImage) {
            const mimeMatch = referenceImage.match(/^data:(image\/\w+);base64,/);
            const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
            contentParts.push({
                inlineData: {
                    mimeType,
                    data: referenceImage.split(",")[1],
                },
            });
        }

        // Use gemini-3.1-flash-image-preview (Nano Banana 2) — fastest image gen model
        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-image-preview",
            contents: contentParts,
        });

        const parts = response.candidates?.[0]?.content?.parts || [];

        // Find the image part in the response
        for (const part of parts) {
            if (part.inlineData?.mimeType?.startsWith("image/")) {
                const { data, mimeType } = part.inlineData;
                const dataUrl = `data:${mimeType};base64,${data}`;
                return NextResponse.json({
                    success: true,
                    source: "gemini-3.1-flash-image-preview",
                    imageDataUrl: dataUrl,
                });
            }
        }

        // If no image came back, log and return error
        const textResponse = parts.find((p: any) => p.text)?.text || "No image generated";
        console.log("Gemini returned text instead of image:", textResponse);
        return NextResponse.json({
            error: `Image generation returned no image. Model said: ${textResponse.substring(0, 200)}`,
        }, { status: 500 });

    } catch (error: any) {
        console.error("Generate Error:", error?.message || error);
        return NextResponse.json({ error: error?.message || "Failed to generate image" }, { status: 500 });
    }
}
