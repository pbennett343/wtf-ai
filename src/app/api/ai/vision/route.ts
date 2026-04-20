import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { image } = await req.json(); // base64 image data
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Extract all meaningful sports statistics, team names, and context from this image. Format it as a clean, punchy stat. If it's a tweet or instagram post, extract the core message.";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: image.split(",")[1],
                    mimeType: "image/png",
                },
            },
        ]);

        const text = result.response.text();
        return NextResponse.json({ text });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to extract text" }, { status: 500 });
    }
}
