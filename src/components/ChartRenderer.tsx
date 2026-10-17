"use client";
import React from "react";

/* ─── ESPN logo helper ─── */
const teamLogoUrl = (abbr: string, league?: string) => {
    const l = (league || "mlb").toLowerCase();
    const sport = l.includes("nfl") ? "nfl" : l.includes("nba") ? "nba" : l.includes("ncaa") || l.includes("college") ? "college-football" : "mlb";
    return `https://a.espncdn.com/i/teamlogos/${sport}/500/scoreboard/${abbr.toLowerCase()}.png`;
};

const Logo = ({ abbr, league, size = 120 }: { abbr: string; league?: string; size?: number }) => (
    <img
        src={teamLogoUrl(abbr, league)}
        alt={abbr}
        style={{ width: size, height: size, objectFit: "contain" }}
        crossOrigin="anonymous"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
);

/* ─── Shared card wrapper — white bg, rounded, blurred shadow ─── */
const ChartCard = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ padding: "120px 120px 160px 120px" }}>
        <div style={{
            background: "#ffffff",
            borderRadius: 60,
            boxShadow: "0 40px 120px rgba(0,0,0,0.35), 0 8px 40px rgba(0,0,0,0.15)",
            padding: "70px 80px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            color: "#1a1a1a",
            ...style,
        }}>
            {children}
        </div>
    </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 52, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#222", marginBottom: 40 }}>{children}</div>
);

/* ═════════════════════════════════════════════════════
   1. PLAYER STATS ROW
   ═════════════════════════════════════════════════════ */
const PlayerStatsRow = ({ data }: { data: any }) => (
    <ChartCard>
        {data.title && <SectionTitle>{data.title}</SectionTitle>}
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", borderBottom: "3px solid #e5e5e5", paddingBottom: 30, marginBottom: 30 }}>
            <div style={{ flex: 1, fontSize: 48, fontWeight: 400, color: "#666" }}>Player</div>
            {data.columns?.map((col: string, i: number) => (
                <div key={i} style={{ width: 200, textAlign: "center", fontSize: 42, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>{col}</div>
            ))}
        </div>
        {/* Row */}
        <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1, fontSize: 58, fontWeight: 700, color: "#111" }}>
                {data.playerNumber && <span style={{ color: "#999", marginRight: 20 }}>{data.playerNumber}</span>}
                {data.playerName}
            </div>
            {data.values?.map((val: string, i: number) => (
                <div key={i} style={{ width: 200, textAlign: "center", fontSize: 56, fontWeight: 800, color: "#111" }}>{val}</div>
            ))}
        </div>
    </ChartCard>
);

/* ═════════════════════════════════════════════════════
   2. GAME LOG TABLE
   ═════════════════════════════════════════════════════ */
const GameLogTable = ({ data }: { data: any }) => (
    <ChartCard>
        {data.title && <SectionTitle>{data.title}</SectionTitle>}
        {data.subtitle && <div style={{ fontSize: 38, color: "#888", fontWeight: 600, marginTop: -30, marginBottom: 40, textTransform: "uppercase", letterSpacing: "0.1em" }}>{data.subtitle}</div>}
        {/* Header */}
        <div style={{ display: "flex", borderBottom: "3px solid #e0e0e0", paddingBottom: 24, marginBottom: 20 }}>
            {data.headerColumns?.map((col: string, i: number) => (
                <div key={i} style={{ flex: i === 0 ? 1.5 : i === 1 ? 2 : 1, fontSize: 36, fontWeight: 800, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: i > 1 ? "center" : "left" }}>{col}</div>
            ))}
        </div>
        {/* Rows */}
        {data.rows?.map((row: any, idx: number) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", padding: "18px 0", borderBottom: idx < data.rows.length - 1 ? "1px solid #f0f0f0" : "none", background: row.isHighlight ? "rgba(180,36,52,0.06)" : "transparent", borderRadius: 16, paddingLeft: 12, paddingRight: 12 }}>
                {row.cells?.map((cell: string, ci: number) => (
                    <div key={ci} style={{ flex: ci === 0 ? 1.5 : ci === 1 ? 2 : 1, fontSize: 42, fontWeight: ci >= 2 ? 700 : 500, color: cell.startsWith("W") && ci === 2 ? "#16a34a" : cell.startsWith("L") && ci === 2 ? "#dc2626" : "#333", textAlign: ci > 1 ? "center" : "left" }}>{cell}</div>
                ))}
            </div>
        ))}
        {/* Total row */}
        {data.totalRow && (
            <div style={{ display: "flex", alignItems: "center", padding: "24px 12px 0 12px", borderTop: "3px solid #e0e0e0", marginTop: 12 }}>
                {data.totalRow.map((cell: string, ci: number) => (
                    <div key={ci} style={{ flex: ci === 0 ? 1.5 : ci === 1 ? 2 : 1, fontSize: 44, fontWeight: 900, color: "#b42434", textAlign: ci > 1 ? "center" : "left" }}>{cell}</div>
                ))}
            </div>
        )}
    </ChartCard>
);

