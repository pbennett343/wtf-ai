import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    console.log("POST /api/ai/vision - Key Length:", key.length);

    try {
        const { image } = await req.json(); // base64 image data
        if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = "Extract all meaningful sports statistics, team names, and context from this image. Format it as a clean, punchy stat. If it's a tweet or instagram post, extract the core message.";

        // Dynamically detect MIME type from data URL (e.g. "data:image/jpeg;base64,...")
        const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/png";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: image.split(",")[1],
                    mimeType,
                },
            },
        ]);

        const text = result.response.text();
        console.log("Vision Extraction Success");
        return NextResponse.json({ text });
    } catch (error: any) {
        console.error("Vision Error:", error);
        return NextResponse.json({ error: "Failed to extract text", details: error.message }, { status: 500 });
    }
}

