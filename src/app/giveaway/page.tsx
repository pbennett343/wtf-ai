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
    const [usernames, setUsernames] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
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

        try {
            const res = await fetch("/api/ai/giveaway-scanner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: rawText,
                    images: frames,
                    winningAnswer,
                    acceptMisspellings
                }),
            });
            const data = await res.json();
            
            if (data.usernames) {
                setUsernames(data.usernames);
                setShowResults(true);
            } else if (data.error) {
                alert("API Error: " + data.error);
            }
        } catch (e: any) {
            console.error(e);
            alert("Scan failed: " + e.message);
        } finally {
            setIsScanning(false);
        }
    };

    const handleGenerate = async () => {
        if (usernames.length === 0) return;
        if (!wheelRef.current) return;

        setIsGenerating(true);
        setVideoUrl(null);
        
        try {
            // Pick a random winner
            const winner = usernames[Math.floor(Math.random() * usernames.length)];
            
            // Generate the video
            const url = await wheelRef.current.generateVideo(usernames, winner);
            setVideoUrl(url);
            
            // Auto-download
            const a = document.createElement("a");
            a.href = url;
            a.download = `giveaway_winner_${winner}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

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
        <div className="min-h-screen bg-[#111114] text-white p-4 md:p-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <a href="/" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </a>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[#b42434]">WTF Giveaway</h1>
                        <p className="text-sm font-bold uppercase tracking-widest text-white/40">AI Comment Scanner & Wheel Generator</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Inputs */}
                    <div className="space-y-6">
                        {/* Settings */}
                        <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
                            <h3 className="font-black italic uppercase tracking-wider flex items-center gap-2"><Settings2 className="w-5 h-5" /> Settings</h3>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Winning Answer (comma separated)</label>
                                <input
                                    type="text"
                                    value={winningAnswer}
                                    onChange={e => setWinningAnswer(e.target.value)}
                                    placeholder="e.g. Patrick Mahomes, Mahomes, 15"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-bold focus:outline-none focus:border-[#b42434] transition-colors"
                                />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={acceptMisspellings}
                                    onChange={e => setAcceptMisspellings(e.target.checked)}
                                    className="w-5 h-5 rounded accent-[#b42434]"
                                />
                                <span className="text-sm font-bold">Accept Misspellings (AI interprets intent)</span>
                            </label>
                        </div>

                        {/* Input Methods */}
                        <div className="glass rounded-3xl p-6 border border-white/5 space-y-6">
                            <h3 className="font-black italic uppercase tracking-wider">Data Source</h3>
                            
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Paste Text</label>
                                <textarea
                                    value={rawText}
                                    onChange={e => setRawText(e.target.value)}
                                    placeholder="Paste raw comments here..."
                                    className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-[#b42434] transition-colors"
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
                                    <div className="w-full border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 group-hover:border-[#b42434] group-hover:bg-[#b42434]/5 transition-all">
                                        <Upload className="w-8 h-8 text-white/40 group-hover:text-[#b42434]" />
                                        <p className="font-bold text-sm text-center">
                                            {file ? file.name : "Click or drag file to upload"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {isVideo && file && frames.length === 0 && (
                                <div className="pt-4 border-t border-white/5">
                                    <VideoFrameExtractor 
                                        file={file} 
                                        onFramesExtracted={setFrames}
                                        onComplete={() => console.log("Frames extracted")}
                                        interval={1}
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
                                className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2"
                            >
                                {isScanning ? <><Loader2 className="w-5 h-5 animate-spin" /> Scanning...</> : <><Sparkles className="w-5 h-5" /> Scan For Winners</>}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Results & Action */}
                    <div className="space-y-6">
                        <div className="glass rounded-3xl p-6 border border-white/5 min-h-[400px] flex flex-col">
                            <h3 className="font-black italic uppercase tracking-wider mb-6 flex items-center justify-between">
                                <span>Found Winners {showResults && `(${usernames.length})`}</span>
                            </h3>

                            {!showResults ? (
                                <div className="flex-1 flex items-center justify-center text-white/20 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-white/5 rounded-2xl">
                                    Waiting for scan...
                                </div>
                            ) : usernames.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center text-red-500 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-red-500/20 rounded-2xl bg-red-500/5">
                                    No winners found.
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {usernames.map((u, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-black/40 border border-white/5 rounded-xl hover:border-white/20 transition-colors">
                                            <span className="font-bold text-sm">@{u}</span>
                                            <button onClick={() => removeUsername(i)} className="text-white/30 hover:text-red-500 font-bold text-xs">Remove</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showResults && usernames.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="w-full bg-[#b42434] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(180,36,52,0.4)] disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                                    >
                                        {isGenerating ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                <span>Generating MP4...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Video className="w-6 h-6" />
                                                <span>Spin The Wheel!</span>
                                            </div>
                                        )}
                                        {isGenerating && <span className="text-[9px] text-white/70">Please wait approx 8 seconds...</span>}
                                    </button>

                                    {videoUrl && (
                                        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between">
                                            <span className="text-xs font-bold text-green-500">Video Ready! (Check Downloads)</span>
                                            <a 
                                                href={videoUrl} 
                                                download="giveaway_winner.mp4"
                                                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white"
                                            >
                                                <Download className="w-3 h-3" /> Download Again
                                            </a>
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