/* ═════════════════════════════════════════════════════
   3. BOX SCORE
   ═════════════════════════════════════════════════════ */
const BoxScore = ({ data }: { data: any }) => (
    <ChartCard>
        {/* Header logos */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 50 }}>
            <Logo abbr={data.awayAbbr} league={data.league} size={140} />
            <div style={{ fontSize: 40, fontWeight: 600, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.15em" }}>vs</div>
            <Logo abbr={data.homeAbbr} league={data.league} size={140} />
        </div>
        {/* Stat rows */}
        {data.rows?.map((row: any, idx: number) => {
            const awayNum = parseFloat(row.awayValue) || 0;
            const homeNum = parseFloat(row.homeValue) || 0;
            const maxVal = Math.max(awayNum, homeNum, 1);
            return (
                <div key={idx} style={{ marginBottom: 24 }}>
                    <div style={{ textAlign: "center", fontSize: 34, fontWeight: 600, color: "#999", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>{row.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <div style={{ width: 160, textAlign: "right", fontSize: 50, fontWeight: 800, color: row.awayHighlight ? "#b42434" : "#333" }}>{row.awayValue}</div>
                        <div style={{ flex: 1, display: "flex", gap: 6 }}>
                            <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                                <div style={{ width: `${(awayNum / maxVal) * 100}%`, height: 28, background: row.awayHighlight ? "#b42434" : "#c5c5c5", borderRadius: 14 }}></div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ width: `${(homeNum / maxVal) * 100}%`, height: 28, background: row.homeHighlight ? "#b42434" : "#c5c5c5", borderRadius: 14 }}></div>
                            </div>
                        </div>
                        <div style={{ width: 160, textAlign: "left", fontSize: 50, fontWeight: 800, color: row.homeHighlight ? "#b42434" : "#333" }}>{row.homeValue}</div>
                    </div>
                </div>
            );
        })}
    </ChartCard>
);

/* ═════════════════════════════════════════════════════
   4. SERIES SUMMARY
   ═════════════════════════════════════════════════════ */
const SeriesSummary = ({ data }: { data: any }) => (
    <ChartCard>
        {data.title && <SectionTitle>{data.title}</SectionTitle>}
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            {data.games?.map((g: any, idx: number) => (
                <div key={idx} style={{ borderBottom: idx < data.games.length - 1 ? "2px solid #f0f0f0" : "none", paddingBottom: 30 }}>
                    <div style={{ fontSize: 34, color: "#999", fontWeight: 600, marginBottom: 16 }}>{g.label}</div>
                    {/* Away */}
                    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 12 }}>
                        <Logo abbr={g.awayAbbr} league={data.league} size={80} />
                        <div style={{ flex: 1, fontSize: 48, fontWeight: g.winnerSide === "away" ? 900 : 500, color: g.winnerSide === "away" ? "#111" : "#888" }}>{g.awayName}</div>
                        <div style={{ fontSize: 52, fontWeight: g.winnerSide === "away" ? 900 : 500, color: g.winnerSide === "away" ? "#111" : "#888" }}>{g.awayScore}</div>
                        {g.winnerSide === "away" && <span style={{ fontSize: 36, color: "#111" }}>◀</span>}
                    </div>
                    {/* Home */}
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <Logo abbr={g.homeAbbr} league={data.league} size={80} />
                        <div style={{ flex: 1, fontSize: 48, fontWeight: g.winnerSide === "home" ? 900 : 500, color: g.winnerSide === "home" ? "#111" : "#888" }}>{g.homeName}</div>
                        <div style={{ fontSize: 52, fontWeight: g.winnerSide === "home" ? 900 : 500, color: g.winnerSide === "home" ? "#111" : "#888" }}>{g.homeScore}</div>
                        {g.winnerSide === "home" && <span style={{ fontSize: 36, color: "#111" }}>◀</span>}
                    </div>
                </div>
            ))}
        </div>
    </ChartCard>
);

