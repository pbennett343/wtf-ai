"use client";

import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import {
    Type,
    Settings2,
    Image as ImageIcon,
    Table2,
    Maximize,
    Download,
    CheckCircle2,
    BadgeCheck,
    Sparkles,
    Scan,
    Loader2,
    Upload,
    Layout,
    Palette,
    Zap
} from "lucide-react";

const INITIAL_STAT = `Victor Wembanyama has faced 547 different players in his NBA career so far.

He's blocked 49.9% (273/547) of them.`;

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function Home() {
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [isExporting, setIsExporting] = useState(false);

    // App State
    const [statText, setStatText] = useState(INITIAL_STAT);
    const [prevStatText, setPrevStatText] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState(140);
    const [lineHeight, setLineHeight] = useState(1.4);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [aiImageResult, setAiImageResult] = useState<{ url: string, prompt: string } | null>(null);

    // Layout Engine
    const [leftIndent, setLeftIndent] = useState(160);
    const [logoHeight, setLogoHeight] = useState(360);
    const [logoTopPadding, setLogoTopPadding] = useState(50);
    const [logoBottomPadding, setLogoBottomPadding] = useState(68);
    const [textTopPadding, setTextTopPadding] = useState(0);
    const [genCount, setGenCount] = useState(0);

    // Brand Engine
    const [brand, setBrand] = useState('wtf-x-logo.jpg');

    // Responsive Scale Engine
    const [previewScale, setPreviewScale] = useState(0.14);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setPreviewScale(0.065); // Aggressive scale for mobile bottom view
            } else if (window.innerWidth < 1200) {
                setPreviewScale(0.11);
            } else {
                setPreviewScale(0.14);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Brand Switcher Scaling logic
    useEffect(() => {
        if (brand === 'wtf-x-logo.jpg') {
            setFontSize(140);
            setLineHeight(1.0);
            setLeftIndent(140);
            setLogoHeight(260);
            setLogoTopPadding(42);
            setLogoBottomPadding(68);
            setTextTopPadding(0);
        } else if (brand === 'vfl-logo.png') {
            setFontSize(110);
            setLineHeight(1.4);
            setLeftIndent(260); // VFL logo is wider
            setLogoHeight(360);
            setLogoTopPadding(50);
            setLogoBottomPadding(25);
            setTextTopPadding(0);
        }
    }, [brand]);

    // Local Storage Loading
    useEffect(() => {
        const saved = localStorage.getItem('wtf_layout_defaults');
        if (saved) {
            try {
                const d = JSON.parse(saved);
                if (d.fontSize) setFontSize(d.fontSize);
                if (d.lineHeight) setLineHeight(d.lineHeight);
                if (d.leftIndent !== undefined) setLeftIndent(d.leftIndent);
                if (d.logoHeight !== undefined) setLogoHeight(d.logoHeight);
                if (d.logoTopPadding !== undefined) setLogoTopPadding(d.logoTopPadding);
                if (d.logoBottomPadding !== undefined) setLogoBottomPadding(d.logoBottomPadding);
                if (d.textTopPadding !== undefined) setTextTopPadding(d.textTopPadding);
                if (d.brand) setBrand(d.brand);
            } catch (e) { }
        }
    }, []);

    const saveDefaults = () => {
        const d = { fontSize, lineHeight, leftIndent, logoHeight, logoTopPadding, logoBottomPadding, textTopPadding, brand };
        localStorage.setItem('wtf_layout_defaults', JSON.stringify(d));
        alert('Layout Defaults Locked Successfully!');
    };

    // Autopopulate AI Prompt
    useEffect(() => {
        if (currentStep === 3 && !aiImagePrompt) {
            setAiImagePrompt(statText);
        }
    }, [currentStep, statText]);

    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [photoZoom, setPhotoZoom] = useState(100);
    const [photoPanX, setPhotoPanX] = useState(0);
    const [photoPanY, setPhotoPanY] = useState(0);

    const exportRef = useRef<HTMLDivElement>(null);

    const handleExport = async () => {
        if (!exportRef.current) return;
        setIsExporting(true);

        try {
            const canvas = await html2canvas(exportRef.current, {
                scale: 1, // Already at 4000x5333
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `wtf_stat_${Date.now()}.jpg`;
            a.click();
        } catch (err) {
            console.error("Failed to export:", err);
            alert("Failed to export the image. Check console for details.");
        } finally {
            setIsExporting(false);
        }
    };

    const GraphicTemplate = ({ containerRef, isHidden = false }: { containerRef?: React.RefObject<HTMLDivElement>, isHidden?: boolean }) => (
        <div
            ref={containerRef}
            className={`w-[4000px] h-[5333px] bg-white flex flex-col ${isHidden ? 'fixed -left-[5000px] -top-[5000px]' : ''}`}
            style={{
                transform: !isHidden ? `scale(${previewScale})` : 'none',
                transformOrigin: 'center center'
            }}
        >
            {/* HEADER (LOCKED STATIC IMAGE) */}
            <div
                className="w-full"
                style={{
                    paddingLeft: `${leftIndent}px`,
                    paddingTop: `${logoTopPadding}px`,
                    paddingBottom: `${logoBottomPadding}px`
                }}
            >
                <img
                    src={`/${brand}`}
                    alt="Brand Header"
                    className="w-auto object-contain"
                    style={{ height: `${logoHeight}px` }}
                    crossOrigin="anonymous"
                />
            </div>

            {/* STAT TEXT */}
            <div
                className="pr-[220px] text-[#0F1419] font-normal whitespace-pre-wrap font-sans"
                style={{
                    paddingLeft: `${leftIndent}px`,
                    fontSize: `${fontSize}px`,
                    lineHeight: `${lineHeight}`,
                    paddingTop: `${textTopPadding}px`
                }}
            >
                {statText}
            </div>

            {/* MEDIA / PHOTO LAYER */}
            <div className="flex-1 w-[4000px] relative overflow-hidden mt-[150px]">
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt="Background"
                        className="absolute max-w-none"
                        style={{
                            width: `${photoZoom}%`,
                            left: `calc(50% + ${photoPanX}px)`,
                            top: `calc(50% + ${photoPanY}px)`,
                            transform: 'translate(-50%, -50%)',
                        }}
                        crossOrigin="anonymous"
                    />
                ) : (
                    <div className="absolute inset-0 bg-zinc-100 flex items-center justify-center border-t-[4px] border-zinc-200">
                        <p className="text-zinc-400 text-[80px]">No media selected</p>
                    </div>
                )}

                {/* AI Generation Overlay */}
                {isGeneratingImage && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
                        <div className="relative">
                            <div className="w-64 h-64 border-8 border-zinc-800 border-t-red-600 rounded-full animate-spin"></div>
                            <Sparkles className="absolute inset-0 m-auto h-20 w-20 text-red-500 animate-pulse" />
                        </div>
                        <h3 className="mt-12 text-[120px] font-black italic tracking-tighter text-white animate-bounce">AI GENERATING...</h3>
                        <p className="text-red-400 text-[40px] font-bold uppercase tracking-[1em] mt-4 ml-[1em]">Please wait</p>
                    </div>
                )}
            </div>
        </div>
    );

    const [isAILoading, setIsAILoading] = useState(false);

    const handleAIReword = async () => {
        if (!statText) return;
        setIsAILoading(true);
        console.log("Starting handleAIReword...");
        try {
            const res = await fetch("/api/ai/reword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: statText }),
            });
            console.log("Reword Response Status:", res.status);
            const data = await res.json();
            console.log("Reword Response Data:", data);

            if (data.text) {
                setPrevStatText(statText); // Save for undo
                setStatText(data.text);
                alert("SUCCESS: WTF Style Applied!");
            } else if (data.error) {
                alert("API ERROR: " + data.error + (data.details ? "\n\nDetails: " + data.details : ""));
            } else {
                alert("UNKNOWN API RESPONSE: " + JSON.stringify(data));
            }
        } catch (error: any) {
            console.error("Reword fetch failed", error);
            alert("FETCH FAILED: " + error.message);
        } finally {
            setIsAILoading(false);
        }
    };

    const handleAIRead = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsAILoading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const res = await fetch("/api/ai/vision", {
                        method: "POST",
                        body: JSON.stringify({ image: reader.result }),
                    });
                    const data = await res.json();
                    if (data.text) {
                        setPrevStatText(statText); // Save for undo
                        setStatText(data.text);
                    }
                    else if (data.error) alert("AI Scan Error: " + data.error);
                } catch (error) {
                    console.error("Vision API failed", error);
                    alert("AI Scan failed to connect.");
                } finally {
                    setIsAILoading(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("FileReader failed", error);
            setIsAILoading(false);
        }
    };

    const [aiImagePrompt, setAiImagePrompt] = useState("");
    const [aiImageStyle, setAiImageStyle] = useState<"realistic" | "cartoon">("cartoon");

    const handleAIGenerate = async () => {
        if (!aiImagePrompt) return;
        setGenCount(prev => prev + 1); // Force key change
        setIsAILoading(true);
        setIsGeneratingImage(true);
        setAiImageResult(null); // Reset preview to force fresh load
        console.log("Starting handleAIGenerate...");
        try {
            const res = await fetch("/api/ai/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: aiImagePrompt,
                    style: aiImageStyle,
                    context: statText
                }),
            });
            const data = await res.json();

            if (data.generatedPrompt) {
                const encodedPrompt = encodeURIComponent(data.generatedPrompt);
                const randomSeed = Math.floor(Math.random() * 1000000);
                const mockUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&model=flux&seed=${randomSeed}`;
                setAiImageResult({ url: mockUrl, prompt: data.generatedPrompt });
            } else if (data.error) {
                alert("API ERROR: " + data.error);
            }
        } catch (error: any) {
            console.error("Generate fetch failed", error);
        } finally {
            setIsAILoading(false);
            setIsGeneratingImage(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPhotoUrl(url);
        }
    };

    const [hasApiKey, setHasApiKey] = useState(true);

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            setHasApiKey(false);
        }
    }, []);

    const steps = [
        { id: 1, icon: <Type size={20} />, label: "Enter Text" },
        { id: 2, icon: <Settings2 size={20} />, label: "Edit Text" },
        { id: 3, icon: <ImageIcon size={20} />, label: "Add Photo" },
        { id: 4, icon: <Table2 size={20} />, label: "Add Table" },
        { id: 5, icon: <Maximize size={20} />, label: "Visuals" },
        { id: 6, icon: <Download size={20} />, label: "Finalize" },
    ];

    return (
        <div className="flex flex-col md:flex-row h-screen bg-zinc-950 text-white font-sans overflow-hidden">

            {/* SIDEBAR WIZARD / TOP PANEL (on mobile) */}
            <div className="w-full md:w-80 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col z-10 shadow-2xl order-1 md:order-1 overflow-hidden shrink-0 h-[50vh] md:h-full">
                {!hasApiKey && (
                    <div className="bg-red-900/50 text-red-200 text-[10px] p-2 text-center border-b border-red-800 animate-pulse">
                        ⚠️ GEMINI_API_KEY MISSING
                    </div>
                )}
                <div className="p-4 md:p-6 border-b border-zinc-800 space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between md:block">
                        <div>
                            <h1 className="text-xl md:text-2xl font-black italic tracking-tighter">WTF.AI</h1>
                            <p className="text-zinc-500 text-[10px] md:text-sm md:mt-1 hidden md:block">IG Generator Engine</p>
                        </div>

                        <div className="md:hidden">
                            <select
                                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[10px] text-white focus:outline-none"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                            >
                                <option value="wtf-x-logo.jpg">WTF Stats</option>
                                <option value="bets-x-logo.jpg">WTF Bets</option>
                                <option value="vfl-x-logo.jpg">VFL</option>
                                <option value="pod-x-logo.jpg">Willing To Fail</option>
                            </select>
                        </div>
                    </div>

                    {/* Desktop Brand Selector */}
                    <div className="hidden md:block bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 block">Brand Persona</label>
                        <select
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                        >
                            <option value="wtf-x-logo.jpg">WTF Stats</option>
                            <option value="bets-x-logo.jpg">WTF Bets</option>
                            <option value="vfl-x-logo.jpg">VFL</option>
                            <option value="pod-x-logo.jpg">Willing To Fail</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 md:space-y-8">

                    {/* Step Navigation */}
                    <nav className="flex space-x-1 border-b border-zinc-800 pb-4 sticky top-0 bg-zinc-900 z-50">
                        {steps.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setCurrentStep(s.id as Step)}
                                className={`flex-1 flex justify-center py-2 rounded-md transition-colors ${currentStep === s.id ? "bg-red-600 text-white shadow-lg" : "text-zinc-500 hover:bg-zinc-800 hover:text-white"
                                    }`}
                                title={s.label}
                            >
                                {s.icon}
                            </button>
                        ))}
                    </nav>

                    {/* ACTIVE TOOL PANEL */}
                    <div className="space-y-6 pb-20 md:pb-0">

                        {currentStep === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-bold flex items-center gap-2"><Type className="text-red-500" /> Step 1: Enter Text</h2>
                                    <div className="flex gap-2">
                                        <label className="cursor-pointer bg-zinc-900 border border-zinc-800 p-2 rounded-lg hover:border-red-500 transition-all text-xs flex items-center gap-2">
                                            <Scan size={14} className="text-zinc-400" />
                                            <span>Scan Image</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleAIRead} disabled={isAILoading} />
                                        </label>
                                        <button
                                            onClick={handleAIReword}
                                            disabled={isAILoading || !statText}
                                            className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg hover:border-red-500 transition-all text-xs flex items-center gap-2"
                                        >
                                            {isAILoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} className="text-red-500" />}
                                            <span>WTF Style</span>
                                        </button>
                                        {prevStatText && (
                                            <button
                                                onClick={() => {
                                                    const current = statText;
                                                    setStatText(prevStatText);
                                                    setPrevStatText(current); // Allow re-undo (redo)
                                                }}
                                                className="bg-zinc-800 border border-zinc-700 p-2 rounded-lg hover:border-zinc-500 transition-all text-xs flex items-center gap-2 text-zinc-400"
                                            >
                                                <span>Undo</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="relative">
                                    <textarea
                                        value={statText}
                                        onChange={(e) => setStatText(e.target.value)}
                                        className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none font-sans"
                                        placeholder="Type, paste, or scan an image to extract text..."
                                    />
                                    {isAILoading && (
                                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-red-500" size={32} />
                                                <span className="text-sm text-zinc-400">AI is thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-bold flex items-center gap-2"><Settings2 className="text-red-500" /> Step 2: Edit Text</h2>

                                <div className="space-y-4 pr-2 pb-12">
                                    <div className="space-y-3">
                                        <label className="text-sm text-zinc-400 flex justify-between">
                                            <span>Font Size</span>
                                            <span className="text-white">{fontSize}px</span>
                                        </label>
                                        <input type="range" min="80" max="250" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-red-500" />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm text-zinc-400 flex justify-between">
                                            <span>Line Height</span>
                                            <span className="text-white">{lineHeight}</span>
                                        </label>
                                        <input type="range" min="1" max="2" step="0.05" value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} className="w-full accent-red-500" />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm text-zinc-400 flex justify-between">
                                            <span>Left Indent (Image & Text)</span>
                                            <span className="text-white">{leftIndent}px</span>
                                        </label>
                                        <input type="range" min="0" max="1000" value={leftIndent} onChange={(e) => setLeftIndent(Number(e.target.value))} className="w-full accent-red-500" />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm text-zinc-400 flex justify-between">
                                            <span>Logo Size (Height)</span>
                                            <span className="text-white">{logoHeight}px</span>
                                        </label>
                                        <input type="range" min="100" max="800" value={logoHeight} onChange={(e) => setLogoHeight(Number(e.target.value))} className="w-full accent-red-500" />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm text-zinc-400 flex justify-between">
                                            <span>Logo Top Padding</span>
                                            <span className="text-white">{logoTopPadding}px</span>
                                        </label>
                                        <input type="range" min="0" max="400" value={logoTopPadding} onChange={(e) => setLogoTopPadding(Number(e.target.value))} className="w-full accent-red-500" />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm text-zinc-400 flex justify-between">
                                            <span>Logo Bottom Padding</span>
                                            <span className="text-white">{logoBottomPadding}px</span>
                                        </label>
                                        <input type="range" min="0" max="400" value={logoBottomPadding} onChange={(e) => setLogoBottomPadding(Number(e.target.value))} className="w-full accent-red-500" />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm text-zinc-400 flex justify-between">
                                            <span>Text Top Padding (Gap)</span>
                                            <span className="text-white">{textTopPadding}px</span>
                                        </label>
                                        <input type="range" min="0" max="400" value={textTopPadding} onChange={(e) => setTextTopPadding(Number(e.target.value))} className="w-full accent-red-500" />
                                    </div>

                                    <button
                                        onClick={saveDefaults}
                                        className="w-full py-3 mt-4 bg-zinc-800 hover:bg-red-600 text-white rounded text-sm transition-colors border border-zinc-700 font-bold"
                                    >
                                        Lock as Default Settings
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-bold flex items-center gap-2"><ImageIcon className="text-red-500" /> Step 3: Add Photo</h2>

                                <div className="space-y-4">
                                    <div className="p-4 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 transition-all group">
                                        <label className="cursor-pointer flex flex-col items-center gap-2 py-4 text-center">
                                            <Upload className="mx-auto h-6 w-6 text-zinc-500 group-hover:text-red-500 transition-colors" />
                                            <span className="text-zinc-400 block mt-2 text-sm">Upload your own photo</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-x-0 top-0 flex items-center gap-2 px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/10 rounded-t-xl">
                                            <Sparkles size={14} className="text-red-500" />
                                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Smart Generator</span>
                                        </div>
                                        <div className="pt-12 p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4 shadow-inner">
                                            <textarea
                                                value={aiImagePrompt}
                                                onChange={(e) => setAiImagePrompt(e.target.value)}
                                                className="w-full bg-transparent border-none p-0 text-sm text-zinc-300 focus:ring-0 resize-none h-20 placeholder:text-zinc-700"
                                                placeholder="Describe your vision... (e.g. 'Epic stadium tunnel walk')"
                                            />
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                                                    <button onClick={() => setAiImageStyle("realistic")} className={`px-3 py-1 text-[10px] rounded-md transition-all ${aiImageStyle === "realistic" ? "bg-red-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>Realistic</button>
                                                    <button onClick={() => setAiImageStyle("cartoon")} className={`px-3 py-1 text-[10px] rounded-md transition-all ${aiImageStyle === "cartoon" ? "bg-red-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>Cartoon</button>
                                                </div>
                                                <button
                                                    onClick={handleAIGenerate}
                                                    disabled={isAILoading || !aiImagePrompt}
                                                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded-lg font-black transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {isAILoading ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                                                    <span>GENERATE</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI RESULT PREVIEW */}
                                    {aiImageResult && (
                                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500" key={genCount}>
                                            <div className="aspect-square bg-black relative group" key={aiImageResult.url}>
                                                <img
                                                    src={aiImageResult.url}
                                                    key={aiImageResult.url} // Force re-render on new URL
                                                    alt="AI Result"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                                                    <p className="text-[10px] text-zinc-400 font-mono line-clamp-2 mb-3">{aiImageResult.prompt}</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handleAIGenerate}
                                                            className="flex-1 bg-zinc-800 text-white py-2 rounded font-black text-xs hover:bg-zinc-700 transition-all"
                                                        >
                                                            REGENERATE
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setPhotoUrl(aiImageResult.url);
                                                                alert("Applied to canvas!");
                                                            }}
                                                            className="flex-1 bg-white text-zinc-950 py-2 rounded font-black text-xs hover:bg-red-600 hover:text-white transition-all shadow-xl"
                                                        >
                                                            APPLY TO GRAPHIC
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {photoUrl && <p className="text-xs text-green-400 flex items-center gap-1 font-bold"><CheckCircle2 size={12} /> Live on Canvas</p>}
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-bold flex items-center gap-2"><Table2 className="text-red-500" /> Step 4: Add Table (Optional)</h2>
                                <p className="text-sm text-zinc-500">Coming soon. Skip this for the text+photo MVP.</p>
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-bold flex items-center gap-2"><Maximize className="text-red-500" /> Step 5: Visuals</h2>

                                <div className="space-y-3">
                                    <label className="text-sm text-zinc-400 flex justify-between">
                                        <span>Photo Zoom</span>
                                        <span className="text-white">{photoZoom}%</span>
                                    </label>
                                    <input type="range" min="100" max="250" value={photoZoom} onChange={(e) => setPhotoZoom(Number(e.target.value))} className="w-full accent-red-500" />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm text-zinc-400 flex justify-between">
                                        <span>Horizontal Pan</span>
                                        <span className="text-white">{photoPanX}px</span>
                                    </label>
                                    <input type="range" min="-1000" max="1000" value={photoPanX} onChange={(e) => setPhotoPanX(Number(e.target.value))} className="w-full accent-red-500" />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm text-zinc-400 flex justify-between">
                                        <span>Vertical Pan (Offset)</span>
                                        <span className="text-white">{photoPanY}px</span>
                                    </label>
                                    <input type="range" min="-1000" max="1000" value={photoPanY} onChange={(e) => setPhotoPanY(Number(e.target.value))} className="w-full accent-red-500" />
                                </div>
                            </div>
                        )}

                        {currentStep === 6 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-bold flex items-center gap-2"><Download className="text-red-500" /> Step 6: Finalize</h2>
                                <p className="text-sm text-zinc-400">Review your graphic on the right. When ready, click export to generate the 4000x5333 JPG.</p>

                                <button
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-lg rounded-xl shadow-[0_0_40px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isExporting ? <span className="animate-pulse">Rendering...</span> : <><Download size={24} /> EXPORT JPG</>}
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* MAIN STAGE PREVIEW (on mobile, this is below) */}
            <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-zinc-950 relative overflow-hidden flex items-center justify-center order-2 md:order-2">

                {/* Render-ready hidden target (Perfect for html2canvas) */}
                <GraphicTemplate containerRef={exportRef} isHidden={true} />

                {/* Canvas visual view */}
                <div className="relative border border-zinc-800 shadow-2xl bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center w-full h-full md:w-[90%] md:h-[95%]">
                    <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded text-xs text-zinc-400 z-50 backdrop-blur-md">
                        Live Preview (Scaled)
                    </div>

                    <div className="flex items-center justify-center w-full h-full overflow-hidden">
                        <GraphicTemplate />
                    </div>
                </div>
            </div>

        </div>
    );
}
