"use client";

import React, { useState, useRef } from "react";
import { Loader2, Settings2, Sparkles, Video, Download, CheckCircle2, ChevronLeft, Upload } from "lucide-react";
import VideoFrameExtractor from "@/components/giveaway/VideoFrameExtractor";
import WheelGenerator, { WheelGeneratorRef } from "@/components/giveaway/WheelGenerator";

export default function GiveawayPage() {
    // Inputs
    const [rawText, setRawText] = useState("");
    const [winningAnswer, setWinningAnswer] = useState("");
    const [acceptMisspellings, setAcceptMisspellings] = useState(true);
    
    // Media
    const [file, setFile] = useState<File | null>(null);
    const [isVideo, setIsVideo] = useState(false);
    const [frames, setFrames] = useState<string[]>([]);
    
    // Scanning State
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState("");
    const [usernames, setUsernames] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [winnerName, setWinnerName] = useState("");
    const wheelRef = useRef<WheelGeneratorRef>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setIsVideo(f.type.includes('video'));
        setFrames([]);
        setShowResults(false);
        setVideoUrl(null);

        if (f.type.includes('image')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFrames([reader.result as string]);
            };
            reader.readAsDataURL(f);
        }
    };

    const handleScan = async () => {
        if (!winningAnswer) {
            alert("Please enter a winning answer to search for.");
            return;
        }
        if (!rawText && frames.length === 0) {
            alert("Please paste text or upload an image/video to scan.");
            return;
        }

        setIsScanning(true);
        setShowResults(false);
        setUsernames([]);
        setScanProgress("");

        try {
            const allUsernames: string[] = [];
            const BATCH_SIZE = 3; // Max 3 frames per request to stay under Vercel's 4.5MB body limit

            if (frames.length > 0) {
                const totalBatches = Math.ceil(frames.length / BATCH_SIZE);
                for (let i = 0; i < frames.length; i += BATCH_SIZE) {
                    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
                    setScanProgress(`Scanning batch ${batchNum} of ${totalBatches}...`);
                    const batch = frames.slice(i, i + BATCH_SIZE);
                    const res = await fetch("/api/ai/giveaway-scanner", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            text: i === 0 ? rawText : "", // Only send text with the first batch
                            images: batch,
                            winningAnswer,
                            acceptMisspellings
                        }),
                    });
                    const data = await res.json();
                    if (data.usernames) {
                        allUsernames.push(...data.usernames);
                    } else if (data.error) {
                        console.error(`Batch ${batchNum} error:`, data.error);
                    }
                }
            } else {
                setScanProgress("Scanning text...");
                const res = await fetch("/api/ai/giveaway-scanner", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: rawText,
                        images: [],
                        winningAnswer,
                        acceptMisspellings
                    }),
                });
                const data = await res.json();
                if (data.usernames) {
                    allUsernames.push(...data.usernames);
                } else if (data.error) {
                    alert("API Error: " + data.error);
                }
            }

            // Deduplicate
            const unique = [...new Set(allUsernames.map(u => u.toLowerCase()))];
            setUsernames(unique);
            setShowResults(true);

        } catch (e: any) {
            console.error(e);
            alert("Scan failed: " + e.message);
        } finally {
            setIsScanning(false);
            setScanProgress("");
        }
    };

    const triggerDownload = async (blobUrl: string, fileName: string) => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const nav = navigator as Navigator & {
            canShare?: (data?: { files?: File[] }) => boolean;
        };

        if (isMobile && typeof nav.share === 'function') {
            try {
                const response = await fetch(blobUrl);
                const blob = await response.blob();
                const file = new File([blob], fileName, { type: 'video/webm' });
                if (nav.canShare && nav.canShare({ files: [file] })) {
                    await nav.share({ files: [file], title: 'WTF Giveaway Winner' });
                    return;
                }
            } catch (shareErr) {
                if ((shareErr as Error).name === 'AbortError') return;
                // Fall through to link download
            }
        }

        // Desktop fallback
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleGenerate = async () => {
        if (usernames.length === 0) return;
        if (!wheelRef.current) return;

        setIsGenerating(true);
        setVideoUrl(null);
        
        try {
            // Pick a random winner
            const winner = usernames[Math.floor(Math.random() * usernames.length)];
            setWinnerName(winner);
            
            // Generate the video
            const url = await wheelRef.current.generateVideo(usernames, winner);
            setVideoUrl(url);
            
            // Auto-download with iOS Web Share API support
            const fileName = `giveaway_winner_${winner}.mp4`;
            await triggerDownload(url, fileName);

        } catch (e: any) {
            console.error(e);
            alert("Failed to generate video: " + e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const removeUsername = (idx: number) => {
        setUsernames(prev => prev.filter((_, i) => i !== idx));
    };

    return (
        <div className="min-h-screen bg-[#111114] text-white font-sans">
            {/* Mobile-first sticky header */}
            <div className="sticky top-0 z-50 bg-[#111114]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
                <a href="/" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors shrink-0">
                    <ChevronLeft className="w-5 h-5" />
                </a>
                <div className="min-w-0">
                    <h1 className="text-xl font-black italic uppercase tracking-tighter text-[#b42434] truncate">WTF Giveaway</h1>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">AI Comment Scanner & Wheel Generator</p>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Inputs */}
                    <div className="space-y-5">
                        {/* Settings */}
                        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5 space-y-4">
                            <h3 className="text-sm font-black italic uppercase tracking-wider flex items-center gap-2"><Settings2 className="w-4 h-4 text-[#b42434]" /> Settings</h3>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Winning Answer (comma separated)</label>
                                <input
                                    type="text"
                                    value={winningAnswer}
                                    onChange={e => setWinningAnswer(e.target.value)}
                                    placeholder="e.g. Patrick Mahomes, Mahomes, 15"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-[#b42434] transition-colors"
                                />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={acceptMisspellings}
                                    onChange={e => setAcceptMisspellings(e.target.checked)}
                                    className="w-5 h-5 rounded accent-[#b42434]"
                                />
                                <span className="text-xs font-bold">Accept Misspellings (AI interprets intent)</span>
                            </label>
                        </div>

                        {/* Input Methods */}
                        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5 space-y-5">
                            <h3 className="text-sm font-black italic uppercase tracking-wider">Data Source</h3>
                            
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Paste Text</label>
                                <textarea
                                    value={rawText}
                                    onChange={e => setRawText(e.target.value)}
                                    placeholder="Paste raw comments here..."
                                    className="w-full h-28 bg-black/40 border border-white/10 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-[#b42434] transition-colors"
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-[#111114] px-4 text-[10px] font-black uppercase tracking-widest text-white/30">OR</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Upload Image / Video</label>
                                <div className="relative group">
                                    <input 
                                        type="file" 
                                        accept="image/*,video/*" 
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full border-2 border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 group-hover:border-[#b42434] group-hover:bg-[#b42434]/5 transition-all active:scale-[0.98]">
                                        <Upload className="w-7 h-7 text-white/40 group-hover:text-[#b42434]" />
                                        <p className="font-bold text-xs text-center text-white/60">
                                            {file ? file.name : "Tap to upload from Camera Roll"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {isVideo && file && frames.length === 0 && (
                                <div className="pt-3 border-t border-white/5">
                                    <VideoFrameExtractor 
                                        file={file} 
                                        onFramesExtracted={setFrames}
                                        onComplete={() => console.log("Frames extracted")}
                                        interval={2}
                                    />
                                </div>
                            )}

                            {frames.length > 0 && (
                                <p className="text-xs font-bold text-green-500 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Ready to scan {frames.length} {frames.length === 1 ? 'image' : 'frames'}
                                </p>
                            )}

                            <button
                                onClick={handleScan}
                                disabled={isScanning || (!rawText && frames.length === 0) || (isVideo && frames.length === 0)}
                                className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2"
                            >
                                {isScanning ? <><Loader2 className="w-5 h-5 animate-spin" /> {scanProgress || "Scanning..."}</> : <><Sparkles className="w-5 h-5" /> Scan For Winners</>}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Results & Action */}
                    <div className="space-y-5">
                        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5 min-h-[350px] flex flex-col">
                            <h3 className="text-sm font-black italic uppercase tracking-wider mb-4 flex items-center justify-between">
                                <span>Found Winners {showResults && `(${usernames.length})`}</span>
                            </h3>

                            {!showResults ? (
                                <div className="flex-1 flex items-center justify-center text-white/20 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-white/5 rounded-2xl p-4">
                                    Waiting for scan...
                                </div>
                            ) : usernames.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center text-red-500 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-red-500/20 rounded-2xl bg-red-500/5 p-4">
                                    No winners found.
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px]">
                                    {usernames.map((u, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-black/40 border border-white/5 rounded-xl hover:border-white/20 transition-colors">
                                            <span className="font-bold text-sm">@{u}</span>
                                            <button onClick={() => removeUsername(i)} className="text-white/30 hover:text-red-500 active:text-red-400 font-bold text-xs px-2 py-1">Remove</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showResults && usernames.length > 0 && (
                                <div className="mt-5 pt-5 border-t border-white/5">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="w-full bg-[#b42434] text-white py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_20px_rgba(180,36,52,0.4)] disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                                    >
                                        {isGenerating ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Generating Video...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Video className="w-5 h-5" />
                                                <span>Spin The Wheel!</span>
                                            </div>
                                        )}
                                        {isGenerating && <span className="text-[9px] text-white/70 mt-1">Please wait ~11 seconds</span>}
                                    </button>

                                    {videoUrl && (
                                        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-green-500">🎉 Winner: @{winnerName}</span>
                                                <button 
                                                    onClick={() => triggerDownload(videoUrl, `giveaway_winner_${winnerName}.mp4`)}
                                                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white active:text-white/80"
                                                >
                                                    <Download className="w-3 h-3" /> Save Again
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Hidden Canvas Generator */}
            <WheelGenerator ref={wheelRef} />
        </div>
    );
}
