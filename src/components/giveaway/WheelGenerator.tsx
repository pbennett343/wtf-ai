'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';

export interface WheelGeneratorRef {
    generateVideo: (names: string[], winner: string) => Promise<string>;
}

const BRAND_COLORS = ["#b42434", "#ffffff"];

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
                const durationSeconds = 8;
                const fps = 30;

                // Setup MediaRecorder
                // Request 30 fps stream
                const stream = canvas.captureStream(fps);
                
                // Fallback to webm if mp4 is not supported
                let mimeType = 'video/mp4';
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'video/webm';
                }

                let mediaRecorder: MediaRecorder;
                try {
                    mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
                } catch (e) {
                    // Safari might need just video/mp4 without codecs
                    mediaRecorder = new MediaRecorder(stream);
                }

                const chunks: BlobPart[] = [];
                mediaRecorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) chunks.push(e.data);
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: mimeType });
                    const url = URL.createObjectURL(blob);
                    resolve(url);
                };

                mediaRecorder.start();

                const numSlots = names.length || 1;
                const sliceAngle = (2 * Math.PI) / numSlots;

                const winIdx = names.indexOf(winner) >= 0 ? names.indexOf(winner) : 0;
                
                // Physics:
                // We want the winner slice to land at 3 o'clock (0 radians)
                // Slice i goes from i*sliceAngle to (i+1)*sliceAngle
                // Center of slice is (i + 0.5) * sliceAngle
                const targetCenter = (winIdx + 0.5) * sliceAngle;
                
                // Add some random offset within the slice
                const offset = (Math.random() - 0.5) * (sliceAngle * 0.8); // 80% of slice width to avoid edge
                const finalAnglePosition = targetCenter + offset;

                // We spin multiple times
                const rotations = 5 + Math.random() * 4; // 5 to 9 rotations
                const totalRotationAmount = (rotations * 2 * Math.PI) + (2 * Math.PI - finalAnglePosition);

                const startTime = performance.now();
                const durationMs = durationSeconds * 1000;

                const drawFrame = (time: number) => {
                    let elapsed = time - startTime;
                    if (elapsed > durationMs) elapsed = durationMs;

                    const tn = elapsed / durationMs;
                    // Easing out cubic
                    const progress = 1 - Math.pow(1 - tn, 4);
                    
                    const currentAngle = progress * totalRotationAmount;

                    // Clear
                    ctx.fillStyle = "#111114"; // background
                    ctx.fillRect(0, 0, size, size);

                    // Draw Wheel
                    ctx.save();
                    ctx.translate(center, center);
                    // The wheel rotates CCW conceptually in math, but canvas rotate is CW.
                    // We'll rotate negative to simulate CW spin if desired, but let's just do positive.
                    ctx.rotate(-currentAngle);

                    for (let i = 0; i < numSlots; i++) {
                        const startAngle = i * sliceAngle;
                        const endAngle = (i + 1) * sliceAngle;
                        const color = BRAND_COLORS[i % BRAND_COLORS.length];

                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.arc(0, 0, radius, startAngle, endAngle);
                        ctx.closePath();
                        ctx.fillStyle = color;
                        ctx.fill();
                        ctx.lineWidth = 4;
                        ctx.strokeStyle = "#111114";
                        ctx.stroke();

                        // Draw Text
                        ctx.save();
                        const midAngle = startAngle + sliceAngle / 2;
                        ctx.rotate(midAngle);
                        ctx.textAlign = "right";
                        ctx.textBaseline = "middle";
                        ctx.fillStyle = color === "#ffffff" ? "#000000" : "#ffffff";
                        
                        // Fit text
                        let fontSize = 40;
                        ctx.font = `bold ${fontSize}px sans-serif`;
                        let text = names[i];
                        while (ctx.measureText(text).width > radius * 0.7 && fontSize > 15) {
                            fontSize -= 2;
                            ctx.font = `bold ${fontSize}px sans-serif`;
                        }

                        // Position at 90% of radius
                        ctx.fillText(text, radius * 0.9, 0);
                        ctx.restore();
                    }

                    // Donut hole
                    ctx.beginPath();
                    ctx.arc(0, 0, radius * 0.25, 0, 2 * Math.PI);
                    ctx.fillStyle = "#ffffff";
                    ctx.fill();
                    ctx.lineWidth = 6;
                    ctx.strokeStyle = "#111114";
                    ctx.stroke();
                    
                    ctx.restore();

                    // Draw Pointer at 3 o'clock (Right edge of wheel)
                    ctx.save();
                    ctx.translate(center + radius + 10, center);
                    ctx.beginPath();
                    ctx.moveTo(-10, 0);
                    ctx.lineTo(30, -20);
                    ctx.lineTo(30, 20);
                    ctx.closePath();
                    ctx.fillStyle = "#ffffff";
                    ctx.fill();
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = "#000000";
                    ctx.stroke();
                    ctx.restore();

                    // Celebration Overlay
                    if (elapsed >= durationMs) {
                        // Draw congrats
                        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                        ctx.fillRect(0, 0, size, size);

                        ctx.fillStyle = "#b42434";
                        ctx.fillRect(140, 340, 800, 400); // Back card
                        ctx.lineWidth = 10;
                        ctx.strokeStyle = "#ffffff";
                        ctx.strokeRect(140, 340, 800, 400);

                        ctx.fillStyle = "#ffffff";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        
                        ctx.font = "bold 60px sans-serif";
                        ctx.fillText("CONGRATS!", center, 420);
                        
                        ctx.font = "bold 90px sans-serif";
                        ctx.fillText(winner, center, 560);
                    }

                    if (elapsed < durationMs) {
                        requestAnimationFrame(drawFrame);
                    } else {
                        // Hold celebration for 3 seconds
                        let holdStart = performance.now();
                        const holdFrame = (ht: number) => {
                            if (ht - holdStart < 3000) {
                                // Keep redrawing same frame or confetti could go here
                                // For now just hold
                                requestAnimationFrame(holdFrame);
                            } else {
                                mediaRecorder.stop();
                            }
                        };
                        requestAnimationFrame(holdFrame);
                    }
                };

                requestAnimationFrame(drawFrame);
            });
        }
    }));

    // Must be in DOM but invisible to use requestAnimationFrame properly
    // Absolute position off-screen
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
