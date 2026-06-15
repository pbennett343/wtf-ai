"use client";

import React, { useState, useRef } from "react";
import { Loader2, Settings2, Sparkles, Video, Download, CheckCircle2, ChevronLeft, Upload, Trophy, X } from "lucide-react";
import VideoFrameExtractor from "@/components/giveaway/VideoFrameExtractor";
import WheelGenerator, { WheelGeneratorRef } from "@/components/giveaway/WheelGenerator";

const INITIAL_STANDINGS = [
  { igHandle: "walker_theaussie94", pwa: 20, w: 3, totalWinnings: 85.00 },
  { igHandle: "daddy_dan12345", pwa: 21, w: 2, totalWinnings: 60.00 },
  { igHandle: "bwright4_3", pwa: 19, w: 2, totalWinnings: 60.00 },
  { igHandle: "connorpapaya", pwa: 11, w: 2, totalWinnings: 50.00 },
  { igHandle: "georgiastvfl", pwa: 3, w: 2, totalWinnings: 50.00 },
  { igHandle: "bnobach13", pwa: 29, w: 1, totalWinnings: 38.40 },
  { igHandle: "bodie_maxon54", pwa: 22, w: 1, totalWinnings: 25.00 },
  { igHandle: "adler.meek", pwa: 21, w: 1, totalWinnings: 25.00 },
  { igHandle: "jacksonkuntz5", pwa: 21, w: 1, totalWinnings: 25.00 },
  { igHandle: "cthenry7", pwa: 20, w: 1, totalWinnings: 38.40 },
  { igHandle: "drewgillis7", pwa: 20, w: 1, totalWinnings: 38.40 },
  { igHandle: "maddox0514", pwa: 19, w: 1, totalWinnings: 25.00 },
  { igHandle: "mrj_2620", pwa: 19, w: 1, totalWinnings: 25.00 },
  { igHandle: "madixwesterlund", pwa: 19, w: 1, totalWinnings: 25.00 },
  { igHandle: "miamijp_1181", pwa: 18, w: 1, totalWinnings: 25.00 },
  { igHandle: "happy_thoughts_4days", pwa: 17, w: 1, totalWinnings: 25.00 },
  { igHandle: "bdc29", pwa: 16, w: 1, totalWinnings: 25.00 },
  { igHandle: "nick.curth", pwa: 15, w: 1, totalWinnings: 25.00 },
  { igHandle: "isaachadlow30", pwa: 14, w: 1, totalWinnings: 38.40 },
  { igHandle: "titusburkhardt", pwa: 13, w: 1, totalWinnings: 35.00 },
  { igHandle: "jakerss2", pwa: 12, w: 1, totalWinnings: 35.00 },
  { igHandle: "dylan_crozier", pwa: 12, w: 1, totalWinnings: 25.00 },
  { igHandle: "dangabay914", pwa: 10, w: 1, totalWinnings: 25.00 },
  { igHandle: "sahilhazari327", pwa: 9, w: 1, totalWinnings: 25.00 },
  { igHandle: "minnichtrey", pwa: 9, w: 1, totalWinnings: 25.00 },
  { igHandle: "jimmy_lasceski", pwa: 8, w: 1, totalWinnings: 25.00 }
];