/* ═════════════════════════════════════════════════════
   5. SEASON STATS BOX
   ═════════════════════════════════════════════════════ */
const SeasonStatsBox = ({ data }: { data: any }) => (
    <ChartCard style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ background: data.headerColor || "#c84b31", padding: "32px 60px", textAlign: "center" }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.12em" }}>{data.title}</div>
        </div>
        <div style={{ display: "flex", padding: "50px 40px 30px" }}>
            {data.stats?.map((s: any, i: number) => (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 34, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{s.label}</div>
                    <div style={{ fontSize: 80, fontWeight: 900, color: "#111", lineHeight: 1 }}>{s.value}</div>
                    {s.rank && <div style={{ fontSize: 30, fontWeight: 500, color: "#aaa", marginTop: 10 }}>{s.rank}</div>}
                </div>
            ))}
        </div>
    </ChartCard>
);

/* ═════════════════════════════════════════════════════
   6. RANKING TABLE
   ═════════════════════════════════════════════════════ */
const RankingTable = ({ data }: { data: any }) => (
    <ChartCard>
        {data.title && <SectionTitle>{data.title}</SectionTitle>}
        {/* Header */}
        <div style={{ display: "flex", borderBottom: "3px solid #e0e0e0", paddingBottom: 20, marginBottom: 20 }}>
            <div style={{ flex: 1, fontSize: 38, fontWeight: 800, color: "#888", textTransform: "uppercase" }}>{data.columns?.[0] || "Team"}</div>
            <div style={{ width: 180, textAlign: "right", fontSize: 38, fontWeight: 800, color: "#888", textTransform: "uppercase" }}>{data.columns?.[1] || "Value"}</div>
        </div>
        {data.rows?.map((row: any, idx: number) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", padding: "16px 0", borderBottom: idx < data.rows.length - 1 ? "1px solid #f0f0f0" : "none", background: row.isHighlight ? "rgba(180,36,52,0.06)" : "transparent", borderRadius: 12, paddingLeft: 8, paddingRight: 8 }}>
                {row.logoAbbr && <Logo abbr={row.logoAbbr} league={row.league} size={64} />}
                <div style={{ flex: 1, fontSize: 44, fontWeight: 600, color: "#222", marginLeft: row.logoAbbr ? 20 : 0 }}>{row.name}</div>
                <div style={{ width: 180, textAlign: "right", fontSize: 48, fontWeight: 900, color: row.isHighlight ? "#b42434" : "#111" }}>{row.value}</div>
            </div>
        ))}
    </ChartCard>
);

/* ═════════════════════════════════════════════════════
   7. SCORE GRID
   ═════════════════════════════════════════════════════ */
