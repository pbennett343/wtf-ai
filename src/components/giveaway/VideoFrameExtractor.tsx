'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Scissors, CheckCircle, AlertCircle } from 'lucide-react';

interface VideoFrameExtractorProps {
    file: File;
    onFramesExtracted: (frames: string[]) => void;
    onComplete: () => void;
    interval?: number; // In seconds
}

export default function VideoFrameExtractor({
    file,
    onFramesExtracted,
    onComplete,
    interval = 2
}: VideoFrameExtractorProps) {
    const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [frameCount, setFrameCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startProcessing = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setStatus('processing');
        setError(null);
        setFrameCount(0);
        setProgress(0);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            setError("Could not initialize canvas context");
            setStatus('error');
            return;
        }

        const duration = video.duration;
        const extractedFrames: string[] = [];

        let currentTime = 0;

        try {
            while (currentTime <= duration) {
                // Seek to the timestamp if needed
                if (Math.abs(video.currentTime - currentTime) > 0.01) {
                    video.currentTime = currentTime;

                    // Wait for seek to complete with a fallback timeout
                    await new Promise((resolve) => {
                        let isResolved = false;
                        const onSeeked = () => {
                            if (isResolved) return;
                            isResolved = true;
                            video.removeEventListener('seeked', onSeeked);
                            resolve(null);
                        };
                        video.addEventListener('seeked', onSeeked);

                        // Fallback timeout in case seeked event doesn't fire
                        setTimeout(() => {
                            if (isResolved) return;
                            isResolved = true;
                            video.removeEventListener('seeked', onSeeked);
                            resolve(null);
                        }, 500); // 500ms fallback
                    });
                } else {
                    // Slight delay to ensure frame is renderable if we didn't seek
                    await new Promise(r => setTimeout(r, 50));
                }

                // Draw to canvas
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Get data URL
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                extractedFrames.push(dataUrl);

                setFrameCount(prev => prev + 1);
                setProgress(Math.round((currentTime / duration) * 100));

                currentTime += interval;
            }

            onFramesExtracted(extractedFrames);
            setStatus('completed');
            setProgress(100);
            onComplete();

        } catch (err) {
            console.error("Video processing error:", err);
            setError("An error occurred while scanning the video.");
            setStatus('error');
        }
    };

    const videoUrl = React.useMemo(() => URL.createObjectURL(file), [file]);

    return (
        <div className="bg-white/5 rounded-3xl p-8 border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-black italic uppercase tracking-wider text-lg text-white">Video Scanner</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Extracting frames every {interval} seconds
                    </p>
                </div>
                {status === 'processing' && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#b42434]/50 text-white rounded-full border border-white/5 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Scanning...</span>
                    </div>
                )}
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/5">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    muted
                    playsInline
                />
                <canvas ref={canvasRef} className="hidden" />

                {status === 'idle' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <button
                            onClick={startProcessing}
                            className="bg-[#b42434] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center gap-3 shadow-2xl"
                        >
                            <Scissors className="w-5 h-5" />
                            Start Scanning
                        </button>
                    </div>
                )}

                {status === 'processing' && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Progress: {progress}%</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{frameCount} frames caught</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#b42434] transition-all duration-300 shadow-[0_0_10px_rgba(180,36,52,0.5)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {status === 'completed' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-4">
                    <div className="bg-green-500 p-2 rounded-xl text-black">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase text-green-500">Scan Complete</p>
                        <p className="text-[10px] text-gray-400 font-bold">Successfully extracted {frameCount} frames from the video.</p>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
                    <div className="bg-red-500 p-2 rounded-xl text-black">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase text-red-500">Scan Failed</p>
                        <p className="text-[10px] text-gray-400 font-bold">{error}</p>
                    </div>
                    <button
                        onClick={() => setStatus('idle')}
                        className="ml-auto text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}