export default function GiveawayPage() {
    // Inputs
    const [rawText, setRawText] = useState("");
    const [winningAnswer, setWinningAnswer] = useState("");
    const [acceptMisspellings, setAcceptMisspellings] = useState(true);
    const [acceptAllComments, setAcceptAllComments] = useState(false);
    
    // Stats Standing State
    const [trackStats, setTrackStats] = useState(true);
    const [prizeAmount, setPrizeAmount] = useState("25.00");
    const [showStandings, setShowStandings] = useState(false);
    const [showImportExport, setShowImportExport] = useState(false);
    const [importText, setImportText] = useState("");
    const [standings, setStandings] = useState<any[]>([]);
    const [totalGiveaways, setTotalGiveaways] = useState(36);
    const [totalPrizeMoney, setTotalPrizeMoney] = useState(1093.80);
    const [isStatsLoaded, setIsStatsLoaded] = useState(false);

    React.useEffect(() => {
        const savedStandings = localStorage.getItem("wtf_giveaway_standings");
        const savedTotal = localStorage.getItem("wtf_giveaway_total_count");
        const savedMoney = localStorage.getItem("wtf_giveaway_total_money");

        if (savedStandings) {
            try {
                setStandings(JSON.parse(savedStandings));
            } catch (e) {
                setStandings(INITIAL_STANDINGS);
            }
        } else {
            setStandings(INITIAL_STANDINGS);
        }

        if (savedTotal) {
            setTotalGiveaways(parseInt(savedTotal, 10));
        }
        if (savedMoney) {
            setTotalPrizeMoney(parseFloat(savedMoney));
        }
        setIsStatsLoaded(true);
    }, []);
    
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
        if (!winningAnswer && !acceptAllComments) {
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
                let someBatchesFailed = false;

                for (let i = 0; i < frames.length; i += BATCH_SIZE) {
                    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
                    setScanProgress(`Scanning batch ${batchNum} of ${totalBatches}...`);
                    const batch = frames.slice(i, i + BATCH_SIZE);

                    try {
                        const res = await fetch("/api/ai/giveaway-scanner", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                text: i === 0 ? rawText : "", // Only send text with the first batch
                                images: batch,
                                winningAnswer,
                                acceptMisspellings,
                                acceptAllComments
                            }),
                        });

                        if (!res.ok) {
                            throw new Error(`HTTP error ${res.status}`);
                        }

                        const data = await res.json();
                        if (data.usernames && Array.isArray(data.usernames)) {
                            allUsernames.push(...data.usernames);
                            // Update usernames incrementally in real-time so the list populates live!
                            const uniqueSoFar = [...new Set(allUsernames.map(u => String(u).toLowerCase()))];
                            setUsernames(uniqueSoFar);
                            setShowResults(true);
                        } else if (data.error) {
                            console.error(`Batch ${batchNum} API error:`, data.error);
                            someBatchesFailed = true;
                        } else {
                            someBatchesFailed = true;
                        }
                    } catch (batchErr: any) {
                        console.error(`Batch ${batchNum} exception:`, batchErr);
                        someBatchesFailed = true;
                    }
                }

                if (someBatchesFailed) {
                    alert("Notice: Some video frame batches failed to scan due to network timeouts, but all successfully scanned names have been added to the list.");
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
                        acceptMisspellings,
                        acceptAllComments
                    }),
                });
                const data = await res.json();
                if (data.usernames) {
                    allUsernames.push(...data.usernames);
                } else if (data.error) {
                    alert("API Error: " + data.error);
                }
            }

            // Final Deduplicate and clean
            const unique = [...new Set(allUsernames.map(u => String(u).toLowerCase()))];
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

            // Update stats if tracked
            if (trackStats) {
                const prize = parseFloat(prizeAmount) || 0;
                setTotalGiveaways(prev => {
                    const next = prev + 1;
                    localStorage.setItem("wtf_giveaway_total_count", next.toString());
                    return next;
                });
                setTotalPrizeMoney(prev => {
                    const next = prev + prize;
                    localStorage.setItem("wtf_giveaway_total_money", next.toFixed(2));
                    return next;
                });
                setStandings(prev => {
                    const candidateSet = new Set(usernames.map(u => u.toLowerCase().trim()));
                    const existingKeys = new Set(prev.map(p => p.igHandle.toLowerCase().trim()));
                    
                    const updated = prev.map(p => {
                        const key = p.igHandle.toLowerCase().trim();
                        if (candidateSet.has(key)) {
                            const isWinner = key === winner.toLowerCase().trim();
                            return {
                                ...p,
                                pwa: p.pwa + 1,
                                w: isWinner ? p.w + 1 : p.w,
                                totalWinnings: isWinner ? p.totalWinnings + prize : p.totalWinnings
                            };
                        }
                        return p;
                    });

                    usernames.forEach(u => {
                        const key = u.toLowerCase().trim();
                        if (!existingKeys.has(key)) {
                            const isWinner = key === winner.toLowerCase().trim();
                            updated.push({
                                igHandle: u.trim(),
                                pwa: 1,
                                w: isWinner ? 1 : 0,
                                totalWinnings: isWinner ? prize : 0
                            });
                        }
                    });

                    localStorage.setItem("wtf_giveaway_standings", JSON.stringify(updated));
                    return updated;
                });
            }
            
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

    const handleImportData = (rawInput: string) => {
        try {
            const trimmed = rawInput.trim();
            if (trimmed.startsWith("{")) {
                const data = JSON.parse(trimmed);
                if (typeof data.totalGiveaways === 'number' && typeof data.totalPrizeMoney === 'number' && Array.isArray(data.standings)) {
                    setTotalGiveaways(data.totalGiveaways);
                    setTotalPrizeMoney(data.totalPrizeMoney);
                    setStandings(data.standings);
                    localStorage.setItem("wtf_giveaway_total_count", data.totalGiveaways.toString());
                    localStorage.setItem("wtf_giveaway_total_money", data.totalPrizeMoney.toString());
                    localStorage.setItem("wtf_giveaway_standings", JSON.stringify(data.standings));
                    alert("Successfully imported JSON stats!");
                    return true;
                }
                throw new Error("Invalid JSON schema. Must contain totalGiveaways, totalPrizeMoney, and standings array.");
            } else {
                const lines = trimmed.split("\n");
                const parsedStandings: any[] = [];
                let calculatedMoney = 0;

                lines.forEach((line) => {
                    const cols = line.split("\t").map(c => c.trim());
                    if (cols.length >= 3) {
                        if (cols[0].toLowerCase().includes("rank") || cols[1].toLowerCase().includes("handle") || cols[1].toLowerCase().includes("ig")) {
                            return;
                        }
                        let igIndex = 0;
                        if (!isNaN(Number(cols[0])) && cols[0] !== "") {
                            igIndex = 1;
                        }
                        
                        const igHandle = cols[igIndex]?.replace(/^@/, '');
                        if (!igHandle) return;

                        const pwa = parseInt(cols[igIndex + 1], 10) || 0;
                        const w = parseInt(cols[igIndex + 2], 10) || 0;
                        
                        const rawWinnings = cols[cols.length - 1] || "";
                        const winningsCleaned = rawWinnings.replace(/[^0-9.]/g, "");
                        const totalWinnings = parseFloat(winningsCleaned) || 0;

                        parsedStandings.push({
                            igHandle,
                            pwa,
                            w,
                            totalWinnings
                        });
                        calculatedMoney += totalWinnings;
                    }
                });

                if (parsedStandings.length > 0) {
                    const gCountStr = prompt("Enter Total Giveaways count:", totalGiveaways.toString());
                    const totalG = parseInt(gCountStr || "0", 10) || 0;
                    const mCountStr = prompt("Enter Total Prize Money amount ($):", calculatedMoney.toFixed(2));
                    const totalM = parseFloat(mCountStr || "0") || 0;

                    setTotalGiveaways(totalG);
                    setTotalPrizeMoney(totalM);
                    setStandings(parsedStandings);
                    
                    localStorage.setItem("wtf_giveaway_total_count", totalG.toString());
                    localStorage.setItem("wtf_giveaway_total_money", totalM.toString());
                    localStorage.setItem("wtf_giveaway_standings", JSON.stringify(parsedStandings));
                    alert(`Successfully imported ${parsedStandings.length} players from spreadsheet data!`);
                    return true;
                }
                throw new Error("Could not parse data. Ensure it is copy-pasted directly from a spreadsheet tab-separated table (containing handle, pwa, and wins columns).");
            }
        } catch (err: any) {
            alert("Import failed: " + err.message);
            return false;
        }
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
                <button 
                    onClick={() => setShowStandings(true)}
                    className="ml-auto px-3 py-1.5 md:px-4 md:py-2 bg-[#b42434] hover:bg-[#b42434]/90 active:scale-95 text-white font-bold text-[10px] md:text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 select-none shrink-0"
                >
                    <Trophy className="w-3.5 h-3.5" /> Standings
                </button>
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
                                    disabled={acceptAllComments}
                                />
                                <span className={`text-xs font-bold transition-opacity ${acceptAllComments ? 'opacity-40' : ''}`}>Accept Misspellings (AI interprets intent)</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={acceptAllComments}
                                    onChange={e => setAcceptAllComments(e.target.checked)}
                                    className="w-5 h-5 rounded accent-[#b42434]"
                                />
                                <span className="text-xs font-bold">Accept All Comments <span className="text-white/40 font-normal">(ignore winning answer — add every commenter)</span></span>
                            </label>

                            <div className="pt-3 border-t border-white/5 space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={trackStats}
                                        onChange={e => setTrackStats(e.target.checked)}
                                        className="w-5 h-5 rounded accent-[#b42434]"
                                    />
                                    <span className="text-xs font-bold">Track Stats towards WTF Giveaway Games</span>
                                </label>
                                
                                {trackStats && (
                                    <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl border border-white/5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 whitespace-nowrap">Prize Value per Win ($):</label>
                                        <input
                                            type="text"
                                            value={prizeAmount}
                                            onChange={e => setPrizeAmount(e.target.value)}
                                            placeholder="25.00"
                                            className="w-24 bg-black/40 border border-white/10 rounded-lg p-1.5 px-3 text-xs font-bold focus:outline-none focus:border-[#b42434] transition-colors"
                                        />
                                    </div>
                                )}
                            </div>
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

            {/* Standings Modal */}
            {showStandings && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
                    <div className="bg-[#111114] border border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col relative my-8 overflow-hidden">
                        {/* Header styled exactly like image */}
                        <div className="bg-[#1e295d] p-6 relative text-center flex flex-col items-center select-none">
                            {/* Logo in top right */}
                            <div className="absolute top-4 right-4 md:right-6">
                                <img src="/wtf-logo-transparent.png" alt="WTF Logo" className="h-8 md:h-10 w-auto object-contain" />
                            </div>
                            
                            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white">
                                2026 WTF GIVEAWAY GAMES
                            </h2>
                            
                            {/* Subheader values */}
                            <div className="w-full max-w-2xl flex justify-between items-center mt-6 text-white text-xs md:text-sm font-bold uppercase tracking-wider">
                                <span className="italic opacity-90">Total Giveaways: {totalGiveaways}</span>
                                <span className="italic opacity-90 text-right">
                                    ${totalPrizeMoney.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        {showImportExport ? (
                            <div className="p-6 space-y-4 flex flex-col flex-grow">
                                <h3 className="text-sm font-black italic uppercase tracking-wider text-white">Import / Export Standings</h3>
                                <p className="text-xs text-white/60 leading-relaxed">
                                    Paste tab-separated columns directly from your **Excel / Google Sheet** or paste a raw JSON export.
                                    To export, copy the JSON block generated below.
                                </p>
                                <textarea
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                    placeholder={`Spreadsheet column order (simply select cells in sheets/excel and copy):\nHandle\tAppearance\tWins\tTotal Winnings\n\nExample lines:\nwalker_theaussie94\t20\t3\t$85.00\ndaddy_dan12345\t21\t2\t$60.00`}
                                    className="w-full h-60 bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono resize-none focus:outline-none focus:border-[#b42434] transition-colors text-white"
                                />
                                <div className="flex flex-wrap gap-2 justify-end pt-2">
                                    <button
                                        onClick={() => {
                                            const currentExport = {
                                                totalGiveaways,
                                                totalPrizeMoney,
                                                standings
                                            };
                                            setImportText(JSON.stringify(currentExport, null, 2));
                                        }}
                                        className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                                    >
                                        Export Current JSON
                                    </button>
                                    <button
                                        onClick={() => setShowImportExport(false)}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (handleImportData(importText)) {
                                                setShowImportExport(false);
                                            }
                                        }}
                                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                                    >
                                        Import Data
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-x-auto p-4 md:p-6 max-h-[50vh] overflow-y-auto">
                                    {standings.length === 0 ? (
                                        <div className="text-center py-12 text-white/40 font-bold uppercase tracking-wider text-xs">
                                            No standings entries yet. Run a giveaway or import data.
                                        </div>
                                    ) : (
                                        <table className="w-full border-collapse text-left">
                                            <thead>
                                                <tr className="bg-[#1e295d] text-white text-[10px] font-black uppercase tracking-wider border-b border-white/20 select-none">
                                                    <th className="py-3 px-4 rounded-tl-xl text-center w-16">Rank</th>
                                                    <th className="py-3 px-4">IG Handle</th>
                                                    <th className="py-3 px-4 text-center">PWA</th>
                                                    <th className="py-3 px-4 text-center">W</th>
                                                    <th className="py-3 px-4 text-center">L</th>
                                                    <th className="py-3 px-4 text-center">Win %</th>
                                                    <th className="py-3 px-4 text-right pr-6 rounded-tr-xl">Total Winnings</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    const sorted = [...standings].sort((a, b) => {
                                                        if (b.w !== a.w) return b.w - a.w;
                                                        return b.pwa - a.pwa;
                                                    });
                                                    let currentRank = 1;
                                                    return sorted.map((player, idx) => {
                                                        if (idx > 0) {
                                                            const prev = sorted[idx - 1];
                                                            if (player.w !== prev.w || player.pwa !== prev.pwa) {
                                                                currentRank = idx + 1;
                                                            }
                                                        }
                                                        const lCount = player.pwa - player.w;
                                                        const winPercent = player.pwa > 0 ? (player.w / player.pwa) * 100 : 0;
                                                        return (
                                                            <tr 
                                                                key={idx} 
                                                                className="border-b border-[#cbd5e1] hover:bg-[#e2e8f0] transition-colors odd:bg-white even:bg-[#f8fafc] text-slate-800 text-xs font-bold"
                                                            >
                                                                <td className="py-2.5 px-4 text-center text-slate-500 font-black">{currentRank}</td>
                                                                <td className="py-2.5 px-4 text-[#1e295d] font-bold">@{player.igHandle}</td>
                                                                <td className="py-2.5 px-4 text-center font-extrabold">{player.pwa}</td>
                                                                <td className="py-2.5 px-4 text-center font-extrabold text-green-700">{player.w}</td>
                                                                <td className="py-2.5 px-4 text-center font-extrabold text-slate-500">{lCount}</td>
                                                                <td className="py-2.5 px-4 text-center font-extrabold text-indigo-700">
                                                                    {winPercent.toFixed(2)}%
                                                                </td>
                                                                <td className="py-2.5 px-4 text-right pr-6 font-black text-emerald-700">
                                                                    ${player.totalWinnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </td>
                                                            </tr>
                                                        );
                                                    });
                                                })()}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                <div className="bg-black/20 p-4 border-t border-white/5 flex flex-wrap gap-3 justify-between items-center shrink-0">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (confirm("Are you sure you want to reset standings to the default initial values?")) {
                                                    setStandings(INITIAL_STANDINGS);
                                                    setTotalGiveaways(36);
                                                    setTotalPrizeMoney(1093.80);
                                                    localStorage.removeItem("wtf_giveaway_standings");
                                                    localStorage.removeItem("wtf_giveaway_total_count");
                                                    localStorage.removeItem("wtf_giveaway_total_money");
                                                }
                                            }}
                                            className="px-3 py-2 border border-red-500/30 hover:bg-red-500/10 active:scale-95 text-red-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                                        >
                                            Reset to Default
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm("Are you sure you want to clear all standings to 0?")) {
                                                    setStandings([]);
                                                    setTotalGiveaways(0);
                                                    setTotalPrizeMoney(0);
                                                    localStorage.setItem("wtf_giveaway_standings", "[]");
                                                    localStorage.setItem("wtf_giveaway_total_count", "0");
                                                    localStorage.setItem("wtf_giveaway_total_money", "0");
                                                }
                                            }}
                                            className="px-3 py-2 border border-white/10 hover:bg-white/5 active:scale-95 text-white/60 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setImportText("");
                                                setShowImportExport(true);
                                            }}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                                        >
                                            Import / Export
                                        </button>
                                        <button
                                            onClick={() => setShowStandings(false)}
                                            className="px-5 py-2 bg-[#b42434] hover:bg-[#b42434]/90 active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
