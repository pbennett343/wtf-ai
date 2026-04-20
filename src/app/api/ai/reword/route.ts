import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { text } = await req.json();
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
            Rewrite the following sports statistic in the signature 'WTF Stats' style.
            
            RULES:
            - Be punchy, aggressive, and direct.
            - Use contrasting numbers (e.g., "XX players have done Y. Name has done Z.")
            - Include the percentage blocked/missed/success if applicable.
            - Format it as a clean text block that fits on a graphic.
            
            TEXT TO REWORD:
            "${text}"
        `;

        const result = await model.generateContent(prompt);
        const rewordedText = result.response.text();
        return NextResponse.json({ text: rewordedText });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to reword text" }, { status: 500 });
    }
}
