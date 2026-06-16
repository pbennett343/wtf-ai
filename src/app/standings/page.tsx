'use client';

import { useEffect, useState } from 'react';

interface Player {
    igHandle: string;
    pwa: number;
    w: number;
    l?: number;
    totalWinnings: number;
}

export default function PublicStandingsPage() {
    const [standings, setStandings] = useState<Player[]>([]);
    const [totalGiveaways, setTotalGiveaways] = useState(0);
    const [totalPrizeMoney, setTotalPrizeMoney] = useState(0);
    const [error, setError] = useState('');
    const [generatedAt, setGeneratedAt] = useState('');

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const encoded = params.get('d');
            if (!encoded) { setError('No standings data in URL.'); return; }
            const json = atob(encoded);
            const data = JSON.parse(json);
            if (!data.standings || !Array.isArray(data.standings)) { setError('Invalid standings data.'); return; }
            setStandings(data.standings);
            setTotalGiveaways(data.totalGiveaways ?? 0);
            setTotalPrizeMoney(data.totalPrizeMoney ?? 0);
            setGeneratedAt(data.generatedAt ?? '');
        } catch (e) {
            setError('Could not decode standings data.');
        }
    }, []);

    const sorted = [...standings].sort((a, b) => b.w !== a.w ? b.w - a.w : b.pwa - a.pwa);
    let currentRank = 1;
    const ranked = sorted.map((player, idx) => {
        if (idx > 0) {
            const prev = sorted[idx - 1];
            if (player.w !== prev.w || player.pwa !== prev.pwa) currentRank = idx + 1;
        }
        const rank = currentRank;
        const lCount = player.l ?? (player.pwa - player.w);
        const winPct = player.pwa > 0 ? (player.w / player.pwa) * 100 : 0;
        return { ...player, rank, lCount, winPct };
    });

    if (error) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111114', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#111114', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* Header */}
            <div style={{ background: '#1e295d', padding: '24px 20px', position: 'relative', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                    <img src="/wtf-logo-transparent.png" alt="WTF Logo" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
                </div>
                <h1 style={{ fontSize: 'clamp(20px,5vw,30px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                    2026 WTF GIVEAWAY GAMES
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: '4px 0 0' }}>
                    Live Standings
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 600, marginTop: 20, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    <span>Total Giveaways: {totalGiveaways}</span>
                    <span>${totalPrizeMoney.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>

            {/* Table */}
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>
                {generatedAt && (
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'right', marginBottom: 10 }}>
                        Updated {new Date(generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                )}
                <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#1e295d', color: 'white', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'center', width: 56 }}>#</th>
                                <th style={{ padding: '12px 16px' }}>IG Handle</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>PWA</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>W</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>L</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Win%</th>
                                <th style={{ padding: '12px 24px 12px 16px', textAlign: 'right' }}>$ Won</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranked.map((player, idx) => {
                                const medal = player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : null;
                                const isEven = idx % 2 === 0;
                                return (
                                    <tr key={idx} style={{ background: isEven ? 'white' : '#f8fafc', borderBottom: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b', fontWeight: 900 }}>
                                            {medal ? <span style={{ fontSize: 16 }}>{medal}</span> : player.rank}
                                        </td>
                                        <td style={{ padding: '10px 16px', color: '#1e295d', fontWeight: player.rank <= 3 ? 900 : 700 }}>
                                            @{player.igHandle}
                                        </td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 800 }}>{player.pwa}</td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 800, color: '#15803d' }}>{player.w}</td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 800, color: '#64748b' }}>{player.lCount}</td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 800, color: '#4338ca' }}>{player.winPct.toFixed(2)}%</td>
                                        <td style={{ padding: '10px 24px 10px 16px', textAlign: 'right', fontWeight: 900, color: player.totalWinnings > 0 ? '#047857' : '#94a3b8' }}>
                                            {player.totalWinnings > 0
                                                ? `$${player.totalWinnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                : '—'
                                            }
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 24 }}>
                    WTF Sports · Giveaway Games 2026
                </p>
            </div>
        </div>
    );
}
