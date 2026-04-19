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
    BadgeCheck
} from "lucide-react";

const INITIAL_STAT = `Victor Wembanyama has faced 547 different players in his NBA career so far.

He's blocked 49.9% (273/547) of them.`;

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function Home() {
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [isExporting, setIsExporting] = useState(false);

    // App State
    const [statText, setStatText] = useState(INITIAL_STAT);
    const [fontSize, setFontSize] = useState(140);
    const [lineHeight, setLineHeight] = useState(1.4);

    // Layout Engine
    const [leftIndent, setLeftIndent] = useState(160);
    const [logoHeight, setLogoHeight] = useState(360);
    const [logoTopPadding, setLogoTopPadding] = useState(50);
    const [logoBottomPadding, setLogoBottomPadding] = useState(25);
    const [textTopPadding, setTextTopPadding] = useState(0);

    // Brand Engine
    const [brand, setBrand] = useState('wtf-x-logo.jpg');

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

    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [photoZoom, setPhotoZoom] = useState(100);
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

            const image = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = image;
            a.download = `wtf_stat_${Date.now()}.png`;
            a.click();
        } catch (err) {
            console.error("Failed to export:", err);
            alert("Failed to export the image. Check console for details.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPhotoUrl(url);
        }
    };

    const steps = [
        { id: 1, icon: <Type size={20} />, label: "Stat" },
        { id: 2, icon: <Settings2 size={20} />, label: "Edit Text" },
        { id: 3, icon: <ImageIcon size={20} />, label: "Add Photo" },
        { id: 4, icon: <Table2 size={20} />, label: "Add Table" },
        { id: 5, icon: <Maximize size={20} />, label: "Visuals" },
        { id: 6, icon: <Download size={20} />, label: "Finalize" },
    ];

    return (
        <div className="flex h-screen bg-zinc-950 text-white font-sans overflow-hidden">

            {/* SIDEBAR WIZARD */}
            <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col z-10 shadow-2xl">
                <div className="p-6 border-b border-zinc-800 space-y-4">
                    <div>
                        <h1 className="text-2xl font-black italic tracking-tighter">WTF.AI</h1>
                        <p className="text-zinc-500 text-sm mt-1">IG Generator Engine</p>
                    </div>

                    {/* Fully Unlocked Brand Selector */}
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
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

                <div className="flex-1 overflow-y-auto p-4 space-y-8">

                    {/* Step Navigation */}
                    <nav className="flex space-x-1 border-b border-zinc-800 pb-4">
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
                    <div className="space-y-6">

                        {currentStep === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-bold flex items-center gap-2"><Type className="text-red-500" /> Step 1: The Stat</h2>
                                <textarea
                                    value={statText}
                                    onChange={(e) => setStatText(e.target.value)}
                                    className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
                                    placeholder="Paste your WTF stat here..."
                                />
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-bold flex items-center gap-2"><Settings2 className="text-red-500" /> Step 2: Edit Text</h2>

                                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 pb-8">
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
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-bold flex items-center gap-2"><ImageIcon className="text-red-500" /> Step 3: Add Photo</h2>
                                <div className="border-2 border-dashed border-zinc-700 hover:border-red-500 bg-zinc-950 rounded-xl p-8 text-center transition-colors cursor-pointer relative">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <ImageIcon className="mx-auto h-8 w-8 text-zinc-500 mb-3" />
                                    <p className="text-sm text-zinc-400">Click or drag an image here</p>
                                </div>
                                {photoUrl && <p className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 size={12} /> Photo loaded</p>}
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
                                <p className="text-sm text-zinc-400">Review your graphic on the right. When ready, click export to generate the 4000x5333 PNG.</p>

                                <button
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-lg rounded-xl shadow-[0_0_40px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isExporting ? <span className="animate-pulse">Rendering...</span> : <><Download size={24} /> EXPORT PNG</>}
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* MAIN STAGE PREVIEW */}
            <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-zinc-950 relative overflow-hidden flex items-center justify-center">

                {/* Canvas that holds the 4000x5333 exact node, but visually scaled down to fit */}
                {/* Magic scale formula: 800px tall preview view -> 800 / 5333 = 0.15 scale */}
                <div className="relative border border-zinc-800 shadow-2xl bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center w-[90%] h-[95%]">

                    <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded text-xs text-zinc-400 z-50 backdrop-blur-md">
                        Live Preview (Scaled)
                    </div>

                    <div
                        id="export-mount"
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{
                            transform: 'translate(-50%, -50%) scale(0.14)',
                            width: '4000px',
                            height: '5333px'
                        }}
                    >

                        {/* THE ACTUAL HIGH RES RENDER TARGET */}
                        <div
                            ref={exportRef}
                            className="w-[4000px] h-[5333px] bg-white flex flex-col"
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
                            {/* Note: In HTML, whitespace-pre-wrap allows newlines from textarea to render */}
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
                                    <div
                                        className="absolute inset-0 bg-zinc-200"
                                        style={{
                                            backgroundImage: `url(${photoUrl})`,
                                            backgroundSize: `${photoZoom}%`,
                                            backgroundPosition: `center calc(50% + ${photoPanY}px)`,
                                            backgroundRepeat: 'no-repeat',
                                        }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-zinc-100 flex items-center justify-center border-t-[4px] border-zinc-200">
                                        <p className="text-zinc-400 text-[80px]">No media selected</p>
                                    </div>
                                )}
                            </div>

                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
