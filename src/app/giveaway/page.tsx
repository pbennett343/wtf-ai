"use client";

import React, { useState, useRef } from "react";
import { Loader2, Settings2, Sparkles, Video, Download, CheckCircle2, ChevronLeft, Upload, Trophy, X, Link, Image } from "lucide-react";
import VideoFrameExtractor from "@/components/giveaway/VideoFrameExtractor";
import WheelGenerator, { WheelGeneratorRef } from "@/components/giveaway/WheelGenerator";

const SEED_TOTAL_GIVEAWAYS = 36;
const SEED_TOTAL_MONEY = 1193.80;

const INITIAL_STANDINGS = [
  // ── Winners ranked by W desc, then PWA desc ─────────────────────────────────
  { igHandle: "walker_theaussie94",    pwa: 22, w: 3, l: 19, totalWinnings: 85.00  },
  { igHandle: "daddy_dan12345",        pwa: 24, w: 2, l: 22, totalWinnings: 60.00  },
  { igHandle: "georgiastvfl",          pwa: 7,  w: 3, l: 4,  totalWinnings: 75.00  },
  { igHandle: "minnichtrey",           pwa: 13, w: 2, l: 11, totalWinnings: 50.00  },
  { igHandle: "bwright4_3",            pwa: 22, w: 2, l: 20, totalWinnings: 60.00  },
  { igHandle: "connorpapaya",          pwa: 14, w: 2, l: 12, totalWinnings: 50.00  },
  { igHandle: "bnobach13",             pwa: 32, w: 1, l: 31, totalWinnings: 38.40  },
  { igHandle: "bodie_maxon54",         pwa: 23, w: 1, l: 22, totalWinnings: 25.00  },
  { igHandle: "adler.meek",            pwa: 24, w: 1, l: 23, totalWinnings: 25.00  },
  { igHandle: "jacksonkuntz5",         pwa: 24, w: 1, l: 23, totalWinnings: 25.00  },
  { igHandle: "cthenry7",              pwa: 23, w: 1, l: 22, totalWinnings: 38.40  },
  { igHandle: "drewgillis7",           pwa: 21, w: 1, l: 20, totalWinnings: 38.40  },
  { igHandle: "maddox0514",            pwa: 23, w: 1, l: 22, totalWinnings: 25.00  },
  { igHandle: "mrj_2620",              pwa: 24, w: 1, l: 23, totalWinnings: 25.00  },
  { igHandle: "madixwesterlund",       pwa: 23, w: 1, l: 22, totalWinnings: 25.00  },
  { igHandle: "miamijp_1181",          pwa: 21, w: 1, l: 20, totalWinnings: 25.00  },
  { igHandle: "happy_thoughts_4days",  pwa: 21, w: 1, l: 20, totalWinnings: 25.00  },
  { igHandle: "bdc29",                 pwa: 19, w: 1, l: 18, totalWinnings: 25.00  },
  { igHandle: "nick.curth",            pwa: 15, w: 1, l: 14, totalWinnings: 25.00  },
  { igHandle: "isaachadlow30",         pwa: 19, w: 1, l: 18, totalWinnings: 38.40  },
  { igHandle: "titusburkhardt",        pwa: 16, w: 1, l: 15, totalWinnings: 35.00  },
  { igHandle: "jakerss2",              pwa: 14, w: 1, l: 13, totalWinnings: 35.00  },
  { igHandle: "dylan_crozier",         pwa: 12, w: 1, l: 11, totalWinnings: 25.00  },
  { igHandle: "dangabay914",           pwa: 10, w: 1, l: 9,  totalWinnings: 25.00  },
  { igHandle: "sahilhazari327",        pwa: 12, w: 1, l: 11, totalWinnings: 25.00  },
  { igHandle: "jimmy_lasceski",        pwa: 8,  w: 1, l: 7,  totalWinnings: 25.00  },
  { igHandle: "cpetruska5",            pwa: 7,  w: 1, l: 6,  totalWinnings: 25.00  },
  { igHandle: "the.chefs.corner",      pwa: 4,  w: 1, l: 3,  totalWinnings: 25.00  },
  { igHandle: "kushpatel.58",          pwa: 7,  w: 1, l: 6,  totalWinnings: 25.00  },
  { igHandle: "anthonyevangelista",    pwa: 4,  w: 1, l: 3,  totalWinnings: 38.40  },
  { igHandle: "caleblara__",           pwa: 2,  w: 1, l: 1,  totalWinnings: 38.40  },
  { igHandle: "prudencio.logan",       pwa: 1,  w: 1, l: 0,  totalWinnings: 38.40  },
  { igHandle: "petekman",              pwa: 21, w: 1, l: 20, totalWinnings: 25.00  },
  { igHandle: "zachbaunburner",        pwa: 15, w: 1, l: 14, totalWinnings: 25.00  },
  { igHandle: "austin_sanchez_55",     pwa: 24, w: 1, l: 23, totalWinnings: 25.00  },
  // ── 0-win participants ───────────────────────────────────────────────────────
  { igHandle: "imramon24",             pwa: 24, w: 0, l: 24, totalWinnings: 0  },
  { igHandle: "drew.bingamon01",       pwa: 22, w: 0, l: 22, totalWinnings: 0  },
  { igHandle: "darth_paider",          pwa: 22, w: 0, l: 22, totalWinnings: 0  },
  { igHandle: "bojangles2724",         pwa: 20, w: 0, l: 20, totalWinnings: 0  },
  { igHandle: "edwardl426",            pwa: 23, w: 0, l: 23, totalWinnings: 0  },
  { igHandle: "ppparker25",            pwa: 19, w: 0, l: 19, totalWinnings: 0  },
  { igHandle: "phoenix_spotter",       pwa: 21, w: 0, l: 21, totalWinnings: 0  },
  { igHandle: "a_aburkhardt",          pwa: 21, w: 0, l: 21, totalWinnings: 0  },
  { igHandle: "riley_manz",            pwa: 20, w: 0, l: 20, totalWinnings: 0  },
  { igHandle: "alex_oconnor__",        pwa: 16, w: 0, l: 16, totalWinnings: 0  },
  { igHandle: "vfl_bluehens",          pwa: 16, w: 0, l: 16, totalWinnings: 0  },
  { igHandle: "elias.dafniotis",       pwa: 15, w: 0, l: 15, totalWinnings: 0  },
  { igHandle: "jb_keller",             pwa: 15, w: 0, l: 15, totalWinnings: 0  },
  { igHandle: "jzmes18",               pwa: 15, w: 0, l: 15, totalWinnings: 0  },
  { igHandle: "josiahhurd1",           pwa: 14, w: 0, l: 14, totalWinnings: 0  },
  { igHandle: "5braeden5",             pwa: 14, w: 0, l: 14, totalWinnings: 0  },
  { igHandle: "jackburnett502",        pwa: 15, w: 0, l: 15, totalWinnings: 0  },
  { igHandle: "packenator_",           pwa: 12, w: 0, l: 12, totalWinnings: 0  },
  { igHandle: "luke_friedl",           pwa: 12, w: 0, l: 12, totalWinnings: 0  },
  { igHandle: "vince_basile83",        pwa: 14, w: 0, l: 14, totalWinnings: 0  },
  { igHandle: "binktastic_",           pwa: 14, w: 0, l: 14, totalWinnings: 0  },
  { igHandle: "jtriles518",            pwa: 12, w: 0, l: 12, totalWinnings: 0  },
  { igHandle: "jalensauer4",           pwa: 10, w: 0, l: 10, totalWinnings: 0  },
  { igHandle: "albert_qiao",           pwa: 9,  w: 0, l: 9,  totalWinnings: 0  },
  { igHandle: "briannarmrz",           pwa: 9,  w: 0, l: 9,  totalWinnings: 0  },
  { igHandle: "liam.prokop",           pwa: 10, w: 0, l: 10, totalWinnings: 0  },
  { igHandle: "a.sweens.2",            pwa: 8,  w: 0, l: 8,  totalWinnings: 0  },
  { igHandle: "colorado.icebreakers.nef", pwa: 6, w: 0, l: 6, totalWinnings: 0 },
  { igHandle: "kjgrand",               pwa: 6,  w: 0, l: 6,  totalWinnings: 0  },
  { igHandle: "numbanine",             pwa: 6,  w: 0, l: 6,  totalWinnings: 0  },
  { igHandle: "mcanipe10",             pwa: 7,  w: 0, l: 7,  totalWinnings: 0  },
  { igHandle: "mackenzi.thomasson",    pwa: 6,  w: 0, l: 6,  totalWinnings: 0  },
  { igHandle: "sparkiousx",            pwa: 6,  w: 0, l: 6,  totalWinnings: 0  },
  { igHandle: "a.aaron.aa",            pwa: 8,  w: 0, l: 8,  totalWinnings: 0  },
  { igHandle: "c.brown17",             pwa: 5,  w: 0, l: 5,  totalWinnings: 0  },
  { igHandle: "rileythestreet",        pwa: 7,  w: 0, l: 7,  totalWinnings: 0  },
  { igHandle: "5ktwxnuzi",             pwa: 4,  w: 0, l: 4,  totalWinnings: 0  },
  { igHandle: "brogan.fitzgerald",     pwa: 4,  w: 0, l: 4,  totalWinnings: 0  },
  { igHandle: "theaustinbates",        pwa: 4,  w: 0, l: 4,  totalWinnings: 0  },
  { igHandle: "tyler_m2003",           pwa: 5,  w: 0, l: 5,  totalWinnings: 0  },
  { igHandle: "vasili.sachlas",        pwa: 4,  w: 0, l: 4,  totalWinnings: 0  },
  { igHandle: "ike__baker",            pwa: 7,  w: 0, l: 7,  totalWinnings: 0  },
  { igHandle: "turkmtman",             pwa: 6,  w: 0, l: 6,  totalWinnings: 0  },
  { igHandle: "restinpeat",            pwa: 7,  w: 0, l: 7,  totalWinnings: 0  },
  { igHandle: "liamzimbric",           pwa: 3,  w: 0, l: 3,  totalWinnings: 0  },
  { igHandle: "matthew_hansmann",      pwa: 3,  w: 0, l: 3,  totalWinnings: 0  },
  { igHandle: "riley6ty9",             pwa: 3,  w: 0, l: 3,  totalWinnings: 0  },
  { igHandle: "rjhentz",               pwa: 3,  w: 0, l: 3,  totalWinnings: 0  },
  { igHandle: "singhtucker",           pwa: 3,  w: 0, l: 3,  totalWinnings: 0  },
  { igHandle: "unknxwn_ixn",           pwa: 4,  w: 0, l: 4,  totalWinnings: 0  },
  { igHandle: "diego.14.rdz",          pwa: 3,  w: 0, l: 3,  totalWinnings: 0  },
  { igHandle: "jonboone25",            pwa: 3,  w: 0, l: 3,  totalWinnings: 0  },
  { igHandle: "matt.kenzo",            pwa: 5,  w: 0, l: 5,  totalWinnings: 0  },
  { igHandle: "__numbanine__",         pwa: 2,  w: 0, l: 2,  totalWinnings: 0  },
  { igHandle: "alex_kubin",            pwa: 2,  w: 0, l: 2,  totalWinnings: 0  },
  { igHandle: "andrewrobey18",         pwa: 2,  w: 0, l: 2,  totalWinnings: 0  },
  { igHandle: "engnk_1",              pwa: 2,  w: 0, l: 2,  totalWinnings: 0  },
  { igHandle: "franknbeans25",         pwa: 2,  w: 0, l: 2,  totalWinnings: 0  },
  { igHandle: "ilovejimmybutler15",    pwa: 2,  w: 0, l: 2,  totalWinnings: 0  },
  { igHandle: "keaton4104",            pwa: 2,  w: 0, l: 2,  totalWinnings: 0  },
  { igHandle: "los.molina.44",         pwa: 2,  w: 0, l: 2,  totalWinnings: 0  },
  { igHandle: "mbn_nik0",              pwa: 2,  w: 0, l: 2,  totalWinnings: 0  },
  { igHandle: "nate__s.p.o.r.t.s",    pwa: 2,  w: 0, l: 2,  totalWinnings: 0  },
  { igHandle: "nol_ro",                pwa: 3,  w: 0, l: 3,  totalWinnings: 0  },
  { igHandle: "peepeepoopooweinerballs", pwa: 2, w: 0, l: 2, totalWinnings: 0  },
  { igHandle: "pfannenstiel56",        pwa: 2,  w: 0, l: 2,  totalWinnings: 0  },
  { igHandle: "sboucher4646",          pwa: 2,  w: 0, l: 2,  totalWinnings: 0  },
  { igHandle: "tyler_gogurtz",         pwa: 3,  w: 0, l: 3,  totalWinnings: 0  },
  { igHandle: "boganbicyclist",        pwa: 2,  w: 0, l: 2,  totalWinnings: 0  },
  { igHandle: "drxppy.twan25",         pwa: 2,  w: 0, l: 2,  totalWinnings: 0  },
  { igHandle: "_los.molina.44_",       pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "201.jon_",              pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "benjagrammer",          pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "birdsong_blake",        pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "blake.miller_17",       pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "conner.short2",         pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "donnie_w92",            pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "dylwall_852",           pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "evanlikeheaven",        pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "indianagoatfarm",       pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "jaketurer",             pwa: 2,  w: 0, l: 2,  totalWinnings: 0  },
  { igHandle: "jayydeezee",            pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "jeremy.wilczak",        pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "jetskii_m",             pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "jk_8860",              pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "joshrivera_5",          pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "lu5th",                 pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "m.dangelo12",           pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "malsuasan",             pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "mattrh34",              pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "mauricenjeru_",         pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "noahk__704",            pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "noahpalso_88",          pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "reedwilson52",          pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "riseandgrind_ro",       pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "roryball468",           pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "santi.padillaa",        pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "scoutvacek",            pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "skinama_rink",          pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "theianforster",         pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "vruniversityavatars.vfl", pwa: 1, w: 0, l: 1, totalWinnings: 0  },
  { igHandle: "vfl_coachsins",         pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "hunter.z.mcfarland",    pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "ram.karuppiah",         pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "alex_oconnor_",         pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "mike_wesselman",        pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
  { igHandle: "theconnorjoyce",        pwa: 1,  w: 0, l: 1,  totalWinnings: 0  },
];

export default function GiveawayPage() {
    // Inputs
    const [rawText, setRawText] = useState("");
    const [winningAnswer, setWinningAnswer] = useState("");
    const [acceptMisspellings, setAcceptMisspellings] = useState(true);
    const [acceptAllComments, setAcceptAllComments] = useState(false);
    const [customApiKey, setCustomApiKey] = useState("");
    
    // Stats Standing State
    const [trackStats, setTrackStats] = useState(true);
    const [prizeAmount, setPrizeAmount] = useState("25.00");
    const [showStandings, setShowStandings] = useState(false);
    const [showImportExport, setShowImportExport] = useState(false);
    const [importText, setImportText] = useState("");
    const [standings, setStandings] = useState<any[]>([]);
    const [totalGiveaways, setTotalGiveaways] = useState(SEED_TOTAL_GIVEAWAYS);
    const [totalPrizeMoney, setTotalPrizeMoney] = useState(SEED_TOTAL_MONEY);
    const [isStatsLoaded, setIsStatsLoaded] = useState(false);

    React.useEffect(() => {
        const DATA_VERSION = "v3"; // bump this whenever INITIAL_STANDINGS is updated
        const savedVersion = localStorage.getItem("wtf_giveaway_version");

        if (savedVersion !== DATA_VERSION) {
            // Fresh seed: wipe old stale data and write the new baseline
            localStorage.setItem("wtf_giveaway_version", DATA_VERSION);
            localStorage.setItem("wtf_giveaway_standings", JSON.stringify(INITIAL_STANDINGS));
            localStorage.setItem("wtf_giveaway_total_count", SEED_TOTAL_GIVEAWAYS.toString());
            localStorage.setItem("wtf_giveaway_total_money", SEED_TOTAL_MONEY.toString());
            setStandings(INITIAL_STANDINGS);
            setTotalGiveaways(SEED_TOTAL_GIVEAWAYS);
            setTotalPrizeMoney(SEED_TOTAL_MONEY);
        } else {
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
        }
        setIsStatsLoaded(true);

        const savedKey = localStorage.getItem("wtf_custom_gemini_api_key");
        if (savedKey) setCustomApiKey(savedKey);

        const savedHistory = localStorage.getItem("wtf_giveaway_history");
        if (savedHistory) {
            try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
        }
    }, []);

    const handleCustomApiKeyChange = (val: string) => {
        setCustomApiKey(val);
        localStorage.setItem("wtf_custom_gemini_api_key", val);
    };

    const [history, setHistory] = useState<{ standings: any[], totalGiveaways: number, totalPrizeMoney: number } | null>(null);

    const saveToHistory = (currStandings: any[], currGiveaways: number, currMoney: number) => {
        const historyObj = { standings: currStandings, totalGiveaways: currGiveaways, totalPrizeMoney: currMoney };
        setHistory(historyObj);
        localStorage.setItem("wtf_giveaway_history", JSON.stringify(historyObj));
    };

    const undoLastAction = () => {
        if (!history) return;
        if (!window.confirm("Are you sure you want to undo the last update/import/reset? This will restore stats to the previous state.")) {
            return;
        }
        setStandings(history.standings);
        setTotalGiveaways(history.totalGiveaways);
        setTotalPrizeMoney(history.totalPrizeMoney);
        localStorage.setItem("wtf_giveaway_standings", JSON.stringify(history.standings));
        localStorage.setItem("wtf_giveaway_total_count", history.totalGiveaways.toString());
        localStorage.setItem("wtf_giveaway_total_money", history.totalPrizeMoney.toString());
        setHistory(null);
        localStorage.removeItem("wtf_giveaway_history");
        alert("Last action undone successfully!");
    };

    const handleEditPlayer = (igHandle: string) => {
        const player = standings.find(p => p.igHandle.toLowerCase() === igHandle.toLowerCase());
        if (!player) return;

        const newPwaStr = window.prompt(`Edit stats for @${player.igHandle}\n\nEnter Prize Wheel Appearances (PWA):`, player.pwa.toString());
        if (newPwaStr === null) return;
        const newPwa = parseInt(newPwaStr, 10);
        if (isNaN(newPwa)) { alert("Invalid number."); return; }

        const newWStr = window.prompt(`Edit stats for @${player.igHandle}\n\nEnter Wins (W):`, player.w.toString());
        if (newWStr === null) return;
        const newW = parseInt(newWStr, 10);
        if (isNaN(newW)) { alert("Invalid number."); return; }

        const newMoneyStr = window.prompt(`Edit stats for @${player.igHandle}\n\nEnter Total Winnings ($):`, player.totalWinnings.toString());
        if (newMoneyStr === null) return;
        const newMoney = parseFloat(newMoneyStr);
        if (isNaN(newMoney)) { alert("Invalid number."); return; }

        const confirmUpdate = window.confirm(
            `Confirm changes for @${player.igHandle}:\n` +
            `- PWA: ${player.pwa} ➔ ${newPwa}\n` +
            `- Wins: ${player.w} ➔ ${newW}\n` +
            `- Losses: ${player.pwa - player.w} ➔ ${newPwa - newW}\n` +
            `- Winnings: $${player.totalWinnings} ➔ $${newMoney}\n\n` +
            `Save changes?`
        );

        if (confirmUpdate) {
            saveToHistory(standings, totalGiveaways, totalPrizeMoney);
            setStandings(prev => {
                const updated = prev.map(p => {
                    if (p.igHandle.toLowerCase() === igHandle.toLowerCase()) {
                        return {
                            ...p,
                            pwa: newPwa,
                            w: newW,
                            l: newPwa - newW,
                            totalWinnings: newMoney
                        };
                    }
                    return p;
                });
                localStorage.setItem("wtf_giveaway_standings", JSON.stringify(updated));
                return updated;
            });
        }
    };
    
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

    const [shareLinkCopied, setShareLinkCopied] = useState(false);

    // Build a shareable /standings URL encoding all players with 2+ PWA
    const generateShareUrl = () => {
        const filtered = standings.filter(p => p.pwa >= 2);
        const payload = {
            standings: filtered,
            totalGiveaways,
            totalPrizeMoney,
            generatedAt: new Date().toISOString(),
        };
        const encoded = btoa(JSON.stringify(payload));
        const base = typeof window !== 'undefined' ? window.location.origin : '';
        return `${base}/standings?d=${encoded}`;
    };

    // Download a styled PNG of the top 25 + ties for 25th
    const downloadStandingsImage = async () => {
        const sorted = [...standings].sort((a, b) => b.w !== a.w ? b.w - a.w : b.pwa - a.pwa);
        // find cut-off: top 25 + everyone tied with 25th
        let cutoff = Math.min(24, sorted.length - 1);
        const p25 = sorted[cutoff];
        while (cutoff + 1 < sorted.length && sorted[cutoff + 1].w === p25.w && sorted[cutoff + 1].pwa === p25.pwa) cutoff++;
        const display = sorted.slice(0, cutoff + 1);

        const COLS = ['#', 'IG Handle', 'PWA', 'W', 'L', 'Win%', '$ Won'];
        const ROW_H = 32;
        const HEAD_H = 48;
        const HEADER_BLOCK = 110;
        const FOOTER_H = 36;
        const W = 820;
        const H = HEADER_BLOCK + HEAD_H + display.length * ROW_H + FOOTER_H + 16;

        const canvas = document.createElement('canvas');
        canvas.width = W * 2; canvas.height = H * 2;
        const ctx = canvas.getContext('2d')!;
        ctx.scale(2, 2);

        // Background
        ctx.fillStyle = '#111114';
        ctx.fillRect(0, 0, W, H);

        // Header bar
        ctx.fillStyle = '#1e295d';
        ctx.fillRect(0, 0, W, HEADER_BLOCK);

        // Logo
        try {
            const logoImg = await new Promise<HTMLImageElement>((res, rej) => {
                const img = new window.Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => res(img);
                img.onerror = rej;
                img.src = '/wtf-logo-transparent.png';
            });
            const lh = 36; const lw = logoImg.width * (lh / logoImg.height);
            ctx.drawImage(logoImg, W - lw - 14, 14, lw, lh);
        } catch {}

        // Title
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('2026 WTF GIVEAWAY GAMES', W / 2, 36);
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('LIVE STANDINGS', W / 2, 54);

        // Sub-stats
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText(`Total Giveaways: ${totalGiveaways}`, 20, 82);
        ctx.textAlign = 'right';
        ctx.fillText(`$${totalPrizeMoney.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, W - 20, 82);

        const colX = [16, 58, 530, 590, 640, 690, 760];
        const colAlign: CanvasTextAlign[] = ['center', 'left', 'center', 'center', 'center', 'center', 'right'];

        // Table header
        const tableTop = HEADER_BLOCK;
        ctx.fillStyle = '#1e295d';
        ctx.fillRect(0, tableTop, W, HEAD_H);
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillStyle = 'white';
        COLS.forEach((col, ci) => {
            ctx.textAlign = colAlign[ci];
            ctx.fillText(col.toUpperCase(), colX[ci], tableTop + HEAD_H / 2 + 4);
        });

        // Rows
        let rank = 1;
        display.forEach((player, idx) => {
            if (idx > 0) {
                const prev = display[idx - 1];
                if (player.w !== prev.w || player.pwa !== prev.pwa) rank = idx + 1;
            }
            const y = tableTop + HEAD_H + idx * ROW_H;
            ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
            ctx.fillRect(0, y, W, ROW_H);

            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
            const lCount = player.l ?? (player.pwa - player.w);
            const winPct = player.pwa > 0 ? ((player.w / player.pwa) * 100).toFixed(2) : '0.00';
            const cells = [
                medal ?? String(rank),
                `@${player.igHandle}`,
                String(player.pwa),
                String(player.w),
                String(lCount),
                `${winPct}%`,
                player.totalWinnings > 0 ? `$${player.totalWinnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
            ];
            const colors = ['#64748b', '#1e295d', '#1e293b', '#15803d', '#64748b', '#4338ca', player.totalWinnings > 0 ? '#047857' : '#94a3b8'];
            ctx.font = `${rank <= 3 && ci === 1 ? 'bold' : 'normal'} 11px system-ui, sans-serif`;
            cells.forEach((cell, ci) => {
                ctx.textAlign = colAlign[ci];
                ctx.fillStyle = colors[ci];
                ctx.font = `bold 11px system-ui, sans-serif`;
                ctx.fillText(cell, colX[ci], y + ROW_H / 2 + 4);
            });
        });

        // Footer
        const footerY = tableTop + HEAD_H + display.length * ROW_H;
        ctx.fillStyle = '#111114';
        ctx.fillRect(0, footerY, W, FOOTER_H + 16);
        ctx.font = 'bold 9px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.textAlign = 'center';
        ctx.fillText('WTF SPORTS · GIVEAWAY GAMES 2026', W / 2, footerY + FOOTER_H / 2 + 4);

        canvas.toBlob(blob => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `wtf_standings_top25_${new Date().toISOString().slice(0,10)}.png`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 3000);
        }, 'image/png');
    };

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

    const performGeminiScan = async (text: string, images: string[]) => {
        const apiKey = customApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
        if (!apiKey) {
            return await callScannerApiRoute(text, images);
        }

        let directErrorMsg = "";
        try {
            const misspellingRule = acceptMisspellings 
                ? "Accept reasonable misspellings, abbreviations, or variations of the winning answer. For example if the answer is 'Spurs', accept 'spurs', 'SPURS', 'San Antonio Spurs', 'Spurss', etc." 
                : "Only accept EXACT text matches of the winning answer (case-insensitive).";

            const prompt = acceptAllComments
                ? `You are an Instagram Comment Scanner. You will be given screenshots or text from Instagram comments.

YOUR TASK:
1. Look at every comment in the provided images/text.
2. Return the Instagram username of EVERY person who left a comment — regardless of what they wrote.
3. Do NOT filter by any answer or keyword. Include all commenters.

IMPORTANT:
- Instagram usernames look like: mrj_2620, austin_sanchez_55, happy_thoughts_4days, etc.
- The username appears ABOVE or BEFORE the comment text.
- Do NOT include the @ symbol in your output.
- Remove duplicates — if a user commented multiple times, include them only once.

Return your answer as a pure JSON array of strings. No markdown, no explanation, no code fences.
Example: ["mrj_2620", "austin_sanchez_55"]
If no comments are found, return: []`
                : `You are a Giveaway Comment Scanner. You will be given screenshots or text from Instagram comments on a giveaway post.

YOUR TASK:
1. Look at each comment in the provided images/text.
2. Each comment has an Instagram username and their answer/guess.
3. Compare each person's answer against the WINNING ANSWER(S) below.
4. Return ONLY the usernames of people whose answer matches.

WINNING ANSWER(S): ${winningAnswer}
MATCHING RULE: ${misspellingRule}

IMPORTANT:
- Instagram usernames look like: mrj_2620, austin_sanchez_55, happy_thoughts_4days, etc.
- The username appears ABOVE or BEFORE the comment text.
- Do NOT include the @ symbol in your output.
- Remove duplicates.
- If you see the same username multiple times, include it only once.

Return your answer as a pure JSON array of strings. No markdown, no explanation, no code fences.
Example: ["mrj_2620", "austin_sanchez_55"]
If no one matched, return: []`;

            const parts: any[] = [{ text: prompt }];
            if (text) {
                parts.push({ text: `\n\nTEXT INPUT:\n${text}` });
            }

            if (images && images.length > 0) {
                for (const img of images) {
                    const mimeMatch = img.match(/^data:(image\/\w+);base64,/);
                    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
                    parts.push({
                        inlineData: {
                            data: img.split(",")[1],
                            mimeType
                        }
                    });
                }
            }

            // Using gemini-2.5-flash which is extremely fast and robust for multi-modal tasks
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts }]
                })
            });

            if (!res.ok) {
                throw new Error(`Direct Gemini API failed with status ${res.status}`);
            }

            const data = await res.json();
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            let usernames: string[] = [];
            try {
                const parsed = JSON.parse(responseText.trim());
                if (Array.isArray(parsed)) usernames = parsed;
            } catch (e) {
                const match = responseText.match(/\[[\s\S]*?\]/);
                if (match) {
                    try {
                        const parsed = JSON.parse(match[0]);
                        if (Array.isArray(parsed)) usernames = parsed;
                    } catch (e2) {}
                }
            }
            return usernames;
        } catch (err: any) {
            directErrorMsg = err.message || String(err);
            console.warn("Direct Gemini call failed, falling back to Next.js API route:", err);
        }

        // Try server route fallback
        try {
            return await callScannerApiRoute(text, images);
        } catch (fallbackErr: any) {
            throw new Error(`Direct call failed (${directErrorMsg}) AND fallback failed (${fallbackErr.message || String(fallbackErr)})`);
        }
    };

    const callScannerApiRoute = async (text: string, images: string[]) => {
        const res = await fetch("/api/ai/giveaway-scanner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                images,
                winningAnswer,
                acceptMisspellings,
                acceptAllComments
            }),
        });

        if (!res.ok) {
            throw new Error(`API route failed: HTTP error ${res.status}`);
        }

        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data.usernames || [];
    };

    const handleScan = async (isReverse = false) => {
        if (!winningAnswer && !acceptAllComments) {
            alert("Please enter a winning answer to search for.");
            return;
        }
        if (!rawText && frames.length === 0) {
            alert("Please paste text or upload an image/video to scan.");
            return;
        }

        setIsScanning(true);
        if (!isReverse) {
            setShowResults(false);
            setUsernames([]);
        }
        setScanProgress("");

        try {
            const allUsernames: string[] = isReverse ? [...usernames] : [];
            const hasApiKey = !!(customApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
            const BATCH_SIZE = hasApiKey ? 6 : 2; // Direct client-side calls support 6 frames; server route fallback needs 2 to avoid Vercel timeouts/payload limits
            const scanErrors: string[] = [];

            if (frames.length > 0) {
                const scanFrames = isReverse ? [...frames].reverse() : frames;
                const totalBatches = Math.ceil(scanFrames.length / BATCH_SIZE);
                let someBatchesFailed = false;

                for (let i = 0; i < scanFrames.length; i += BATCH_SIZE) {
                    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
                    setScanProgress(`Scanning batch ${batchNum} of ${totalBatches} (${isReverse ? 'Reverse' : 'Forward'})...`);
                    const batch = scanFrames.slice(i, i + BATCH_SIZE);

                    try {
                        // Rate limit prevention: sleep 1.5 seconds between batches (except the first one)
                        if (i > 0) {
                            await new Promise(resolve => setTimeout(resolve, 1500));
                        }
                        const batchUsernames = await performGeminiScan((i === 0 && !isReverse) ? rawText : "", batch);
                        allUsernames.push(...batchUsernames);
                        // Update usernames incrementally in real-time so the list populates live!
                        const uniqueSoFar = [...new Set(allUsernames.map(u => String(u).toLowerCase()))];
                        setUsernames(uniqueSoFar);
                        setShowResults(true);
                    } catch (batchErr: any) {
                        console.error(`Batch ${batchNum} exception:`, batchErr);
                        scanErrors.push(`Batch ${batchNum}: ${batchErr.message || String(batchErr)}`);
                        someBatchesFailed = true;
                    }
                }

                if (someBatchesFailed) {
                    alert(`Notice: Some video frame batches failed to scan.\n\nErrors:\n${scanErrors.slice(0, 3).join("\n")}`);
                }
            } else {
                setScanProgress("Scanning text...");
                try {
                    const textUsernames = await performGeminiScan(rawText, []);
                    allUsernames.push(...textUsernames);
                } catch (err: any) {
                    alert("Scan failed: " + err.message);
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
                const confirmSave = window.confirm(
                    `Giveaway spin complete!\n\n` +
                    `Winner: @${winner}\n` +
                    `Prize: $${prize.toFixed(2)}\n\n` +
                    `Do you want to update the standings stats with these results?`
                );

                if (confirmSave) {
                    saveToHistory(standings, totalGiveaways, totalPrizeMoney);
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
                                    l: isWinner ? (p.l ?? 0) : (p.l ?? 0) + 1,
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
                                    l: isWinner ? 0 : 1,
                                    totalWinnings: isWinner ? prize : 0
                                });
                            }
                        });

                        localStorage.setItem("wtf_giveaway_standings", JSON.stringify(updated));
                        return updated;
                    });
                }
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
            if (!window.confirm("Are you sure you want to import this standings data? This will overwrite your current standings!")) {
                return false;
            }
            saveToHistory(standings, totalGiveaways, totalPrizeMoney);
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

                            <div className="pt-3 border-t border-white/5">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 flex items-center justify-between">
                                    <span>Custom Gemini API Key</span>
                                    <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#b42434] hover:underline text-[9px] font-bold">Get Free Key</a>
                                </label>
                                <input
                                    type="password"
                                    value={customApiKey}
                                    onChange={e => handleCustomApiKeyChange(e.target.value)}
                                    placeholder={process.env.NEXT_PUBLIC_GEMINI_API_KEY ? "Using default key (rate limits apply)" : "Enter your AI Studio API key"}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#b42434] transition-colors"
                                />
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
                                onClick={() => handleScan(false)}
                                disabled={isScanning || (!rawText && frames.length === 0) || (isVideo && frames.length === 0)}
                                className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2"
                            >
                                {isScanning ? <><Loader2 className="w-5 h-5 animate-spin" /> {scanProgress || "Scanning..."}</> : <><Sparkles className="w-5 h-5" /> Scan For Winners</>}
                            </button>

                            {isVideo && frames.length > 0 && (
                                <button
                                    onClick={() => handleScan(true)}
                                    disabled={isScanning}
                                    className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2 mt-2"
                                >
                                    {isScanning ? <><Loader2 className="w-4 h-4 animate-spin" /> {scanProgress || "Scanning..."}</> : <><Sparkles className="w-4 h-4" /> Re-scan from End (Merge)</>}
                                </button>
                            )}
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
                            <div className="w-full max-w-2xl flex flex-col sm:flex-row justify-between items-center mt-6 text-white text-xs md:text-sm font-bold uppercase tracking-wider gap-2 select-none">
                                <span className="italic opacity-90">Total Giveaways Count: {totalGiveaways}</span>
                                <span className="italic opacity-90 text-center sm:text-right">
                                    Total Prize Money Given: ${totalPrizeMoney.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                        <div className="text-center py-12 text-white/40 font-bold uppercase tracking-wider">No standings available. Import data to get started.</div>
                                    ) : (
                                        <table className="w-full border-collapse text-left">
                                            <thead>
                                                <tr className="bg-[#1e295d] text-white text-[10px] font-black uppercase tracking-wider border-b border-white/20 select-none">
                                                    <th className="py-3 px-4 rounded-tl-xl text-center w-16">Rank</th>
                                                    <th className="py-3 px-4">IG Handle</th>
                                                    <th className="py-3 px-4 text-center">PWA</th>
                                                    <th className="py-3 px-4 text-center">W</th>
                                                    <th className="py-3 px-4 text-center hidden md:table-cell">L</th>
                                                    <th className="py-3 px-4 text-center hidden md:table-cell">Win %</th>
                                                    <th className="py-3 px-4 text-right pr-6">Winnings</th>
                                                    <th className="py-3 px-4 text-center rounded-tr-xl w-14">Edit</th>
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
                                                                <td className="py-2.5 px-4 text-[#1e295d] font-bold break-all">@{player.igHandle}</td>
                                                                <td className="py-2.5 px-4 text-center font-extrabold">{player.pwa}</td>
                                                                <td className="py-2.5 px-4 text-center font-extrabold text-green-700">{player.w}</td>
                                                                <td className="py-2.5 px-4 text-center font-extrabold text-slate-500 hidden md:table-cell">{lCount}</td>
                                                                <td className="py-2.5 px-4 text-center font-extrabold text-indigo-700 hidden md:table-cell">
                                                                    {winPercent.toFixed(2)}%
                                                                </td>
                                                                <td className="py-2.5 px-4 text-right pr-6 font-black text-emerald-700">
                                                                    ${player.totalWinnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </td>
                                                                <td className="py-2.5 px-4 text-center">
                                                                    <button
                                                                        onClick={() => handleEditPlayer(player.igHandle)}
                                                                        className="p-1 text-slate-400 hover:text-[#b42434] active:scale-75 transition-transform"
                                                                        title="Edit Stats"
                                                                    >
                                                                        ✏️
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    });
                                                 })()}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                <div className="bg-black/20 p-4 border-t border-white/5 space-y-3 shrink-0">
                                    {/* Share row */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={async () => {
                                                const url = generateShareUrl();
                                                try { await navigator.clipboard.writeText(url); } catch { /* fallback */ }
                                                setShareLinkCopied(true);
                                                setTimeout(() => setShareLinkCopied(false), 2500);
                                            }}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-[#1e295d] hover:bg-[#1e295d]/80 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                                        >
                                            <Link className="w-3.5 h-3.5" />
                                            {shareLinkCopied ? '✓ Copied!' : 'Copy Share Link'}
                                        </button>
                                        <button
                                            onClick={downloadStandingsImage}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                                        >
                                            <Image className="w-3.5 h-3.5" /> Download Image (Top 25)
                                        </button>
                                    </div>

                                    {/* Admin row */}
                                    <div className="flex flex-wrap gap-2 justify-between items-center pt-3 border-t border-white/5">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to reset standings to the default initial values?")) {
                                                        saveToHistory(standings, totalGiveaways, totalPrizeMoney);
                                                        setStandings(INITIAL_STANDINGS);
                                                        setTotalGiveaways(SEED_TOTAL_GIVEAWAYS);
                                                        setTotalPrizeMoney(SEED_TOTAL_MONEY);
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
                                                        saveToHistory(standings, totalGiveaways, totalPrizeMoney);
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
                                            {history && (
                                                <button
                                                    onClick={undoLastAction}
                                                    className="px-3 py-2 border border-yellow-500/30 hover:bg-yellow-500/10 active:scale-95 text-yellow-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                                                >
                                                    Undo Last Action
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setImportText(""); setShowImportExport(true); }}
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
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
