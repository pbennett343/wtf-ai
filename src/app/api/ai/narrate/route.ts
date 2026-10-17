import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function buildWavHeader(pcmByteLength: number, sampleRate = 24000, channels = 1, bitsPerSample = 16): Buffer {
    const byteRate = sampleRate * channels * bitsPerSample / 8;
    const blockAlign = channels * bitsPerSample / 8;
    const buf = Buffer.alloc(44);
    buf.write("RIFF", 0);
    buf.writeUInt32LE(36 + pcmByteLength, 4);
    buf.write("WAVE", 8);
    buf.write("fmt ", 12);
    buf.writeUInt32LE(16, 16);
    buf.writeUInt16LE(1, 20);
    buf.writeUInt16LE(channels, 22);
    buf.writeUInt32LE(sampleRate, 24);
    buf.writeUInt32LE(byteRate, 28);
    buf.writeUInt16LE(blockAlign, 32);
    buf.writeUInt16LE(bitsPerSample, 34);
    buf.write("data", 36);
    buf.writeUInt32LE(pcmByteLength, 40);
    return buf;
}

export async function POST(req: Request) {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!key) return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

    try {
        const { fullScript, title } = await req.json();
        if (!fullScript) return NextResponse.json({ error: "No script provided" }, { status: 400 });

        const ai = new GoogleGenAI({ apiKey: key });

        // Minimal style prefix — keeps token cost low while steering delivery
        const textToSpeak = `Deliver this in an energetic, punchy male sports narrator voice. Fast-paced, confident, built for short-form video:\n\n${fullScript}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ role: "user", parts: [{ text: textToSpeak }] }],
            config: {
                responseModalities: ["AUDIO"] as any,
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Charon" }, // Deep authoritative male voice
                    },
                } as any,
            },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        const audioB64 = (part as any)?.inlineData?.data;

        if (!audioB64) {
            return NextResponse.json({ error: "No audio data returned from Gemini" }, { status: 500 });
        }

        const pcm = Buffer.from(audioB64, "base64");
        const wav = Buffer.concat([buildWavHeader(pcm.length), pcm]);

        const safeName = (title || "narration").replace(/\s+/g, "_").toLowerCase().slice(0, 40);

        return new Response(wav, {
            headers: {
                "Content-Type": "audio/wav",
                "Content-Disposition": `attachment; filename="wtf_${safeName}.wav"`,
                "Content-Length": wav.length.toString(),
            },
        });
    } catch (err: any) {
        console.error("Narrate error:", err);
        return NextResponse.json({ error: err.message || "Narration failed" }, { status: 500 });
    }
}
