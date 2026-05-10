import { GoogleGenerativeAI } from "@google/generative-ai";
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

        const genAI = new GoogleGenerativeAI(key);

        // Use Gemini's native image generation model for true image-to-image transformation
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-preview-image-generation" });

        // Build the transformation instruction
        const clayInstruction = referenceImage
            ? `Transform this image into a 3D clay figurine style. Keep the EXACT same pose, composition, player number, jersey colors, and body proportions from the original image. Only change the material/texture: make everything look like smooth matte clay or soft plastic. The face should remain recognizable but simplified. Keep the same background style. Do NOT change the pose or add new elements.${prompt ? ` Additional context: ${prompt}` : ""}`
            : `Create a 3D clay figurine style sports illustration: ${prompt}. Smooth matte clay material, soft studio lighting, clean white background.`;

        // Build content parts
        const contentParts: any[] = [{ text: clayInstruction }];

        if (referenceImage) {
            const mimeMatch = referenceImage.match(/^data:(image\/\w+);base64,/);
            const mimeType = (mimeMatch ? mimeMatch[1] : "image/jpeg") as any;
            contentParts.push({
                inlineData: {
                    data: referenceImage.split(",")[1],
                    mimeType,
                },
            });
        }

        const result = await model.generateContent({
            contents: [{ role: "user", parts: contentParts }],
            generationConfig: {
                responseModalities: ["IMAGE", "TEXT"],
            } as any,
        });

        const response = result.response;
        const parts = response.candidates?.[0]?.content?.parts || [];

        // Find the image part in the response
        const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));

        if (imagePart?.inlineData) {
            const { data, mimeType } = imagePart.inlineData;
            const dataUrl = `data:${mimeType};base64,${data}`;
            return NextResponse.json({ success: true, source: "gemini-imagen", imageDataUrl: dataUrl });
        }

        // Fallback: if Gemini image gen not available, use pollinations with enhanced prompt
        const textPart = parts.find((p: any) => p.text)?.text || "";
        console.log("Gemini image gen response (no image part):", textPart);

        // Build a very specific pollinations prompt using the text response
        const fallbackPrompt = referenceImage
            ? `3D clay figurine, same pose as reference, smooth matte clay texture, team jersey, soft studio lighting, white background, high quality render`
            : prompt;

        const encodedPrompt = encodeURIComponent(fallbackPrompt.substring(0, 500));
        const seed = Math.floor(Math.random() * 1000000);
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;

        return NextResponse.json({
            success: true,
            source: "pollinations-fallback",
            generatedPrompt: fallbackPrompt,
            imageUrl: fallbackUrl,
        });

    } catch (error: any) {
        console.error("Generate Error:", error?.message || error);
        return NextResponse.json({ error: error?.message || "Failed to generate image" }, { status: 500 });
    }
}
