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

        const clayInstruction = referenceImage
            ? `Transform this image into a 3D clay figurine style. Keep the EXACT same pose, composition, player number, jersey colors, and body proportions from the original image. Only change the material/texture: make everything look like smooth matte clay or soft plastic. The face should remain recognizable but simplified. Place the characters in a vibrant stadium, arena, or field backdrop relevant to their sport. Do NOT change the pose or add new elements. MUST BE A PERFECT 1:1 SQUARE ASPECT RATIO.${prompt ? ` Additional context: ${prompt}` : ""}`
            : `Create a 3D clay figurine style sports illustration based on this context: "${prompt}". IMPORTANT RESTRICTIONS: Do NOT generate or include any text, words, or numbers floating in the image. Do NOT include scoreboards, UI elements, or infographics. ONLY generate the clay figurine characters interacting in a vibrant stadium, arena, or field backdrop relevant to their sport (NO blank/plain backgrounds). Smooth matte clay material, soft studio lighting. MUST BE A PERFECT 1:1 SQUARE ASPECT RATIO.`;

        // Build content parts array
        const contentParts: any[] = [{ text: clayInstruction }];

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
