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

const proxyUrl = (url: string) => `/api/proxy-image?url=${encodeURIComponent(url)}`;

const TODAY = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const PROMPT_WTF_BETS = `### ROLE: ODDSSHARK TREND RESEARCHER FOR "WTF BETS" ###
Today's date is ${TODAY}. You MUST navigate to oddsshark.com/mlb/trends and find the most lopsided betting trends for MLB games scheduled TODAY (${TODAY}) or tomorrow ONLY.

### MANDATORY COMPLIANCE RULES ###
1. ONLY MLB: We are in MLB season. Do NOT include NBA (season is over), NFL (off-season), or any other sport.
2. ACTIVE GAMES ONLY: Every single trend MUST be for a team that has a game scheduled TODAY or TOMORROW. Verify the team is playing.
3. EXACT DATES: Use the exact game date (e.g. "May 10, 2026"). NEVER say "Tonight" or "Today".
4. HIGHEST RATIOS: Find the most extreme/lopsided trends. Prefer 15+ game samples (e.g. 18-4, 21-3).
5. NO BRACKETS: Do NOT prefix stats with [MLB] or any sport tag.
6. CATEGORY MIX (8 slots):
   - 2x OVER trends (highest ratios)
   - 2x UNDER trends (highest ratios)  
   - 2x ATS/Runline trends (highest ratios)
   - 2x ANY remaining extreme trends (NO "SU" unless 15-0+)
7. VERIFY ON ODDSSHARK: Every trend must come from oddsshark.com/mlb/trends. Cross-check that the team is playing.

### OUTPUT ###
Return exactly 8 stats as a pure JSON array. No markdown, no extra text. Each object:
- "section": "WTF Bets"
- "date": Exact game date (e.g. "${TODAY}")
- "source": "OddsShark"
- "text": The full trend string. No source or sport tags in the text.`;

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

const MLB_TEAMS = [
    { abbr: "ari", name: "D-backs" },
    { abbr: "atl", name: "Braves" },
    { abbr: "bal", name: "Orioles" },
    { abbr: "bos", name: "Red Sox" },
    { abbr: "chw", name: "White Sox" },
    { abbr: "chc", name: "Cubs" },
    { abbr: "cin", name: "Reds" },
    { abbr: "cle", name: "Guardians" },
    { abbr: "col", name: "Rockies" },
    { abbr: "det", name: "Tigers" },
    { abbr: "hou", name: "Astros" },
    { abbr: "kc", name: "Royals" },
    { abbr: "laa", name: "Angels" },
    { abbr: "lad", name: "Dodgers" },
    { abbr: "mia", name: "Marlins" },
    { abbr: "mil", name: "Brewers" },
    { abbr: "min", name: "Twins" },
    { abbr: "nyy", name: "Yankees" },
    { abbr: "nym", name: "Mets" },
    { abbr: "oak", name: "Athletics" },
    { abbr: "phi", name: "Phillies" },
    { abbr: "pit", name: "Pirates" },
    { abbr: "sd", name: "Padres" },
    { abbr: "sf", name: "Giants" },
    { abbr: "sea", name: "Mariners" },
    { abbr: "stl", name: "Cardinals" },
    { abbr: "tb", name: "Rays" },
    { abbr: "tex", name: "Rangers" },
    { abbr: "tor", name: "Blue Jays" },
    { abbr: "wsh", name: "Nationals" }
];

type Step = 0 | 1 | 2 | 3 | 5 | 6;