const ScoreGrid = ({ data }: { data: any }) => (
    <ChartCard>
        {data.title && <SectionTitle>{data.title}</SectionTitle>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
            {data.games?.map((g: any, idx: number) => (
                <div key={idx} style={{ border: "2px solid #eee", borderRadius: 30, padding: "30px 40px" }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "#999", textTransform: "uppercase", marginBottom: 20 }}>{g.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                        <Logo abbr={g.awayAbbr} league={data.league} size={56} />
                        <div style={{ flex: 1, fontSize: 40, fontWeight: 600, color: "#444" }}>{g.awayAbbr?.toUpperCase()}</div>
                        <div style={{ fontSize: 48, fontWeight: 900, color: "#111" }}>{g.awayScore}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <Logo abbr={g.homeAbbr} league={data.league} size={56} />
                        <div style={{ flex: 1, fontSize: 40, fontWeight: 600, color: "#444" }}>{g.homeAbbr?.toUpperCase()}</div>
                        <div style={{ fontSize: 48, fontWeight: 900, color: "#111" }}>{g.homeScore}</div>
                    </div>
                    {g.extra && <div style={{ fontSize: 28, color: "#999", marginTop: 10 }}>{g.extra}</div>}
                </div>
            ))}
        </div>
    </ChartCard>
);

/* ═════════════════════════════════════════════════════
   8. HEAD TO HEAD
   ═════════════════════════════════════════════════════ */
const HeadToHead = ({ data }: { data: any }) => (
    <ChartCard style={{ padding: 0, overflow: "hidden" }}>
        {/* Team headers */}
        <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}></div>
            <div style={{ flex: 1, background: "#2d2d54", padding: "40px 30px", textAlign: "center" }}>
                <Logo abbr={data.leftAbbr} league={data.league} size={100} />
                <div style={{ fontSize: 38, fontWeight: 900, color: "#fff", marginTop: 12 }}>{data.leftHeader}</div>
                {data.subLeft && <div style={{ fontSize: 28, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{data.subLeft}</div>}
            </div>
            <div style={{ flex: 1, background: "#d4a017", padding: "40px 30px", textAlign: "center" }}>
                <Logo abbr={data.rightAbbr} league={data.league} size={100} />
                <div style={{ fontSize: 38, fontWeight: 900, color: "#fff", marginTop: 12 }}>{data.rightHeader}</div>
                {data.subRight && <div style={{ fontSize: 28, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{data.subRight}</div>}
            </div>
        </div>
        {/* Stat rows */}
        <div style={{ padding: "20px 60px 50px" }}>
            {data.rows?.map((row: any, idx: number) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", padding: "18px 0", borderBottom: idx < data.rows.length - 1 ? "1px solid #eee" : "none" }}>
                    <div style={{ flex: 1, fontSize: 40, fontWeight: 700, color: "#333" }}>{row.label}</div>
                    <div style={{ flex: 1, textAlign: "center", fontSize: 46, fontWeight: 800, color: row.highlight ? "#16a34a" : "#111" }}>{row.leftValue}</div>
                    <div style={{ flex: 1, textAlign: "center", fontSize: 46, fontWeight: 800, color: row.highlight ? "#16a34a" : "#111" }}>{row.rightValue}</div>
                </div>
            ))}
        </div>
    </ChartCard>
);

/* ═════════════════════════════════════════════════════
   9. SERIES BADGE
   ═════════════════════════════════════════════════════ */
const SeriesBadge = ({ data }: { data: any }) => (
    <ChartCard style={{ padding: "50px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 50 }}>
            <Logo abbr={data.leftAbbr} league={data.league} size={160} />
            <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
                <span style={{ fontSize: 120, fontWeight: 900, color: data.leftColor || (parseInt(data.leftScore) > parseInt(data.rightScore) ? "#16a34a" : "#dc2626") }}>{data.leftScore}</span>
                <span style={{ fontSize: 80, fontWeight: 300, color: "#ccc" }}>-</span>
                <span style={{ fontSize: 120, fontWeight: 900, color: data.rightColor || (parseInt(data.rightScore) > parseInt(data.leftScore) ? "#16a34a" : "#dc2626") }}>{data.rightScore}</span>
            </div>
            <Logo abbr={data.rightAbbr} league={data.league} size={160} />
        </div>
    </ChartCard>
);

/* ═════════════════════════════════════════════════════
   10. CONTEXT TABLE (legacy upgrade)
   ═════════════════════════════════════════════════════ */
const ContextTable = ({ data }: { data: any }) => (
    <ChartCard>
        {data.title && (
            <div style={{ textAlign: "center", marginBottom: 50 }}>
                <div style={{ fontSize: 56, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em", color: "#111" }}>{data.title}</div>
                {data.subtitle && <div style={{ fontSize: 36, fontWeight: 600, color: "#999", marginTop: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>{data.subtitle}</div>}
            </div>
        )}
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", borderBottom: "3px solid #e0e0e0", paddingBottom: 24, marginBottom: 20 }}>
            <div style={{ width: 100, fontSize: 32, fontWeight: 800, color: "#bbb", textTransform: "uppercase" }}>{data.columns?.[0] || "#"}</div>
            <div style={{ flex: 1, fontSize: 32, fontWeight: 800, color: "#bbb", textTransform: "uppercase" }}>{data.columns?.[1] || "Player"}</div>
            <div style={{ width: 280, textAlign: "center", fontSize: 32, fontWeight: 800, color: "#bbb", textTransform: "uppercase" }}>{data.columns?.[2] || "Team"}</div>
            <div style={{ width: 260, textAlign: "center", fontSize: 32, fontWeight: 800, color: "#bbb", textTransform: "uppercase" }}>{data.columns?.[3] || "Date"}</div>
            <div style={{ width: 220, textAlign: "right", fontSize: 32, fontWeight: 800, color: "#bbb", textTransform: "uppercase" }}>{data.columns?.[4] || "Stat"}</div>
        </div>
        {/* Rows */}
        {data.rows?.map((row: any, idx: number) => {
            const isHL = row.isHighlight || (data.highlight && row.player?.includes(data.highlight));
            return (
                <div key={idx} style={{ display: "flex", alignItems: "center", padding: "16px 10px", borderRadius: 20, background: isHL ? "rgba(180,36,52,0.06)" : "transparent", border: isHL ? "3px solid rgba(180,36,52,0.3)" : "3px solid transparent", marginBottom: 8 }}>
                    <div style={{ width: 100, fontSize: 44, fontWeight: 700, color: "#999" }}>{row.rank || idx + 1}</div>
                    <div style={{ flex: 1, fontSize: 48, fontWeight: 800, color: "#111", textTransform: "uppercase", lineHeight: 1.1 }}>{row.player}</div>
                    <div style={{ width: 280, display: "flex", justifyContent: "center" }}>
                        {row.teamAbbr ? <Logo abbr={row.teamAbbr} league={data.league} size={90} /> : <span style={{ fontSize: 38, color: "#666" }}>{row.team}</span>}
                    </div>
                    <div style={{ width: 260, textAlign: "center", fontSize: 38, fontWeight: 600, color: "#888" }}>{row.date}</div>
                    <div style={{ width: 220, textAlign: "right", fontSize: 52, fontWeight: 900, color: "#b42434" }}>{row.value}</div>
                </div>
            );
        })}
        {data.footnote && <div style={{ fontSize: 30, fontStyle: "italic", color: "#bbb", textAlign: "right", marginTop: 30 }}>{data.footnote}</div>}
    </ChartCard>
);

/* ═════════════════════════════════════════════════════
   CHART ROUTER — renders the correct chart type
   ═════════════════════════════════════════════════════ */
export default function ChartRenderer({ chartType, data }: { chartType: string; data: any }) {
    switch (chartType) {
        case "player-stats-row": return <PlayerStatsRow data={data} />;
        case "game-log": return <GameLogTable data={data} />;
        case "box-score": return <BoxScore data={data} />;
        case "series-summary": return <SeriesSummary data={data} />;
        case "season-stats-box": return <SeasonStatsBox data={data} />;
        case "ranking-table": return <RankingTable data={data} />;
        case "score-grid": return <ScoreGrid data={data} />;
        case "head-to-head": return <HeadToHead data={data} />;
        case "series-badge": return <SeriesBadge data={data} />;
        case "context-table": return <ContextTable data={data} />;
        default: return <ContextTable data={data} />;
    }
}
