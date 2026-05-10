"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import {
    Type,
    Settings2,
    Image as ImageIcon,
    Maximize,
    Download,
    CheckCircle2,
    Sparkles,
    Scan,
    Loader2,
    Upload,
    Zap,
    Home as HomeIcon,
    Search,
} from "lucide-react";

const INITIAL_STAT = ``;

// Brand colors
const BRAND = {
    navy: "#3b3b6d",
    crimson: "#b42434",
    navyLight: "#4e4e8a",
    navyDark: "#2d2d54",
    crimsonLight: "#d42e40",
    crimsonDark: "#8a1a25",
};

type Step = 0 | 1 | 2 | 3 | 5 | 6;

export default function Home() {
    const [currentStep, setCurrentStep] = useState<Step>(0);
    const [isExporting, setIsExporting] = useState(false);

    // App State
    const [statText, setStatText] = useState(INITIAL_STAT);
    const [prevStatText, setPrevStatText] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState(140);
    const [lineHeight, setLineHeight] = useState(1.4);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [aiImageResult, setAiImageResult] = useState<{ url: string, prompt: string } | null>(null);

    // AI Find Stats state
    const [foundStats, setFoundStats] = useState<{ section: string, text: string, date?: string, source?: string }[]>([]);
    const [isFindingStats, setIsFindingStats] = useState(false);

    const handleFindStats = async () => {
        setIsFindingStats(true);
        try {
            const res = await fetch("/api/ai/find-stats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brand }),
            });
            const data = await res.json();
            if (data.stats) {
                setFoundStats(data.stats);
            } else {
                alert("Failed to find stats. Check console.");
            }
        } catch (e) {
            console.error(e);
            alert("Error finding stats");
        } finally {
            setIsFindingStats(false);
        }
    };

    // AI Image state
    const [aiImagePrompt, setAiImagePrompt] = useState("");
    const [aiRefImage, setAiRefImage] = useState<string | null>(null);
    const [aiRefImageName, setAiRefImageName] = useState<string | null>(null);
    const [aiInputMode, setAiInputMode] = useState<'image' | 'text' | null>(null);
    const [foundImages, setFoundImages] = useState<string[]>([]);
    const [isFindingImages, setIsFindingImages] = useState(false);

    // Layout Engine
    const [leftIndent, setLeftIndent] = useState(160);
    const [logoHeight, setLogoHeight] = useState(360);
    const [logoTopPadding, setLogoTopPadding] = useState(50);
    const [logoBottomPadding, setLogoBottomPadding] = useState(68);
    const [textTopPadding, setTextTopPadding] = useState(0);
    const [textBottomPadding, setTextBottomPadding] = useState(0);
    const [genCount, setGenCount] = useState(0);

    // Brand Engine
    const [brand, setBrand] = useState('wtf-x-logo.jpg');


    // Responsive Scale Engine
    const [previewScale, setPreviewScale] = useState(0.14);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setPreviewScale(0.065);
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
            setLeftIndent(260);
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
                if (d.textBottomPadding !== undefined) setTextBottomPadding(d.textBottomPadding);
                if (d.brand) setBrand(d.brand);
            } catch (e) { }
        }
    }, []);

    const saveDefaults = () => {
        const d = { fontSize, lineHeight, leftIndent, logoHeight, logoTopPadding, logoBottomPadding, textTopPadding, textBottomPadding, brand };
        localStorage.setItem('wtf_layout_defaults', JSON.stringify(d));
        alert('Layout Defaults Locked Successfully!');
    };

    // Step 3 initialization: auto-populate prompt + auto-select input mode
    useEffect(() => {
        if (currentStep === 3) {
            if (!aiImagePrompt) setAiImagePrompt(statText);
            if (!aiRefImage) setAiInputMode('text');
            else if (!aiInputMode) setAiInputMode('image');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep]);

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
                scale: 1,
                useCORS: true,
                backgroundColor: "#ffffff",
            });
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            const fileName = `wtf_stat_${Date.now()}.jpg`;

            // Web Share API — gives iOS native "Save Image" to Camera Roll
            const nav = navigator as Navigator & {
                canShare?: (data?: { files?: File[] }) => boolean;
            };
            if (typeof nav.share === 'function') {
                try {
                    const arr = dataUrl.split(',');
                    const mimeMatch = arr[0].match(/:(.*?);/);
                    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
                    const bstr = atob(arr[1]);
                    let n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    while (n--) u8arr[n] = bstr.charCodeAt(n);
                    const blob = new Blob([u8arr], { type: mime });
                    const file = new File([blob], fileName, { type: 'image/jpeg' });
                    if (nav.canShare && nav.canShare({ files: [file] })) {
                        await nav.share({ files: [file], title: 'WTF Stat' });
                        return;
                    }
                } catch (shareErr) {
                    if ((shareErr as Error).name === 'AbortError') return;
                    // fall through to link download
                }
            }

            // Desktop fallback
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = fileName;
            a.click();
        } catch (err) {
            console.error("Failed to export:", err);
            alert("Failed to export the image. Check console for details.");
        } finally {
            setIsExporting(false);
        }
    };

    const GraphicTemplate = useCallback(({ containerRef, isHidden = false }: { containerRef?: React.RefObject<HTMLDivElement>, isHidden?: boolean }) => (
        <div
            ref={containerRef}
            className={`w-[4000px] h-[5333px] bg-white flex flex-col ${isHidden ? 'fixed -left-[5000px] -top-[5000px]' : ''}`}
            style={{
                transform: !isHidden ? `scale(${previewScale})` : 'none',
                transformOrigin: 'top left',
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
                    paddingTop: `${textTopPadding}px`,
                    paddingBottom: `${textBottomPadding}px`,
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
                            <div className="w-64 h-64 border-8 border-zinc-800 rounded-full animate-spin" style={{ borderTopColor: BRAND.crimson }}></div>
                            <Sparkles className="absolute inset-0 m-auto h-20 w-20 animate-pulse" style={{ color: BRAND.crimson }} />
                        </div>
                        <h3 className="mt-12 text-[120px] font-black italic tracking-tighter text-white animate-bounce">AI GENERATING...</h3>
                        <p className="text-[40px] font-bold uppercase tracking-[1em] mt-4 ml-[1em]" style={{ color: BRAND.crimson }}>Please wait</p>
                    </div>
                )}
            </div>
        </div>
    ), [previewScale, leftIndent, logoTopPadding, logoBottomPadding, brand, logoHeight, fontSize, lineHeight, textTopPadding, textBottomPadding, statText, photoUrl, photoZoom, photoPanX, photoPanY, isGeneratingImage]);

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
                setPrevStatText(statText);
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
                        setPrevStatText(statText);
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

    const handleAIGenerate = async () => {
        if (!aiImagePrompt && !aiRefImage) return;
        setGenCount(prev => prev + 1);
        setIsAILoading(true);
        setIsGeneratingImage(true);
        setAiImageResult(null);
        try {
            const res = await fetch("/api/ai/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: aiImagePrompt,
                    referenceImage: aiRefImage || undefined,
                }),
            });
            const data = await res.json();

            if (data.imageDataUrl) {
                // Native Gemini image generation — true image-to-image result
                setAiImageResult({ url: data.imageDataUrl, prompt: `[gemini-native] Clay transformation` });
            } else if (data.imageUrl || data.generatedPrompt) {
                // Pollinations fallback
                const url = data.imageUrl || `https://image.pollinations.ai/prompt/${encodeURIComponent(data.generatedPrompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
                setAiImageResult({ url, prompt: `[${data.source || "pollinations"}] ${data.generatedPrompt || ""}` });
            } else if (data.error) {
                alert("API ERROR: " + data.error);
            }
        } catch (error: any) {
            console.error("Generate fetch failed", error);
            alert("Generation failed: " + error.message);
        } finally {
            setIsAILoading(false);
            setIsGeneratingImage(false);
        }
    };

    const handleAIRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAiRefImageName(file.name);
        const reader = new FileReader();
        reader.onloadend = () => {
            setAiRefImage(reader.result as string);
            setAiInputMode('image');
        };
        reader.readAsDataURL(file);
    };

    const handleFindImages = async () => {
        if (!statText) return;
        setIsFindingImages(true);
        setFoundImages([]);
        try {
            const res = await fetch("/api/ai/find-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ statText }),
            });
            const data = await res.json();
            if (data.images?.length) {
                setFoundImages(data.images);
            } else {
                alert("Couldn't find images. Try a more specific stat.");
            }
        } catch (e) {
            console.error(e);
            alert("Error finding images");
        } finally {
            setIsFindingImages(false);
        }
    };

    const [isDragOver, setIsDragOver] = useState(false);

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (currentStep !== 3) return;
            const items = e.clipboardData?.items;
            if (!items) return;
            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        setAiRefImageName(file.name || "pasted-image.png");
                        const reader = new FileReader();
                        reader.onloadend = () => setAiRefImage(reader.result as string);
                        reader.readAsDataURL(file);
                        break;
                    }
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [currentStep]);

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
        { id: 0, icon: <HomeIcon size={20} />, label: "Brand" },
        { id: 1, icon: <Type size={20} />, label: "Enter Text" },
        { id: 2, icon: <Settings2 size={20} />, label: "Edit Text" },
        { id: 3, icon: <ImageIcon size={20} />, label: "Add Photo" },
        { id: 5, icon: <Maximize size={20} />, label: "Visuals" },
        { id: 6, icon: <Download size={20} />, label: "Finalize" },
    ];

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden text-white font-sans relative" style={{ background: BRAND.navyDark }}>

            {/* Mobile Header Overlay — tapping logo goes to Step 0 */}
            <div className="md:hidden absolute top-4 left-4 z-50 flex flex-col items-start gap-0">
                <button onClick={() => setCurrentStep(0)} className="flex flex-col items-start gap-0 active:opacity-70">
                    <img src="/wtf-logo-transparent.png" alt="WTF Sports" className="h-10 w-auto object-contain mb-1 drop-shadow-sm" />
                    <h1 className="text-xl font-black italic tracking-tighter drop-shadow-md leading-none">
                        <span style={{ color: BRAND.crimson }}>WTF</span>
                        <span className="text-white">.AI</span>
                    </h1>
                </button>
            </div>

            {/* SIDEBAR WIZARD — order-2 on mobile so preview shows first */}
            <div
                className="w-full md:w-80 border-t md:border-t-0 md:border-r flex flex-col z-10 shadow-2xl order-2 md:order-1 shrink-0 relative h-[50vh] md:h-screen"
                style={{ background: BRAND.navy, borderColor: BRAND.navyLight + '40' }}
            >
                {!hasApiKey && (
                    <div className="text-red-200 text-[10px] p-2 text-center border-b animate-pulse" style={{ background: BRAND.crimsonDark + '80', borderColor: BRAND.crimsonDark }}>
                        ⚠️ GEMINI_API_KEY MISSING
                    </div>
                )}
                {/* Desktop sidebar header — click logo to go back to Step 0 */}
                <div className="p-4 md:p-6 border-b space-y-3 md:space-y-4 hidden md:block" style={{ borderColor: BRAND.navyLight + '40' }}>
                    <button onClick={() => setCurrentStep(0)} className="flex flex-col items-start text-left hover:opacity-80 transition-opacity active:opacity-60">
                        <img src="/wtf-logo-transparent.png" alt="WTF Sports" className="h-12 w-auto object-contain mb-1 drop-shadow-sm" />
                        <h1 className="text-xl md:text-2xl font-black italic tracking-tighter leading-none mt-1">
                            <span style={{ color: BRAND.crimson }}>WTF</span>
                            <span className="text-white">.AI</span>
                        </h1>
                        <p className="text-[10px] md:text-sm md:mt-1 hidden md:block" style={{ color: BRAND.navyLight }}>Sports Stats Engine</p>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-4 space-y-4 md:space-y-6 pb-10">

                    {/* Step Navigation — hidden on Step 0 brand picker */}
                    {currentStep !== 0 && (
                        <nav className="flex space-x-1 border-b pb-3 sticky top-0 z-50" style={{ borderColor: BRAND.navyLight + '40', background: BRAND.navy }}>
                            {steps.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setCurrentStep(s.id as Step)}
                                    className={`flex-1 flex justify-center py-2 rounded-md transition-all duration-200 ${currentStep === s.id
                                        ? "text-white shadow-lg"
                                        : "hover:text-white"
                                        }`}
                                    style={currentStep === s.id
                                        ? { background: BRAND.crimson, boxShadow: `0 4px 14px ${BRAND.crimson}50` }
                                        : { color: BRAND.navyLight }
                                    }
                                    title={s.label}
                                >
                                    {s.icon}
                                </button>
                            ))}
                        </nav>
                    )}

                    {/* ACTIVE TOOL PANEL */}
                    <div className="space-y-6 pb-20 md:pb-0">

                        {/* ── STEP 0: BRAND HOME ── */}
                        {currentStep === 0 && (
                            <div className="space-y-3 animate-in fade-in duration-300 pt-1">
                                <div className="text-center pb-2">
                                    <h2 className="text-lg font-black italic tracking-tight">
                                        <span style={{ color: BRAND.crimson }}>SELECT</span>
                                        <span className="text-white"> BRAND</span>
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { file: 'wtf-x-logo.jpg', label: 'WTF Stats' },
                                        { file: 'bets-x-logo.jpg', label: 'WTF Bets' },
                                        { file: 'vfl-x-logo.jpg', label: 'VFL' },
                                        { file: 'pod-x-logo.jpg', label: 'Willing To Fail' },
                                    ].map((b) => (
                                        <button
                                            key={b.file}
                                            onClick={() => { setBrand(b.file); setCurrentStep(1); }}
                                            className="flex items-center justify-center p-4 rounded-xl border-2 transition-all active:scale-95 bg-white"
                                            style={{ borderColor: brand === b.file ? BRAND.crimson : 'transparent' }}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = BRAND.crimson}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = brand === b.file ? BRAND.crimson : 'transparent'}
                                        >
                                            <img
                                                src={`/${b.file}`}
                                                alt={b.label}
                                                className="w-full h-12 object-contain"
                                                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-bold flex items-center gap-2"><Type style={{ color: BRAND.crimson }} /> Step 1: Enter Stat</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {(brand === 'wtf-x-logo.jpg' || brand === 'bets-x-logo.jpg') && (
                                            <button
                                                onClick={handleFindStats}
                                                disabled={isFindingStats}
                                                className="border p-2 rounded-lg transition-all text-xs flex items-center gap-2 disabled:opacity-40"
                                                style={{ background: BRAND.crimson, borderColor: BRAND.crimsonDark }}
                                            >
                                                {isFindingStats ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                                                <span className="font-bold">Find Stats</span>
                                            </button>
                                        )}
                                        {(brand === 'wtf-x-logo.jpg' || brand === 'bets-x-logo.jpg') && (
                                            <button
                                                onClick={handleAIReword}
                                                disabled={isAILoading || !statText}
                                                className="border p-2 rounded-lg transition-all text-xs flex items-center gap-2 disabled:opacity-40"
                                                style={{ background: BRAND.navyDark, borderColor: BRAND.navyLight + '40' }}
                                            >
                                                {isAILoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} style={{ color: BRAND.crimson }} />}
                                                <span>WTF Style</span>
                                            </button>
                                        )}
                                        {prevStatText && (
                                            <button
                                                onClick={() => {
                                                    const current = statText;
                                                    setStatText(prevStatText);
                                                    setPrevStatText(current);
                                                }}
                                                className="border p-2 rounded-lg transition-all text-xs flex items-center gap-2"
                                                style={{ background: BRAND.navyDark, borderColor: BRAND.navyLight + '40', color: BRAND.navyLight }}
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
                                        className="w-full h-32 border rounded-lg p-3 text-zinc-300 focus:outline-none transition-all resize-none font-sans text-sm"
                                        style={{
                                            background: BRAND.navyDark,
                                            borderColor: BRAND.navyLight + '40',
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = BRAND.crimson}
                                        onBlur={(e) => e.currentTarget.style.borderColor = BRAND.navyLight + '40'}
                                        placeholder="Type or paste text from found stat below..."
                                    />
                                    {isAILoading && (
                                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="animate-spin" size={32} style={{ color: BRAND.crimson }} />
                                                <span className="text-sm" style={{ color: BRAND.navyLight }}>AI is thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {foundStats.length > 0 && (
                                    <div className="mt-4 space-y-4">
                                        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: BRAND.navyLight }}>
                                            <Zap size={14} style={{ color: BRAND.crimson }} />
                                            Generated Stats
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                            {foundStats.map((stat, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setStatText(stat.text)}
                                                    className="text-left p-3 rounded-lg border transition-all text-xs hover:scale-[1.02] active:scale-95 flex flex-col gap-1"
                                                    style={{ background: BRAND.navyDark, borderColor: BRAND.navyLight + '40' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = BRAND.crimson}
                                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = BRAND.navyLight + '40'}
                                                >
                                                    <div className="flex justify-between items-center w-full">
                                                        <span className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-1" style={{ color: BRAND.crimson }}>
                                                            {stat.section}
                                                            {stat.date && <span className="text-zinc-500 font-normal normal-case tracking-normal"> - {stat.date}</span>}
                                                        </span>
                                                        {stat.source && <span className="text-[9px] text-zinc-500 font-normal tracking-wide">{stat.source}</span>}
                                                    </div>
                                                    <span className="text-zinc-200 leading-snug">{stat.text}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-bold flex items-center gap-2"><Settings2 style={{ color: BRAND.crimson }} /> Step 2: Edit Text</h2>

                                <div className="space-y-4 pr-2 pb-12">
                                    {[
                                        { label: "Font Size", value: fontSize, setter: setFontSize, min: 80, max: 250, unit: "px" },
                                        { label: "Line Height", value: lineHeight, setter: setLineHeight, min: 1, max: 2, step: 0.05, unit: "" },
                                        { label: "Left Indent (Image & Text)", value: leftIndent, setter: setLeftIndent, min: 0, max: 1000, unit: "px" },
                                        { label: "Logo Size (Height)", value: logoHeight, setter: setLogoHeight, min: 100, max: 800, unit: "px" },
                                        { label: "Logo Top Padding", value: logoTopPadding, setter: setLogoTopPadding, min: 0, max: 400, unit: "px" },
                                        { label: "Logo Bottom Padding", value: logoBottomPadding, setter: setLogoBottomPadding, min: 0, max: 400, unit: "px" },
                                        { label: "Text Top Padding", value: textTopPadding, setter: setTextTopPadding, min: 0, max: 400, unit: "px" },
                                        { label: "Text Bottom Padding", value: textBottomPadding, setter: setTextBottomPadding, min: 0, max: 400, unit: "px" },
                                    ].map((control) => (
                                        <div key={control.label} className="space-y-3">
                                            <label className="text-sm flex justify-between" style={{ color: BRAND.navyLight }}>
                                                <span>{control.label}</span>
                                                <span className="text-white">{control.value}{control.unit}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min={control.min}
                                                max={control.max}
                                                step={control.step || 1}
                                                value={control.value}
                                                onChange={(e) => control.setter(Number(e.target.value))}
                                                className="w-full"
                                                style={{ accentColor: BRAND.crimson }}
                                            />
                                        </div>
                                    ))}

                                    <button
                                        onClick={saveDefaults}
                                        className="w-full py-3 mt-4 text-white rounded text-sm transition-all border font-bold hover:opacity-90"
                                        style={{ background: BRAND.navyDark, borderColor: BRAND.navyLight + '40' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = BRAND.crimson; e.currentTarget.style.borderColor = BRAND.crimson; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = BRAND.navyDark; e.currentTarget.style.borderColor = BRAND.navyLight + '40'; }}
                                    >
                                        Lock as Default Settings
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-bold flex items-center gap-2"><ImageIcon style={{ color: BRAND.crimson }} /> Step 3: Add Photo</h2>

                                {/* INPUT SOURCE SELECTION */}
                                <div className="space-y-2">
                                    {/* Stat Text radio */}
                                    <label className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all" style={{ borderColor: aiInputMode === 'text' ? BRAND.crimson : BRAND.navyLight + '40', background: aiInputMode === 'text' ? BRAND.crimson + '18' : BRAND.navyDark }}>
                                        <input type="radio" name="aiInputMode" checked={aiInputMode === 'text'} onChange={() => setAiInputMode('text')} style={{ accentColor: BRAND.crimson, width: 16, height: 16, flexShrink: 0 }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white">Stat Text</p>
                                            <p className="text-[10px] text-zinc-400 truncate">{statText || 'No stat entered yet'}</p>
                                        </div>
                                    </label>
                                    {/* Photo radio or upload button */}
                                    {aiRefImage ? (
                                        <label className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all" style={{ borderColor: aiInputMode === 'image' ? BRAND.crimson : BRAND.navyLight + '40', background: aiInputMode === 'image' ? BRAND.crimson + '18' : BRAND.navyDark }}>
                                            <input type="radio" name="aiInputMode" checked={aiInputMode === 'image'} onChange={() => setAiInputMode('image')} style={{ accentColor: BRAND.crimson, width: 16, height: 16, flexShrink: 0 }} />
                                            <img src={aiRefImage} alt="Ref" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-white truncate">{aiRefImageName}</p>
                                                <button onClick={(e) => { e.preventDefault(); setAiRefImage(null); setAiRefImageName(null); setAiInputMode('text'); }} className="text-[10px] hover:text-white transition-colors" style={{ color: BRAND.navyLight }}>Clear photo</button>
                                            </div>
                                        </label>
                                    ) : (
                                        <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all" style={{ borderColor: isDragOver ? BRAND.crimson : BRAND.navyLight + '60', background: isDragOver ? BRAND.crimson + '10' : 'transparent' }} onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const file = e.dataTransfer.files?.[0]; if (file && file.type.startsWith('image/')) { setAiRefImageName(file.name); const reader = new FileReader(); reader.onloadend = () => { setAiRefImage(reader.result as string); setAiInputMode('image'); }; reader.readAsDataURL(file); } }}>
                                            <Upload size={20} style={{ color: BRAND.crimson }} className="flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-white">Upload a Photo</p>
                                                <p className="text-[10px]" style={{ color: BRAND.navyLight }}>JPG, PNG — drag &amp; drop or tap</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleAIRefImageUpload} />
                                        </label>
                                    )}
                                </div>


                                {/* Optional extra prompt when text mode active */}
                                {aiInputMode === 'text' && (
                                    <textarea
                                        value={aiImagePrompt}
                                        onChange={(e) => setAiImagePrompt(e.target.value)}
                                        className="w-full border rounded-lg p-3 text-sm text-zinc-300 focus:outline-none resize-none h-14"
                                        style={{ background: BRAND.navyDark, borderColor: BRAND.navyLight + '40' }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = BRAND.crimson}
                                        onBlur={(e) => e.currentTarget.style.borderColor = BRAND.navyLight + '40'}
                                        placeholder="Add extra details... (optional)"
                                    />
                                )}

                                {/* 3 Action Buttons */}
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={handleFindImages}
                                        disabled={isFindingImages || !statText}
                                        className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg border text-xs font-bold transition-all active:scale-95 disabled:opacity-40"
                                        style={{ background: BRAND.navyDark, borderColor: BRAND.navyLight + '40', color: 'white' }}
                                    >
                                        {isFindingImages ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} style={{ color: BRAND.crimson }} />}
                                        <span>FIND IMAGE</span>
                                    </button>
                                    <button
                                        onClick={() => { if (aiRefImage) setPhotoUrl(aiRefImage); }}
                                        disabled={!aiRefImage}
                                        className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg border text-xs font-bold transition-all active:scale-95 disabled:opacity-40"
                                        style={{ background: BRAND.navyDark, borderColor: aiRefImage ? BRAND.crimson : BRAND.navyLight + '40', color: aiRefImage ? 'white' : BRAND.navyLight }}
                                    >
                                        <Upload size={16} style={{ color: aiRefImage ? BRAND.crimson : BRAND.navyLight }} />
                                        <span>USE PHOTO</span>
                                    </button>
                                    <button
                                        onClick={handleAIGenerate}
                                        disabled={isAILoading || !aiInputMode}
                                        className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-40"
                                        style={{ background: aiInputMode ? BRAND.crimson : BRAND.navyLight }}
                                    >
                                        {isAILoading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                                        <span>AI IMAGE</span>
                                    </button>
                                </div>

                                {/* Found Images Grid */}
                                {foundImages.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BRAND.navyLight }}>Found Images — tap to select</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {foundImages.map((url, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => { setAiRefImage(url); setAiRefImageName(`Found Image ${i + 1}`); setAiInputMode('image'); }}
                                                    className="aspect-square rounded-lg overflow-hidden border-2 transition-all active:scale-95"
                                                    style={{ borderColor: aiRefImage === url ? BRAND.crimson : 'transparent' }}
                                                >
                                                    <img src={url} alt={`Found ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}


                                    {aiImageResult && (
                                        <div className="border rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500" style={{ background: BRAND.navyDark, borderColor: BRAND.navyLight + '40' }} key={genCount}>
                                            <div className="aspect-square bg-black relative group" key={aiImageResult.url}>
                                                <img
                                                    src={aiImageResult.url}
                                                    key={aiImageResult.url}
                                                    alt="AI Result"
                                                    onLoad={(e) => {
                                                        e.currentTarget.style.opacity = "1";
                                                        const spinner = e.currentTarget.nextElementSibling as HTMLElement;
                                                        if (spinner) spinner.style.display = "none";
                                                    }}
                                                    onError={(e) => {
                                                        const spinner = e.currentTarget.nextElementSibling as HTMLElement;
                                                        if (spinner) spinner.innerHTML = '<p style="color:#ef4444;font-size:12px;font-weight:bold">Failed to load. Try regenerating.</p>';
                                                    }}
                                                    style={{ opacity: 0 }}
                                                    className="w-full h-full object-cover transition-opacity duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <Loader2 className="animate-spin opacity-50" size={32} style={{ color: BRAND.crimson }} />
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                                                    <p className="text-[10px] text-zinc-400 font-mono line-clamp-2 mb-3">{aiImageResult.prompt}</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handleAIGenerate}
                                                            className="flex-1 text-white py-2 rounded font-black text-xs transition-all"
                                                            style={{ background: BRAND.navyDark }}
                                                        >
                                                            REGENERATE
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setPhotoUrl(aiImageResult.url);
                                                                alert("Applied to canvas!");
                                                            }}
                                                            className="flex-1 py-2 rounded font-black text-xs transition-all shadow-xl"
                                                            style={{ background: '#fff', color: BRAND.navyDark }}
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
                        )}



                        {currentStep === 5 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-bold flex items-center gap-2"><Maximize style={{ color: BRAND.crimson }} /> Step 5: Visuals</h2>

                                {[
                                    { label: "Photo Zoom", value: photoZoom, setter: setPhotoZoom, min: 100, max: 500, unit: "%" },
                                    { label: "Horizontal Pan", value: photoPanX, setter: setPhotoPanX, min: -1000, max: 1000, unit: "px" },
                                    { label: "Vertical Pan (Offset)", value: photoPanY, setter: setPhotoPanY, min: -1000, max: 1000, unit: "px" },
                                ].map((control) => (
                                    <div key={control.label} className="space-y-3">
                                        <label className="text-sm flex justify-between" style={{ color: BRAND.navyLight }}>
                                            <span>{control.label}</span>
                                            <span className="text-white">{control.value}{control.unit}</span>
                                        </label>
                                        <input
                                            type="range"
                                            min={control.min}
                                            max={control.max}
                                            value={control.value}
                                            onChange={(e) => control.setter(Number(e.target.value))}
                                            className="w-full"
                                            style={{ accentColor: BRAND.crimson }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {currentStep === 6 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-bold flex items-center gap-2"><Download style={{ color: BRAND.crimson }} /> Step 6: Finalize</h2>
                                <p className="text-sm" style={{ color: BRAND.navyLight }}>Review your graphic on the right. When ready, click export to generate the 4000x5333 JPG.</p>

                                <button
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="w-full py-4 text-white font-black text-lg rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    style={{
                                        background: BRAND.crimson,
                                        boxShadow: `0 0 40px ${BRAND.crimson}50`,
                                    }}
                                >
                                    {isExporting ? <span className="animate-pulse">Rendering...</span> : <><Download size={24} /> EXPORT JPG</>}
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* MAIN STAGE PREVIEW — fixed 50vh on mobile, flex-1 on desktop */}
            <div
                className="w-full h-[50vh] md:h-screen md:flex-1 relative flex items-center justify-center order-1 md:order-2 shrink-0"
                style={{ background: `linear-gradient(135deg, ${BRAND.navyDark} 0%, #1a1a2e 100%)` }}
            >

                {/* Render-ready hidden target (Perfect for html2canvas) */}
                <GraphicTemplate containerRef={exportRef} isHidden={true} />

                {/* Canvas visual view — overflow-hidden wrapper prevents 4000px layout bleed */}
                <div
                    style={{
                        width: `${4000 * previewScale}px`,
                        height: `${5333 * previewScale}px`,
                        overflow: 'hidden',
                        position: 'relative',
                        flexShrink: 0,
                    }}
                >
                    <GraphicTemplate />
                </div>
            </div>

        </div>
    );
}
