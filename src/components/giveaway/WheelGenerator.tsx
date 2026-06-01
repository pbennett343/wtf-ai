'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';

export interface WheelGeneratorRef {
    generateVideo: (names: string[], winner: string) => Promise<string>;
}

// Exact brand colors from config.json
const BRAND_COLORS = ["#b42434", "#3b3b6d", "#ffffff"];

const WheelGenerator = forwardRef<WheelGeneratorRef, {}>((props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
        generateVideo: (names: string[], winner: string) => {
            return new Promise((resolve, reject) => {
                const canvas = canvasRef.current;
                if (!canvas) return reject("No canvas found");

                const ctx = canvas.getContext('2d');
                if (!ctx) return reject("No 2d context");

                const size = 1080;
                const center = size / 2;
                const radius = 450;
                const spinDuration = 8; // seconds
                const celebrationDuration = 4; // seconds
                const totalDuration = spinDuration + celebrationDuration;
                const fps = 24;

                const numSlots = names.length || 1;
                const sliceAngle = (2 * Math.PI) / numSlots;

                // ── Color Assignment (anti-adjacent logic from Python) ──
                const colors: string[] = [];
                for (let i = 0; i < numSlots; i++) {
                    colors.push(BRAND_COLORS[i % BRAND_COLORS.length]);
                }
                // Fix last slice conflict with first slice (ported from Python)
                if (numSlots > 1) {
                    const lastVsPrev = colors[numSlots - 1] === colors[numSlots - 2];
                    const lastVsFirst = colors[numSlots - 1] === colors[0];
                    if (lastVsPrev || lastVsFirst) {
                        const excluded = new Set([colors[0], colors[numSlots - 2]]);
                        for (const candidate of BRAND_COLORS) {
                            if (!excluded.has(candidate)) {
                                colors[numSlots - 1] = candidate;
                                break;
                            }
                        }
                    }
                }

                // ── Winner Physics (dramatic landing from Python) ──
                const winIdx = names.indexOf(winner) >= 0 ? names.indexOf(winner) : 0;

                // Weighted dramatic landings - exactly matching Python
                const rand = Math.random();
                let offset: number;
                if (rand < 0.40) {
                    // near_exit (40%): barely stays on winner — max drama
                    offset = 0.02 + Math.random() * 0.06;
                } else if (rand < 0.80) {
                    // near_enter (40%): barely lands on winner — max drama
                    offset = 0.92 + Math.random() * 0.06;
                } else if (rand < 0.85) {
                    // center (5%): dead center — rare
                    offset = 0.40 + Math.random() * 0.20;
                } else {
                    // off_center (15%): noticeably off-center but not edge
                    offset = Math.random() < 0.5
                        ? 0.15 + Math.random() * 0.15
                        : 0.70 + Math.random() * 0.15;
                }

                const targetCenter = winIdx * sliceAngle + (sliceAngle * offset);
                // For the pointer at 0 radians (3 o'clock), we need the winner slice there
                const finalAdjustment = (2 * Math.PI - targetCenter) % (2 * Math.PI);

                const rotations = 5 + Math.floor(Math.random() * 5); // 5–9 full rotations
                const totalRotation = rotations * 2 * Math.PI + finalAdjustment;

                const easingPower = [4, 5, 6, 7][Math.floor(Math.random() * 4)];

                // ── Draw helpers ──
                const fitText = (text: string, maxWidth: number, maxHeight: number): number => {
                    let size = 40;
                    while (size >= 10) {
                        ctx.font = `bold ${size}px sans-serif`;
                        const metrics = ctx.measureText(text);
                        const w = metrics.width;
                        const h = size * 1.2;
                        if (w <= maxWidth * 0.90 && h <= maxHeight * 0.95) return size;
                        size -= 2;
                    }
                    return 10;
                };

                const drawWheel = (angle: number) => {
                    ctx.save();
                    ctx.translate(center, center);
                    ctx.rotate(-angle);

                    const textRadius = radius * 0.65;
                    const maxTextWidth = radius * 0.50;
                    const maxTextHeight = 2 * textRadius * Math.sin(sliceAngle / 2) * 0.8;

                    for (let i = 0; i < numSlots; i++) {
                        const startAngle = i * sliceAngle;
                        const endAngle = (i + 1) * sliceAngle;
                        const color = colors[i];

                        // Draw slice
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.arc(0, 0, radius, startAngle, endAngle);
                        ctx.closePath();
                        ctx.fillStyle = color;
                        ctx.fill();

                        // Draw text along radius
                        ctx.save();
                        const midAngle = startAngle + sliceAngle / 2;
                        ctx.rotate(midAngle);

                        const fontSize = fitText(names[i], maxTextWidth, maxTextHeight);
                        ctx.font = `bold ${fontSize}px sans-serif`;
                        ctx.textAlign = "right";
                        ctx.textBaseline = "middle";
                        ctx.fillStyle = color === "#ffffff" ? "#000000" : "#ffffff";
                        ctx.fillText(names[i], radius * 0.92, 0);
                        ctx.restore();
                    }

                    // White donut hole (25% of radius, matching Python)
                    ctx.beginPath();
                    ctx.arc(0, 0, radius * 0.25, 0, 2 * Math.PI);
                    ctx.fillStyle = "#ffffff";
                    ctx.fill();

                    ctx.restore();
                };

                const drawPointer = () => {
                    const px = center + radius + 10;
                    const py = center;
                    ctx.beginPath();
                    ctx.moveTo(px - 10, py);
                    ctx.lineTo(px + 40, py - 20);
                    ctx.lineTo(px + 40, py + 20);
                    ctx.closePath();
                    ctx.fillStyle = "#ffffff";
                    ctx.fill();
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "#000000";
                    ctx.stroke();
                };

                const drawCelebration = (lastAngle: number) => {
                    // Redraw the stopped wheel as background
                    ctx.fillStyle = "#111114";
                    ctx.fillRect(0, 0, size, size);
                    drawWheel(lastAngle);
                    drawPointer();

                    // Semi-transparent overlay
                    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
                    ctx.fillRect(0, 0, size, size);

                    // Winner card
                    const cardW = 800;
                    const cardH = 400;
                    const cardX = (size - cardW) / 2;
                    const cardY = (size - cardH) / 2;
                    const cornerR = 20;

                    // Rounded rect
                    ctx.beginPath();
                    ctx.moveTo(cardX + cornerR, cardY);
                    ctx.lineTo(cardX + cardW - cornerR, cardY);
                    ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + cornerR, cornerR);
                    ctx.lineTo(cardX + cardW, cardY + cardH - cornerR);
                    ctx.arcTo(cardX + cardW, cardY + cardH, cardX + cardW - cornerR, cardY + cardH, cornerR);
                    ctx.lineTo(cardX + cornerR, cardY + cardH);
                    ctx.arcTo(cardX, cardY + cardH, cardX, cardY + cardH - cornerR, cornerR);
                    ctx.lineTo(cardX, cardY + cornerR);
                    ctx.arcTo(cardX, cardY, cardX + cornerR, cardY, cornerR);
                    ctx.closePath();
                    ctx.fillStyle = "#1a1a1a";
                    ctx.fill();

                    // Red header (top 35%)
                    const headerH = cardH * 0.35;
                    ctx.beginPath();
                    ctx.moveTo(cardX + cornerR, cardY);
                    ctx.lineTo(cardX + cardW - cornerR, cardY);
                    ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + cornerR, cornerR);
                    ctx.lineTo(cardX + cardW, cardY + headerH);
                    ctx.lineTo(cardX, cardY + headerH);
                    ctx.lineTo(cardX, cardY + cornerR);
                    ctx.arcTo(cardX, cardY, cardX + cornerR, cardY, cornerR);
                    ctx.closePath();
                    ctx.fillStyle = "#b42434";
                    ctx.fill();

                    // Header text
                    ctx.fillStyle = "#ffffff";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.font = "bold 60px sans-serif";
                    ctx.fillText("congrats!", center, cardY + headerH / 2);

                    // Winner name (dynamic sizing)
                    const maxNameWidth = cardW - 40;
                    let nameFontSize = 90;
                    ctx.font = `bold ${nameFontSize}px sans-serif`;
                    while (ctx.measureText(winner).width > maxNameWidth && nameFontSize > 20) {
                        nameFontSize -= 5;
                        ctx.font = `bold ${nameFontSize}px sans-serif`;
                    }
                    const bodyCenter = cardY + headerH + (cardH - headerH) / 2;
                    ctx.fillText(winner, center, bodyCenter);

                    // Confetti particles
                    for (let i = 0; i < 80; i++) {
                        const cx = Math.random() * size;
                        const cy = Math.random() * size;
                        const cw = 8 + Math.random() * 14;
                        const ch = 8 + Math.random() * 14;
                        ctx.fillStyle = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];
                        ctx.fillRect(cx, cy, cw, ch);
                    }
                };

                // ── MediaRecorder Setup ──
                const stream = canvas.captureStream(fps);
                let mimeType = 'video/webm';
                if (MediaRecorder.isTypeSupported('video/mp4')) {
                    mimeType = 'video/mp4';
                }

                let mediaRecorder: MediaRecorder;
                try {
                    mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
                } catch (e) {
                    mediaRecorder = new MediaRecorder(stream);
                }

                const chunks: BlobPart[] = [];
                mediaRecorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) chunks.push(e.data);
                };

                mediaRecorder.onstop = () => {
                    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
                    const blob = new Blob(chunks, { type: mimeType });
                    const url = URL.createObjectURL(blob);
                    resolve(url);
                };

                mediaRecorder.start();

                // ── Animation Loop ──
                const startTime = performance.now();
                const spinMs = spinDuration * 1000;
                const totalMs = totalDuration * 1000;
                let finalAngle = 0;

                const drawFrame = (time: number) => {
                    const elapsed = time - startTime;

                    ctx.fillStyle = "#111114";
                    ctx.fillRect(0, 0, size, size);

                    if (elapsed < spinMs) {
                        // Spinning phase
                        const tn = elapsed / spinMs;
                        const progress = 1 - Math.pow(1 - tn, easingPower);
                        const currentAngle = progress * totalRotation;
                        finalAngle = currentAngle;

                        drawWheel(currentAngle);
                        drawPointer();
                        requestAnimationFrame(drawFrame);
                    } else if (elapsed < totalMs) {
                        // Celebration phase
                        drawCelebration(finalAngle);
                        requestAnimationFrame(drawFrame);
                    } else {
                        // Done — draw one last frame and stop
                        drawCelebration(finalAngle);
                        mediaRecorder.stop();
                    }
                };

                requestAnimationFrame(drawFrame);
            });
        }
    }));

    return (
        <canvas
            ref={canvasRef}
            width={1080}
            height={1080}
            style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}
        />
    );
});

WheelGenerator.displayName = "WheelGenerator";

export default WheelGenerator;
