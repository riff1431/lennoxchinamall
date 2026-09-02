"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export interface ReelsVideoData {
  title: string;
  subtitle?: string;
  productLink?: string;
  productPrice?: number;
  hub?: string;
  tag?: string;
  videoUrl?: string;
  poster?: string;
}

export interface ReelsVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoData: ReelsVideoData | null;
}

export function ReelsVideoModal({ isOpen, onClose, videoData }: ReelsVideoModalProps) {
  const { isSpanish } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tapAnimation, setTapAnimation] = useState<"play" | "pause" | null>(null);
  const [hasVideoError, setHasVideoError] = useState(false);

  // Derive sources for maximum cross-platform browser compatibility
  const rawUrl = videoData?.videoUrl || "/videos/hero/hero_ad_1.mp4";
  const mp4Url = rawUrl.endsWith(".mov") ? rawUrl.replace(/\.mov$/i, ".mp4") : rawUrl;
  const movUrl = rawUrl.endsWith(".mp4") ? rawUrl.replace(/\.mp4$/i, ".mov") : rawUrl;

  const attemptPlay = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      videoRef.current.muted = isMuted;
      await videoRef.current.play();
      setIsPlaying(true);
      setHasVideoError(false);
    } catch (unmutedErr) {
      // Browser autoplay policy blocked unmuted sound -> switch to muted autoplay
      if (videoRef.current) {
        videoRef.current.muted = true;
        setIsMuted(true);
        try {
          await videoRef.current.play();
          setIsPlaying(true);
          setHasVideoError(false);
        } catch (mutedErr) {
          setIsPlaying(false);
        }
      }
    }
  }, [isMuted]);

  // Auto-play video when modal opens
  useEffect(() => {
    if (isOpen && videoData) {
      setHasVideoError(false);
      setCurrentTime(0);
      setProgressPercent(0);

      const timer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.load();
          attemptPlay();
        }
      }, 50);

      return () => clearTimeout(timer);
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [isOpen, videoData, attemptPlay]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard navigation (Escape, Space, M, F)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " " || e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPlaying, isMuted, isFullscreen]);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasVideoError(false);
          setTapAnimation("play");
          setTimeout(() => setTapAnimation(null), 600);
        })
        .catch(() => {
          // If unmuted play failed, try muted
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => {
              setIsPlaying(true);
              setHasVideoError(false);
            }).catch(() => setIsPlaying(false));
          }
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setTapAnimation("pause");
      setTimeout(() => setTapAnimation(null), 600);
    }
  }, []);

  const toggleMute = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  const toggleFullscreen = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Time update listener
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || 0;
    setCurrentTime(current);
    if (total > 0) {
      setDuration(total);
      setProgressPercent((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    if (dur && !isNaN(dur)) {
      setDuration(dur);
    }
    setHasVideoError(false);
  };

  // Click / Drag to seek along progress bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!progressBarRef.current || !videoRef.current || duration <= 0) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    const targetTime = percentage * duration;

    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
    setProgressPercent(percentage * 100);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!isOpen || !videoData) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={videoData.title}
    >
      {/* Vertical Reels Container (Portrait 9:16 Aspect Ratio) */}
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[340px] xs:max-w-[360px] sm:max-w-[390px] md:max-w-[420px] aspect-[9/16] max-h-[90vh] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-slate-950 flex flex-col justify-between select-none animate-in zoom-in-95 duration-200"
      >
        {/* Background Video Element */}
        <video
          ref={videoRef}
          poster={videoData.poster}
          playsInline
          autoPlay
          loop
          preload="auto"
          muted={isMuted}
          onPlay={() => {
            setIsPlaying(true);
            setHasVideoError(false);
          }}
          onPause={() => setIsPlaying(false)}
          onPlaying={() => {
            setIsPlaying(true);
            setHasVideoError(false);
          }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={() => {
            // If primary format fails, try loading directly with videoRef
            if (videoRef.current && videoRef.current.src !== rawUrl) {
              videoRef.current.src = rawUrl;
              videoRef.current.load();
              attemptPlay();
            } else {
              setHasVideoError(true);
              setIsPlaying(false);
            }
          }}
          onClick={togglePlayPause}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        >
          {mp4Url && <source src={mp4Url} type="video/mp4" />}
          {movUrl && <source src={movUrl} type="video/quicktime" />}
          <source src={rawUrl} />
        </video>

        {/* Poster Fallback Image if video error occurs */}
        {hasVideoError && videoData.poster && (
          <Image
            src={videoData.poster}
            alt={videoData.title}
            fill
            className="object-cover opacity-60 pointer-events-none"
            priority
          />
        )}

        {/* Ambient Top & Bottom Gradients */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-10" />

        {/* ── Top Header Controls Overlay ── */}
        <div className="relative z-20 p-3.5 sm:p-4 flex items-center justify-between pointer-events-auto">
          {/* Live Status Badge */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-md">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{videoData.tag || "LIVE QC FEED"}</span>
            </span>

            {videoData.hub && (
              <span className="hidden xs:inline-flex px-2 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-amber-300 text-[9px] font-mono font-bold">
                {videoData.hub}
              </span>
            )}
          </div>

          {/* Close Button (Circle with X) */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/80 active:scale-95 text-white flex items-center justify-center backdrop-blur-md border border-white/25 transition-all cursor-pointer shadow-lg"
            aria-label="Close reels video"
          >
            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>

        {/* ── Center Tap Play/Pause Animation & Toggle Button ── */}
        <div
          onClick={togglePlayPause}
          className="relative z-10 flex-1 flex items-center justify-center cursor-pointer"
        >
          {tapAnimation && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl animate-in zoom-in-50 fade-in duration-200">
              {tapAnimation === "play" ? (
                <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-white text-white" />
              ) : (
                <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-white text-white" />
              )}
            </div>
          )}

          {!isPlaying && !tapAnimation && (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600/95 text-white flex items-center justify-center shadow-[0_0_24px_rgba(255,16,40,0.5)] hover:scale-110 active:scale-95 transition-all cursor-pointer">
              <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1 fill-white text-white" />
            </div>
          )}
        </div>

        {/* ── Bottom Overlay: Reels Product Info & Interactive Controls ── */}
        <div className="relative z-20 p-3.5 sm:p-4 space-y-2.5 pointer-events-auto">
          {/* Sourcing / Product Meta Overlay */}
          <div className="space-y-1 text-white">
            <h3 className="text-sm sm:text-base font-black font-heading line-clamp-1 drop-shadow-md">
              {videoData.title}
            </h3>

            {videoData.subtitle && (
              <p className="text-[10.5px] sm:text-xs text-slate-300 line-clamp-2 drop-shadow-sm font-medium">
                {videoData.subtitle}
              </p>
            )}

            {/* Direct Sourcing Pricing & Full Specs Link */}
            {videoData.productPrice !== undefined && (
              <div className="pt-1.5 flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-mono drop-shadow-md">
                    ${videoData.productPrice.toFixed(2)} USDT
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono">
                    {isSpanish ? "Suministro Directo" : "Direct Sourcing"}
                  </span>
                </div>

                {videoData.productLink && (
                  <Link
                    href={videoData.productLink}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF1028] hover:bg-red-700 active:scale-95 text-white text-xs font-black font-heading transition-all shadow-md cursor-pointer"
                  >
                    <span>{isSpanish ? "Ver Especificaciones" : "View Specs"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Interactive Scrubber / Progress Bar */}
          <div
            ref={progressBarRef}
            onClick={handleSeek}
            className="group relative w-full h-2 bg-white/25 hover:h-3 rounded-full cursor-pointer transition-all duration-150 flex items-center"
          >
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full relative transition-[width] duration-75"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Bottom Controls Bar: Time, Mute & Fullscreen */}
          <div className="flex items-center justify-between text-white text-[10px] sm:text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-white font-bold">{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration || 120)}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Mute / Unmute Button */}
              <button
                type="button"
                onClick={toggleMute}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-colors cursor-pointer"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                )}
              </button>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-colors cursor-pointer"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
