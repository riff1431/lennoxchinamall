"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Film, ExternalLink, Video as VideoIcon, Sparkles, ShieldCheck } from "lucide-react";
import { ProductVideo } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface DualVideoModuleProps {
  videos: ProductVideo[];
  productTitle: string;
}

export function DualVideoModule({ videos, productTitle }: DualVideoModuleProps) {
  const [activeModalVideo, setActiveModalVideo] = useState<ProductVideo | null>(
    null
  );

  if (!videos || videos.length === 0) return null;

  return (
    <div className="bg-[#00143D] rounded-3xl p-5 border border-blue-950 text-white shadow-xl font-montserrat">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#002366]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FF1028]/20 text-[#FF1028] flex items-center justify-center border border-[#FF1028]/30">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wide uppercase text-white">
              Factory Video Demonstrations
            </h4>
            <span className="text-[10px] text-slate-300 font-medium">
              Live hardware inspection & flight test
            </span>
          </div>
        </div>
        <span className="bg-[#FF1028] text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
          {videos.length} Direct Videos
        </span>
      </div>

      {/* Dual Video Cards (Vertical Stack on Desktop Right Column) */}
      <div className="flex flex-col gap-3.5">
        {videos.map((video, idx) => (
          <div
            key={video.id || idx}
            className="group relative bg-[#000B24] rounded-2xl overflow-hidden border border-[#002366] hover:border-[#FF1028] transition-all duration-300 cursor-pointer shadow-md"
            onClick={() => setActiveModalVideo(video)}
          >
            {/* Video Thumbnail Area */}
            <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
              <Image
                src={
                  idx === 0
                    ? "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80"
                    : "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80"
                }
                alt={video.title || "Video Preview"}
                fill
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000B24] via-transparent to-transparent z-10" />

              {/* Red Play Button */}
              <div className="relative w-12 h-12 rounded-full bg-[#FF1028] hover:bg-[#E00B20] text-white flex items-center justify-center shadow-xl group-hover:scale-115 transition-all z-20">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>

              {/* Slot Badge */}
              <div className="absolute top-2.5 left-2.5 z-20">
                <span className="bg-[#00143D]/90 backdrop-blur-md text-[10px] font-black text-amber-300 px-2 py-0.5 rounded-md border border-amber-300/30 flex items-center gap-1">
                  <VideoIcon className="w-3 h-3 text-[#FF1028]" />
                  <span>SLOT {video.position || idx + 1}: {idx === 0 ? "QUALITY TEST" : "FLIGHT DEMO"}</span>
                </span>
              </div>
            </div>

            {/* Video Description Bar */}
            <div className="p-3 bg-[#000B24]/90 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-[#FF1028] transition-colors">
                {video.title || `Video Demo #${idx + 1}`}
              </span>
              <span className="text-[10px] text-amber-300 font-bold shrink-0 flex items-center gap-0.5">
                Play Video <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Notice */}
      <div className="mt-4 pt-3 border-t border-[#002366] text-[10px] text-slate-300 flex items-center gap-1.5 font-semibold">
        <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
        <span>Videos verified directly by Lennox Quality Inspection Team</span>
      </div>

      {/* Video Playback Modal */}
      <Modal
        isOpen={!!activeModalVideo}
        onClose={() => setActiveModalVideo(null)}
        title={activeModalVideo?.title || `${productTitle} — Live Video Demo`}
        size="xl"
      >
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
          {activeModalVideo?.type === "embed" ? (
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
              className="w-full h-full"
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
