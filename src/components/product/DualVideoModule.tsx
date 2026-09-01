"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Film, ExternalLink, Video as VideoIcon, Sparkles, ShieldCheck } from "lucide-react";
import { ProductVideo } from "@/types/database";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface DualVideoModuleProps {
  videos: ProductVideo[];
  productTitle: string;
}

export function DualVideoModule({ videos, productTitle }: DualVideoModuleProps) {
  const { isSpanish } = useTranslation();
  const [activeModalVideo, setActiveModalVideo] = useState<ProductVideo | null>(
    null
  );

  if (!videos || videos.length === 0) return null;

  return (
    <div className="bg-[#00143D] rounded-xl p-5 border border-blue-950 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#002366]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FF1028]/20 text-[#FF1028] flex items-center justify-center border border-[#FF1028]/30">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading text-xs font-black tracking-wide uppercase text-white">
              {isSpanish ? "Demostraciones en Video de Fábrica" : "Factory Video Demonstrations"}
            </h4>
            <span className="text-[10px] text-slate-300 font-medium">
              {isSpanish ? "Inspección de hardware y prueba en vivo" : "Live hardware inspection & flight test"}
            </span>
          </div>
        </div>
        <span className="bg-[#FF1028] text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider font-heading">
          {isSpanish ? `${videos.length} Videos Directos` : `${videos.length} Direct Videos`}
        </span>
      </div>

      {/* Dual Video Cards (Vertical Stack on Desktop Right Column) */}
      <div className="flex flex-col gap-3.5">
        {videos.map((video, idx) => {
          const videoSrc =
            video.url && !video.url.includes("youtube.com")
              ? video.url
              : idx === 0
              ? "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov"
              : "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov";

          return (
            <div
              key={video.id || idx}
              className="group relative bg-[#000B24] rounded-lg overflow-hidden border border-[#002366] hover:border-[#FF1028] transition-all duration-300 cursor-pointer shadow-md"
              onClick={() => setActiveModalVideo({ ...video, url: videoSrc })}
            >
              {/* Video Thumbnail / Live Stream Area */}
              <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                <video
                  src={videoSrc}
                  playsInline
                  autoPlay
                  muted
                  loop
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000B24] via-transparent to-transparent z-10" />

                {/* Red Play Button */}
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FF1028] hover:bg-[#E00B20] text-white flex items-center justify-center shadow-xl group-hover:scale-115 transition-all z-20">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>

                {/* Slot Badge */}
                <div className="absolute top-2.5 left-2.5 z-20">
                  <span className="bg-[#00143D]/90 backdrop-blur-md text-[10px] font-black text-amber-300 px-2 py-0.5 rounded-xs border border-amber-300/30 flex items-center gap-1 font-heading uppercase tracking-wide">
                    <VideoIcon className="w-3 h-3 text-[#FF1028]" />
                    <span>
                      {isSpanish
                        ? `ESPACIO ${video.position || idx + 1}: ${idx === 0 ? "CONTROL DE CALIDAD" : "DEMO EN VIVO"}`
                        : `SLOT ${video.position || idx + 1}: ${idx === 0 ? "QUALITY TEST" : "FLIGHT DEMO"}`}
                    </span>
                  </span>
                </div>
              </div>

              {/* Video Description Bar */}
              <div className="p-3 bg-[#000B24]/90 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-[#FF1028] transition-colors">
                  {video.title || (isSpanish ? `Video Demo #${idx + 1}` : `Video Demo #${idx + 1}`)}
                </span>
                <span className="text-[10px] text-amber-300 font-bold shrink-0 flex items-center gap-0.5">
                  {isSpanish ? "Reproducir Video" : "Play Video"} <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Notice */}
      <div className="mt-4 pt-3 border-t border-[#002366] text-[10px] text-slate-300 flex items-center gap-1.5 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
        <span>
          {isSpanish
            ? "Videos verificados directamente por el Equipo de Inspección de Calidad Lennox"
            : "Videos verified directly by Lennox Quality Inspection Team"}
        </span>
      </div>

      {/* Video Playback Modal */}
      <Modal
        isOpen={!!activeModalVideo}
        onClose={() => setActiveModalVideo(null)}
        title={activeModalVideo?.title || (isSpanish ? `${productTitle} — Demo en Video en Vivo` : `${productTitle} — Live Video Demo`)}
        size="xl"
      >
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xl">
          {activeModalVideo?.type === "embed" && activeModalVideo?.url?.includes("youtube.com") ? (
            <iframe
              src={activeModalVideo.url}
              title={activeModalVideo.title || "Video"}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={activeModalVideo?.url}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