export default function Home() {
    const [currentStep, setCurrentStep] = useState<Step>(0);
    const [isExporting, setIsExporting] = useState(false);

    // Matchup Overlay State
    const [showMatchupOverlay, setShowMatchupOverlay] = useState(false);
    const [matchupLeague, setMatchupLeague] = useState("MLB");
    const [matchupTime, setMatchupTime] = useState("Today, 6:10 PM EST");
    const [awayTeamAbbr, setAwayTeamAbbr] = useState("");
    const [awayTeamName, setAwayTeamName] = useState("");
    const [awayTeamRecord, setAwayTeamRecord] = useState("");
    const [awayMl, setAwayMl] = useState("");
    const [awayRl, setAwayRl] = useState("");
    const [homeTeamAbbr, setHomeTeamAbbr] = useState("");
    const [homeTeamName, setHomeTeamName] = useState("");
    const [homeTeamRecord, setHomeTeamRecord] = useState("");
    const [homeMl, setHomeMl] = useState("");
    const [homeRl, setHomeRl] = useState("");
    const [isSearchingMatchup, setIsSearchingMatchup] = useState(false);

    const handleMatchupSearch = async (text: string) => {
        if (!text || brand !== 'bets-x-logo.jpg') return;
        setIsSearchingMatchup(true);
        try {
            const res = await fetch("/api/ai/matchup-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ statText: text }),
            });
            const data = await res.json();
            if (data.success && data.matchup) {
                const m = data.matchup;
                setShowMatchupOverlay(true);
                if (m.league) setMatchupLeague(m.league);
                if (m.time) setMatchupTime(m.time);
                if (m.awayTeam) {
                    if (m.awayTeam.abbr) setAwayTeamAbbr(m.awayTeam.abbr);
                    if (m.awayTeam.name) setAwayTeamName(m.awayTeam.name);
                    if (m.awayTeam.record) setAwayTeamRecord(m.awayTeam.record);
                    if (m.awayTeam.ml) setAwayMl(m.awayTeam.ml);
                    if (m.awayTeam.rl) setAwayRl(m.awayTeam.rl);
                }
                if (m.homeTeam) {
                    if (m.homeTeam.abbr) setHomeTeamAbbr(m.homeTeam.abbr);
                    if (m.homeTeam.name) setHomeTeamName(m.homeTeam.name);
                    if (m.homeTeam.record) setHomeTeamRecord(m.homeTeam.record);
                    if (m.homeTeam.ml) setHomeMl(m.homeTeam.ml);
                    if (m.homeTeam.rl) setHomeRl(m.homeTeam.rl);
                }
            }
        } catch (e: any) {
            console.error("Matchup search error:", e);
        } finally {
            setIsSearchingMatchup(false);
        }
    };

    // Stat Context Overlay State
    const [showStatContextOverlay, setShowStatContextOverlay] = useState(false);
    const [statContextData, setStatContextData] = useState<any>(null);
    const [isSearchingStatContext, setIsSearchingStatContext] = useState(false);
    const [statContextScale, setStatContextScale] = useState(100);
    const [statContextPanY, setStatContextPanY] = useState(200);
    const [isStatContextLocked, setIsStatContextLocked] = useState(false);
    const [isEditingStatContext, setIsEditingStatContext] = useState(false);
    const [statContextJsonStr, setStatContextJsonStr] = useState("");

    const handleStatContextSearch = async (text: string, force = false) => {
        if (!text || brand !== 'wtf-x-logo.jpg') return;
        if (isStatContextLocked && !force) return;
        setIsSearchingStatContext(true);
        try {
            const res = await fetch("/api/ai/stat-context", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ statText: text }),
            });
            const data = await res.json();
            if (data.success && data.context) {
                setStatContextData(data.context);
                setShowStatContextOverlay(true);
            }
        } catch (e: any) {
            console.error("Stat context search error:", e);
        } finally {
            setIsSearchingStatContext(false);
        }
    };

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
            } else if (data.error) {
                alert("API Error: " + data.error);
            } else {
                alert("Failed to find stats. Check console.");
            }
        } catch (e: any) {
            console.error(e);
            alert("Error finding stats: " + (e.message || e));
        } finally {
            setIsFindingStats(false);
        }
    };

    const handleClearAll = () => {
        setStatText("");
        setPhotoUrl(null);
        setAiImagePrompt("");
        setAiImageResult(null);
        setAiRefImage(null);
        setAiRefImageName(null);
        setStatContextData(null);
        setShowStatContextOverlay(false);
        setStatContextScale(100);
        setStatContextPanY(200);
        setIsStatContextLocked(false);
        setIsEditingStatContext(false);
        setShowMatchupOverlay(false);
        setFoundStats([]);
        setFoundImages([]);
        setPrevStatText(null);
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
            setLineHeight(1.45);
            setLeftIndent(140);
            setLogoHeight(260);
            setLogoTopPadding(42);
            setLogoBottomPadding(68);
            setTextTopPadding(0);
        } else if (brand === 'bets-x-logo.jpg') {
            setFontSize(140);
            setLineHeight(1.45);
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
            
            // Only trigger native share sheet on mobile devices. Desktop (Mac) should force download.
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile && typeof nav.share === 'function') {
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
                        setIsExporting(false);
                        return;
                    }
                } catch (shareErr) {
                    if ((shareErr as Error).name === 'AbortError') {
                        setIsExporting(false);
                        return;
                    }
                    // fall through to link download
                }
            }

            // Desktop fallback (direct download)
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
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
                        src={photoUrl.startsWith('blob:') || photoUrl.startsWith('data:') ? photoUrl : proxyUrl(photoUrl)}
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

                {/* Matchup Overlay Card */}
                {showMatchupOverlay && (
                    <div 
                        className="absolute bottom-[200px] left-1/2 -translate-x-1/2 w-[2600px] rounded-[80px] p-[100px] pb-[80px] border-[12px] border-white/10 shadow-2xl text-white flex flex-col gap-[50px] z-30 font-sans"
                        style={{ backgroundColor: 'rgba(28, 28, 36, 0.95)' }}
                    >
                        {/* Header: MLB · Today, 6:10 PM */}
                        <div className="text-[70px] font-semibold text-white/50 tracking-wider uppercase text-center">
                            {matchupLeague} &middot; {matchupTime}
                        </div>

                        {/* Teams Row: Logos, Names, Records */}
                        <div className="flex items-center justify-between w-full px-[60px]">
                            {/* Away Team */}
                            <div className="flex flex-col items-center gap-[20px] w-[900px]">
                                {awayTeamAbbr ? (
                                    <img
                                        src={`https://a.espncdn.com/i/teamlogos/mlb/500/scoreboard/${awayTeamAbbr.toLowerCase()}.png`}
                                        alt="Away Logo"
                                        className="w-[320px] h-[320px] object-contain"
                                        crossOrigin="anonymous"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-[320px] h-[320px] bg-white/5 rounded-full flex items-center justify-center text-[100px] font-black text-white/20">A</div>
                                )}
                                <div className="text-[90px] font-black uppercase tracking-tight leading-none text-center w-full px-[20px]">{awayTeamName || 'Away'}</div>
                                {awayTeamRecord && (
                                    <div className="text-[55px] font-bold text-white/40 tracking-wider">({awayTeamRecord})</div>
                                )}
                            </div>

                            {/* "at" badge */}
                            <div className="text-[80px] font-medium italic text-white/30 lowercase">at</div>

                            {/* Home Team */}
                            <div className="flex flex-col items-center gap-[20px] w-[900px]">
                                {homeTeamAbbr ? (
                                    <img
                                        src={`https://a.espncdn.com/i/teamlogos/mlb/500/scoreboard/${homeTeamAbbr.toLowerCase()}.png`}
                                        alt="Home Logo"
                                        className="w-[320px] h-[320px] object-contain"
                                        crossOrigin="anonymous"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-[320px] h-[320px] bg-white/5 rounded-full flex items-center justify-center text-[100px] font-black text-white/20">H</div>
                                )}
                                <div className="text-[90px] font-black uppercase tracking-tight leading-none text-center w-full px-[20px]">{homeTeamName || 'Home'}</div>
                                {homeTeamRecord && (
                                    <div className="text-[55px] font-bold text-white/40 tracking-wider">({homeTeamRecord})</div>
                                )}
                            </div>
                        </div>

                        {/* Odds Bar — dedicated bottom section */}
                        {(awayMl || homeMl || awayRl || homeRl) && (
                            <div className="w-full bg-white/5 rounded-[50px] border border-white/10 px-[80px] py-[60px]">
                                <div className="flex items-stretch justify-between w-full">
                                    {/* Away Odds */}
                                    <div className="flex flex-col items-center gap-[25px] w-[900px]">
                                        {awayMl && (
                                            <div className="flex items-center gap-[30px]">
                                                <span className="text-[48px] font-bold text-white/40 uppercase tracking-widest">ML</span>
                                                <span className="text-[80px] font-black tracking-tight text-[#58a6ff]">{awayMl}</span>
                                            </div>
                                        )}
                                        {awayRl && (
                                            <div className="flex items-center gap-[30px]">
                                                <span className="text-[48px] font-bold text-white/40 uppercase tracking-widest">RL</span>
                                                <span className="text-[68px] font-bold text-white/70 tracking-tight">{awayRl}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div className="w-[4px] bg-white/10 rounded-full mx-[40px]"></div>

                                    {/* Home Odds */}
                                    <div className="flex flex-col items-center gap-[25px] w-[900px]">
                                        {homeMl && (
                                            <div className="flex items-center gap-[30px]">
                                                <span className="text-[48px] font-bold text-white/40 uppercase tracking-widest">ML</span>
                                                <span className="text-[80px] font-black tracking-tight text-[#58a6ff]">{homeMl}</span>
                                            </div>
                                        )}
                                        {homeRl && (
                                            <div className="flex items-center gap-[30px]">
                                                <span className="text-[48px] font-bold text-white/40 uppercase tracking-widest">RL</span>
                                                <span className="text-[68px] font-bold text-white/70 tracking-tight">{homeRl}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Stat Context Overlay Card */}
                {showStatContextOverlay && statContextData && (
                    <div 
                        className="absolute left-1/2 -translate-x-1/2 w-[2600px] rounded-[80px] p-[100px] border-[12px] border-white/10 shadow-2xl text-white flex flex-col z-30 font-sans origin-bottom"
                        style={{ 
                            backgroundColor: 'rgba(28, 28, 36, 0.95)',
                            bottom: `${statContextPanY}px`,
                            transform: `translateX(-50%) scale(${statContextScale / 100})`
                        }}
                    >
                        {/* Header Title & Subtitle */}
                        <div className="text-center mb-[80px]">
                            <h2 className="text-[100px] font-black uppercase tracking-tight text-white leading-none">{statContextData.title}</h2>
                            {statContextData.subtitle && (
                                <p className="text-[50px] font-bold text-white/50 tracking-widest uppercase mt-4">{statContextData.subtitle}</p>
                            )}
                        </div>

                        {/* Table Header */}
                        <div className="flex items-center w-full px-[60px] pb-[40px] border-b-[4px] border-white/10 mb-[40px]">
                            <div className="w-[150px] text-[40px] font-black text-white/40 uppercase tracking-widest">{statContextData.columns?.[0] || 'Rank'}</div>
                            <div className="flex-1 text-[40px] font-black text-white/40 uppercase tracking-widest">{statContextData.columns?.[1] || 'Player'}</div>
                            <div className="w-[500px] text-[40px] font-black text-white/40 uppercase tracking-widest text-center">{statContextData.columns?.[2] || 'Team'}</div>
                            <div className="w-[450px] text-[40px] font-black text-white/40 uppercase tracking-widest text-center">{statContextData.columns?.[3] || 'Date'}</div>
                            <div className="w-[400px] text-[40px] font-black text-white/40 uppercase tracking-widest text-right">{statContextData.columns?.[4] || 'Stat'}</div>
                        </div>

                        {/* Table Rows */}
                        <div className="flex flex-col gap-[30px] w-full px-[40px]">
                            {statContextData.rows?.map((row: any, idx: number) => {
                                const isHighlight = row.isHighlight || (statContextData.highlight && row.player?.includes(statContextData.highlight));
                                return (
                                    <div 
                                        key={idx} 
                                        className="flex items-center w-full px-[40px] py-[30px] rounded-[40px] transition-all"
                                        style={{ backgroundColor: isHighlight ? 'rgba(180, 36, 52, 0.15)' : 'transparent', border: isHighlight ? '4px solid rgba(180, 36, 52, 0.5)' : '4px solid transparent' }}
                                    >
                                        <div className="w-[150px] text-[65px] font-bold text-white/60">{row.rank || idx + 1}</div>
                                        <div className="flex-1 text-[85px] font-black text-white uppercase tracking-tight leading-none pr-8 break-words">{row.player}</div>
                                        <div className="w-[500px] flex justify-center items-center">
                                            {row.teamAbbr ? (
                                                <img
                                                    src={`https://a.espncdn.com/i/teamlogos/${statContextData.title?.toLowerCase().includes('nba') ? 'nba' : statContextData.title?.toLowerCase().includes('nfl') ? 'nfl' : 'mlb'}/500/scoreboard/${row.teamAbbr.toLowerCase()}.png`}
                                                    alt="Team Logo"
                                                    className="w-[180px] h-[180px] object-contain"
                                                    crossOrigin="anonymous"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            ) : (
                                                <span className="text-[55px] font-bold text-white/50">{row.team}</span>
                                            )}
                                        </div>
                                        <div className="w-[450px] text-[55px] font-bold text-white/60 text-center">{row.date}</div>
                                        <div className="w-[400px] text-[80px] font-black text-[#58a6ff] text-right">{row.value}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footnote */}
                        {statContextData.footnote && (
                            <div className="text-[40px] font-medium italic text-white/30 text-right mt-[60px] pr-[60px]">
                                {statContextData.footnote}
                            </div>
                        )}
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
    ), [previewScale, leftIndent, logoTopPadding, logoBottomPadding, brand, logoHeight, fontSize, lineHeight, textTopPadding, textBottomPadding, statText, photoUrl, photoZoom, photoPanX, photoPanY, isGeneratingImage, showMatchupOverlay, matchupLeague, matchupTime, awayTeamAbbr, awayTeamName, awayTeamRecord, awayMl, awayRl, homeTeamAbbr, homeTeamName, homeTeamRecord, homeMl, homeRl, showStatContextOverlay, statContextData, statContextScale, statContextPanY]);

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
            } else if (data.error) {
                alert("API Error: " + data.error);
            } else {
                alert("Couldn't find images. Try a more specific stat.");
            }
        } catch (e: any) {
            console.error(e);
            alert("Error finding images: " + (e.message || e));
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

                {/* Step Navigation — hidden on Step 0 brand picker */}
                {currentStep !== 0 && (
                    <nav className="flex space-x-1 border-b px-4 py-3 shrink-0 z-50 shadow-sm relative" style={{ borderColor: BRAND.navyLight + '40', background: BRAND.navy }}>
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

                <div className="overflow-y-auto flex-1 p-4 space-y-4 md:space-y-6 pb-32">

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
                                <div className="text-center pt-8">
                                    <a href="/giveaway" className="text-xs font-bold text-white/30 hover:text-white/70 uppercase tracking-widest transition-colors">
                                        WTF Giveaway
                                    </a>
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
                                        {(statText || photoUrl || foundStats.length > 0) && (
                                            <button
                                                onClick={handleClearAll}
                                                className="border p-2 rounded-lg transition-all text-xs flex items-center gap-2 hover:scale-[1.02] active:scale-95"
                                                style={{ background: BRAND.navyDark, borderColor: BRAND.navyLight + '40', color: BRAND.navyLight }}
                                            >
                                                <span>Clear</span>
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
                                                    onClick={() => { 
                                                        setStatText(stat.text); 
                                                        if (brand === 'bets-x-logo.jpg') {
                                                            handleMatchupSearch(stat.text); 
                                                        } else if (brand === 'wtf-x-logo.jpg') {
                                                            handleStatContextSearch(stat.text, false);
                                                        }
                                                    }}
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
                                        onClick={() => { if (aiRefImage) setPhotoUrl(aiRefImage.startsWith('http') ? proxyUrl(aiRefImage) : aiRefImage); }}
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

                                {(photoUrl || statText) && (
                                    <button
                                        onClick={handleClearAll}
                                        className="w-full py-2 border rounded-lg text-xs font-bold transition-all active:scale-95 text-zinc-400 hover:text-white"
                                        style={{ background: BRAND.navyDark, borderColor: BRAND.navyLight + '40' }}
                                    >
                                        CLEAR WORKSPACE
                                    </button>
                                )}

                                {/* Found Images Grid */}
                                {foundImages.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BRAND.navyLight }}>Found Images — tap to select</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {foundImages.map((url, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => { setPhotoUrl(proxyUrl(url)); setAiRefImage(url); setAiRefImageName(`Found Image ${i + 1}`); setAiInputMode('image'); }}
                                                    className="aspect-square rounded-lg overflow-hidden border-2 transition-all active:scale-95 relative bg-zinc-100 flex flex-col items-center justify-center p-2"
                                                    style={{ borderColor: aiRefImage === url ? BRAND.crimson : 'transparent' }}
                                                >
                                                    <span className="absolute text-[10px] text-zinc-500 font-bold z-0 text-center break-all opacity-50 px-1">Link Broken or Protected</span>
                                                    <img 
                                                        src={proxyUrl(url)} 
                                                        alt={`Found ${i + 1}`} 
                                                        className="w-full h-full object-cover absolute inset-0 z-10 bg-zinc-100" 
                                                        onError={(e) => { 
                                                            (e.target as HTMLImageElement).style.opacity = '0'; 
                                                        }} 
                                                    />
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
                                                                setPhotoUrl(aiImageResult.url.startsWith('http') ? proxyUrl(aiImageResult.url) : aiImageResult.url);
                                                                setPhotoZoom(188);
                                                                setPhotoPanY(688);
                                                                setPhotoPanX(0);
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
                                <h2 className="text-lg font-bold flex items-center gap-2"><Maximize style={{ color: BRAND.crimson }} /> Step 4: Visuals</h2>

                                {[
                                    { label: "Photo Zoom", value: photoZoom, setter: setPhotoZoom, min: 100, max: 500, unit: "%" },
                                    { label: "Horizontal Pan", value: photoPanX, setter: setPhotoPanX, min: -4000, max: 4000, unit: "px" },
                                    { label: "Vertical Pan (Offset)", value: photoPanY, setter: setPhotoPanY, min: -4000, max: 4000, unit: "px" },
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

                                <div className="border-t border-white/10 pt-6 mt-6 space-y-4">
                                    {/* MATCHUP OVERLAY CONTROLS (WTF BETS) */}
                                    {brand === 'bets-x-logo.jpg' && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                    Matchup Overlay
                                                    {isSearchingMatchup && <Loader2 className="animate-spin" size={14} style={{ color: BRAND.crimson }} />}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleMatchupSearch(statText)}
                                                        disabled={isSearchingMatchup || !statText}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-200 text-white disabled:opacity-30 flex items-center gap-1"
                                                        style={{ background: BRAND.navyDark, border: '1px solid rgba(255,255,255,0.1)' }}
                                                    >
                                                        {isSearchingMatchup ? <Loader2 className="animate-spin" size={10} /> : <Zap size={10} />}
                                                        Auto
                                                    </button>
                                                    <button
                                                        onClick={() => setShowMatchupOverlay(!showMatchupOverlay)}
                                                        className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all duration-200 ${
                                                            showMatchupOverlay ? 'text-white' : 'text-white/40'
                                                        }`}
                                                        style={{
                                                            background: showMatchupOverlay ? BRAND.crimson : BRAND.navyDark,
                                                            border: `1px solid ${showMatchupOverlay ? BRAND.crimson : 'rgba(255,255,255,0.1)'}`
                                                        }}
                                                    >
                                                        {showMatchupOverlay ? 'ON' : 'OFF'}
                                                    </button>
                                                </div>
                                            </div>

                                            {showMatchupOverlay && (
                                                <div className="space-y-4 animate-in fade-in duration-300">
                                                    {/* Game Info */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">League</label>
                                                    <input
                                                        type="text"
                                                        value={matchupLeague}
                                                        onChange={(e) => setMatchupLeague(e.target.value)}
                                                        className="w-full bg-[#161622] border border-white/10 rounded-lg p-2 text-xs focus:outline-none text-white focus:border-[#b42434]"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Time</label>
                                                    <input
                                                        type="text"
                                                        value={matchupTime}
                                                        onChange={(e) => setMatchupTime(e.target.value)}
                                                        className="w-full bg-[#161622] border border-white/10 rounded-lg p-2 text-xs focus:outline-none text-white focus:border-[#b42434]"
                                                    />
                                                </div>
                                            </div>

                                            {/* AWAY TEAM */}
                                            <div className="border border-white/5 bg-white/3 rounded-xl p-3.5 space-y-3">
                                                <div className="text-xs font-black text-[#58a6ff] uppercase tracking-wider">Away Team (Visitor)</div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] uppercase font-bold text-white/40 block">Select MLB Team</label>
                                                    <select
                                                        onChange={(e) => {
                                                            const selected = MLB_TEAMS.find(t => t.abbr === e.target.value);
                                                            if (selected) {
                                                                setAwayTeamAbbr(selected.abbr);
                                                                setAwayTeamName(selected.name);
                                                            } else {
                                                                setAwayTeamAbbr("");
                                                                setAwayTeamName("");
                                                            }
                                                        }}
                                                        className="w-full bg-[#161622] border border-white/10 rounded-lg p-2 text-xs focus:outline-none text-white"
                                                        value={awayTeamAbbr}
                                                    >
                                                        <option value="">-- Custom Team --</option>
                                                        {MLB_TEAMS.map(team => (
                                                            <option key={team.abbr} value={team.abbr}>{team.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[9px] uppercase font-bold text-white/40 block">Name</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Rockies"
                                                            value={awayTeamName}
                                                            onChange={(e) => setAwayTeamName(e.target.value)}
                                                            className="w-full bg-[#161622] border border-white/10 rounded-lg p-2 text-xs focus:outline-none text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] uppercase font-bold text-white/40 block">Abbr (Logo)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="col"
                                                            value={awayTeamAbbr}
                                                            onChange={(e) => setAwayTeamAbbr(e.target.value)}
                                                            className="w-full bg-[#161622] border border-white/10 rounded-lg p-2 text-xs focus:outline-none text-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <label className="text-[9px] uppercase font-bold text-white/40 block">Record</label>
                                                        <input
                                                            type="text"
                                                            placeholder="15-28"
                                                            value={awayTeamRecord}
                                                            onChange={(e) => setAwayTeamRecord(e.target.value)}
                                                            className="w-full bg-[#161622] border border-white/10 rounded-lg p-2 text-xs focus:outline-none text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] uppercase font-bold text-white/40 block">Moneyline</label>
                                                        <input
                                                            type="text"
                                                            placeholder="+180"
                                                            value={awayMl}
                                                            onChange={(e) => setAwayMl(e.target.value)}
                                                            className="w-full bg-[#161622] border border-white/10 rounded-lg p-2 text-xs focus:outline-none text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] uppercase font-bold text-white/40 block">Runline</label>
                                                        <input
                                                            type="text"
                                                            placeholder="+1.5 (-115)"
                                                            value={awayRl}
                                                            onChange={(e) => setAwayRl(e.target.value)}
                                                            className="w-full bg-[#161622] border border-white/10 rounded-lg p-2 text-xs focus:outline-none text-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* HOME TEAM */}
                                            <div className="border border-white/5 bg-white/3 rounded-xl p-3.5 space-y-3">
                                                <div className="text-xs font-black text-[#b42434] uppercase tracking-wider">Home Team</div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] uppercase font-bold text-white/40 block">Select MLB Team</label>
                                                    <select
                                                        onChange={(e) => {
                                                            const selected = MLB_TEAMS.find(t => t.abbr === e.target.value);
                                                            if (selected) {
                                                                setHomeTeamAbbr(selected.abbr);
                                                                setHomeTeamName(selected.name);
                                                            } else {
                                                                setHomeTeamAbbr("");
                                                                setHomeTeamName("");
                                                            }
                                                        }}
                                                        className="w-full bg-[#161622] border border-white/10 rounded-lg p-2 text-xs focus:outline-none text-white"
                                                        value={homeTeamAbbr}
                                                    >
                                                        <option value="">-- Custom Team --</option>
                                                        {MLB_TEAMS.map(team => (
                                                            <option key={team.abbr} value={team.abbr}>{team.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[9px] uppercase font-bold text-white/40 block">Name</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Dodgers"
                                                            value={homeTeamName}
                                                            onChange={(e) => setHomeTeamName(e.target.value)}
                                                            className="w-full bg-[#161622] border border-white/10 rounded-lg p-2 text-xs focus:outline-none text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] uppercase font-bold text-white/40 block">Abbr (Logo)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="lad"
                                                            value={homeTeamAbbr}
                                                            onChange={(e) => setHomeTeamAbbr(e.target.value)}
                                                            className="w-full bg-[#161622] border border-white/10 rounded-lg p-2 text-xs focus:outline-none text-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <label className="text-[9px] uppercase font-bold text-white/40 block">Record</label>
                                                        <input
                                                            type="text"
                                                            placeholder="29-17"
                                                            value={homeTeamRecord}
                                                            onChange={(e) => setHomeTeamRecord(e.target.value)}
                                                            className="w-full bg-[#161622] border border-white/10 rounded-lg p-2 text-xs focus:outline-none text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] uppercase font-bold text-white/40 block">Moneyline</label>
                                                        <input
                                                            type="text"
                                                            placeholder="-220"
                                                            value={homeMl}
                                                            onChange={(e) => setHomeMl(e.target.value)}
                                                            className="w-full bg-[#161622] border border-white/10 rounded-lg p-2 text-xs focus:outline-none text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] uppercase font-bold text-white/40 block">Runline</label>
                                                        <input
                                                            type="text"
                                                            placeholder="-1.5 (-105)"
                                                            value={homeRl}
                                                            onChange={(e) => setHomeRl(e.target.value)}
                                                            className="w-full bg-[#161622] border border-white/10 rounded-lg p-2 text-xs focus:outline-none text-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                        </>
                                    )}

                                    {/* STAT CONTEXT OVERLAY CONTROLS (WTF STATS) */}
                                    {brand === 'wtf-x-logo.jpg' && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                    Stat Context Chart
                                                    {isSearchingStatContext && <Loader2 className="animate-spin" size={14} style={{ color: BRAND.crimson }} />}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleStatContextSearch(statText, true)}
                                                        disabled={isSearchingStatContext || !statText}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-200 text-white disabled:opacity-30 flex items-center gap-1"
                                                        style={{ background: BRAND.navyDark, border: '1px solid rgba(255,255,255,0.1)' }}
                                                    >
                                                        {isSearchingStatContext ? <Loader2 className="animate-spin" size={10} /> : <Zap size={10} />}
                                                        Auto
                                                    </button>
                                                    <button
                                                        onClick={() => setShowStatContextOverlay(!showStatContextOverlay)}
                                                        className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all duration-200 ${
                                                            showStatContextOverlay ? 'text-white' : 'text-white/40'
                                                        }`}
                                                        style={{
                                                            background: showStatContextOverlay ? BRAND.crimson : BRAND.navyDark,
                                                            border: `1px solid ${showStatContextOverlay ? BRAND.crimson : 'rgba(255,255,255,0.1)'}`
                                                        }}
                                                    >
                                                        {showStatContextOverlay ? 'ON' : 'OFF'}
                                                    </button>
                                                </div>
                                            </div>

                                            {showStatContextOverlay && !statContextData && (
                                                <div className="text-xs text-white/50 italic text-center py-4">Click AUTO to generate chart data from stat.</div>
                                            )}
                                            {showStatContextOverlay && statContextData && (
                                                <div className="mt-4 space-y-4">
                                                    {!isEditingStatContext ? (
                                                        <div className="text-xs text-white/70 bg-[#161622] border border-white/10 rounded-lg p-3">
                                                            <span className="font-bold text-white block mb-1">{statContextData.title}</span>
                                                            Loaded {statContextData.rows?.length || 0} context rows. Click Auto to regenerate if needed.
                                                            
                                                            <div className="flex gap-2 mt-3">
                                                                <button
                                                                    onClick={() => {
                                                                        setStatContextJsonStr(JSON.stringify(statContextData, null, 2));
                                                                        setIsEditingStatContext(true);
                                                                    }}
                                                                    className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors text-white text-[10px] font-bold"
                                                                >
                                                                    EDIT DATA
                                                                </button>
                                                                <button
                                                                    onClick={() => setIsStatContextLocked(!isStatContextLocked)}
                                                                    className="px-2 py-1 hover:opacity-80 rounded transition-colors text-white text-[10px] font-bold"
                                                                    style={{ background: isStatContextLocked ? BRAND.crimson : 'rgba(255,255,255,0.1)' }}
                                                                >
                                                                    {isStatContextLocked ? 'LOCKED' : 'LOCK DATA'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <textarea
                                                                className="w-full h-48 bg-[#161622] border border-white/10 rounded-lg p-2 text-[10px] font-mono text-zinc-300 focus:outline-none"
                                                                value={statContextJsonStr}
                                                                onChange={(e) => setStatContextJsonStr(e.target.value)}
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        try {
                                                                            const parsed = JSON.parse(statContextJsonStr);
                                                                            setStatContextData(parsed);
                                                                            setIsEditingStatContext(false);
                                                                        } catch (e) {
                                                                            alert("Invalid JSON format");
                                                                        }
                                                                    }}
                                                                    className="flex-1 py-1 bg-emerald-600/50 hover:bg-emerald-600 rounded text-xs font-bold transition-colors"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setIsEditingStatContext(false)}
                                                                    className="flex-1 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-bold transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="space-y-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] uppercase font-bold text-white/40 flex justify-between">
                                                                <span>Scale</span>
                                                                <span className="text-white">{statContextScale}%</span>
                                                            </label>
                                                            <input
                                                                type="range" min="50" max="150" step="1"
                                                                value={statContextScale}
                                                                onChange={(e) => setStatContextScale(Number(e.target.value))}
                                                                className="w-full" style={{ accentColor: BRAND.crimson }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] uppercase font-bold text-white/40 flex justify-between">
                                                                <span>Bottom Offset</span>
                                                                <span className="text-white">{statContextPanY}px</span>
                                                            </label>
                                                            <input
                                                                type="range" min="-500" max="1500" step="10"
                                                                value={statContextPanY}
                                                                onChange={(e) => setStatContextPanY(Number(e.target.value))}
                                                                className="w-full" style={{ accentColor: BRAND.crimson }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentStep === 6 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-bold flex items-center gap-2"><Download style={{ color: BRAND.crimson }} /> Step 5: Export</h2>
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
