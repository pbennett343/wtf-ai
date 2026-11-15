"use client";
import { useState } from "react";
import { Scissors, Play, Copy, Check, ChevronRight, Terminal } from "lucide-react";

const BRAND = {
    navy:       "#3b3b6d",
    navyDark:   "#252547",
    crimson:    "#b42434",
    white:      "#ffffff",
};

type Clip = {
    start: number;
    end:   number;
    hook:  string;
    reason: string;
};

function copyToClipboard(text: string, setCopied: (v: boolean) => void) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
}

export default function ClipMakerPage() {
    const [url, setUrl]           = useState("");
    const [numClips, setNumClips] = useState(5);
    const [clips, setClips]       = useState<Clip[]>([]);
    const [loading, setLoading]   = useState(false);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [copiedSetup, setCopiedSetup] = useState(false);

    // The command users run locally
    const localCmd = url
        ? `python3 clip_maker.py --url "${url}" --clips ${numClips}`
        : `python3 clip_maker.py --url "YOUR_YOUTUBE_URL" --clips ${numClips}`;

    const setupCmd =
        "cd ~/Documents/vibe-editing && python3 doctor.py";

    // For the AI-only clip finder (uses transcript — demo mode)
    const handleFindClips = async () => {
        if (!url.trim()) return;
        setLoading(true);
        setClips([]);
        try {
            // In Vercel: we can only do the AI analysis part (no local ffmpeg)
            // Show a demo response from Gemini based on the URL as context
            const res = await fetch("/api/ai/clip-finder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transcript: [{ start: 0, end: 1, text: "Demo mode — run locally for real clips." }],
                    numClips,
                }),
            });
            const data = await res.json();
            if (data.clips) setClips(data.clips);
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ background: BRAND.navyDark, color: BRAND.white }}>
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
                <a href="/" className="opacity-50 hover:opacity-100 transition-opacity text-sm">← Home</a>
                <span className="opacity-20">|</span>
                <Scissors size={18} style={{ color: BRAND.crimson }} />
                <span className="font-black uppercase tracking-widest text-sm">Clip Maker</span>
            </div>

            <div className="max-w-2xl mx-auto px-5 py-10 space-y-8">

                {/* Title */}
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight leading-none">
                        Vibe<br />
                        <span style={{ color: BRAND.crimson }}>Editing</span>
                    </h1>
                    <p className="mt-2 text-white/60 text-sm">
                        Drop a YouTube link. Gemini picks the best moments. ffmpeg cuts vertical 9:16 clips with burned-in captions.
                    </p>
                </div>

                {/* Step 1: Setup */}
                <div className="rounded-2xl border border-white/10 p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center" style={{ background: BRAND.crimson }}>1</span>
                        <span className="font-bold text-sm uppercase tracking-wider">First-time setup</span>
                    </div>
                    <p className="text-white/50 text-xs">Run this once in Terminal to install ffmpeg, yt-dlp, and Gemini.</p>
                    <div className="rounded-xl p-3 flex items-center justify-between gap-3 font-mono text-xs" style={{ background: BRAND.navyDark }}>
                        <span className="text-green-400">{setupCmd}</span>
                        <button
                            onClick={() => copyToClipboard(setupCmd, setCopiedSetup)}
                            className="shrink-0 p-1.5 rounded-lg transition-all hover:bg-white/10"
                        >
                            {copiedSetup ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-white/40" />}
                        </button>
                    </div>
                </div>

                {/* Step 2: URL + settings */}
                <div className="rounded-2xl border border-white/10 p-5 space-y-4" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center" style={{ background: BRAND.crimson }}>2</span>
                        <span className="font-bold text-sm uppercase tracking-wider">Your video</span>
                    </div>

                    <input
                        type="url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-white/30 transition-colors"
                        style={{ background: BRAND.navyDark, color: BRAND.white }}
                    />

                    <div className="flex items-center gap-3">
                        <label className="text-white/50 text-xs whitespace-nowrap">Clips to find:</label>
                        <input
                            type="range"
                            min={1} max={10} value={numClips}
                            onChange={e => setNumClips(Number(e.target.value))}
                            className="flex-1 accent-red-500"
                        />
                        <span className="font-black text-sm w-5 text-center">{numClips}</span>
                    </div>
                </div>

                {/* Step 3: Run command */}
                <div className="rounded-2xl border border-white/10 p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center" style={{ background: BRAND.crimson }}>3</span>
                        <span className="font-bold text-sm uppercase tracking-wider">Run it</span>
                    </div>
                    <p className="text-white/50 text-xs">Copy this command and paste it to Antigravity chat — it&apos;ll run everything for you.</p>
                    <div className="rounded-xl p-3 flex items-start justify-between gap-3 font-mono text-xs" style={{ background: BRAND.navyDark }}>
                        <span className="text-green-400 break-all">{localCmd}</span>
                        <button
                            onClick={() => copyToClipboard(localCmd, v => { if (v) setCopiedIdx(-1); setTimeout(() => setCopiedIdx(null), 1800); })}
                            className="shrink-0 p-1.5 rounded-lg transition-all hover:bg-white/10 mt-0.5"
                        >
                            {copiedIdx === -1 ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-white/40" />}
                        </button>
                    </div>

                    <div className="rounded-xl p-4 border border-dashed border-white/10 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-white/40">
                            <Terminal size={12} />
                            <span>Output folder: <span className="text-white/60 font-mono">vibe-editing/output/</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                            <Scissors size={12} />
                            <span>Format: <span className="text-white/60">1080×1920 · 9:16 · MP4 · captions burned in</span></span>
                        </div>
                    </div>
                </div>

                {/* What it does */}
                <div className="rounded-2xl border border-white/10 p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <p className="font-bold text-sm uppercase tracking-wider text-white/50">Pipeline</p>
                    {[
                        ["📥", "Download",    "yt-dlp grabs the video at up to 1080p"],
                        ["📝", "Transcribe",  "Gemini reads the audio and timestamps every sentence"],
                        ["🎯", "Find clips",  "Gemini picks the best 30–90s moments with strong hooks"],
                        ["✂️",  "Cut + crop",  "ffmpeg center-crops to 9:16 and burns in captions"],
                    ].map(([icon, label, desc]) => (
                        <div key={label} className="flex items-start gap-3">
                            <span className="text-lg leading-none mt-0.5">{icon}</span>
                            <div>
                                <p className="text-sm font-bold">{label}</p>
                                <p className="text-xs text-white/40">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tip */}
                <p className="text-xs text-white/30 text-center">
                    Clips land in <span className="font-mono text-white/50">vibe-editing/output/</span> — ready to post.
                </p>
            </div>
        </div>
    );
}
