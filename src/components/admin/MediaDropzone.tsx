"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  UploadCloud,
  FileImage,
  Video,
  FileText,
  X,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Maximize2,
  Layers,
} from "lucide-react";
import { MediaAsset } from "@/lib/mockData";

export interface AnalyzedMediaFile {
  file: File;
  previewUrl: string;
  name: string;
  size: string;
  format: string;
  type: "image" | "video" | "document";
  dimensions: string;
  suggestedCategory: MediaAsset["category"];
}

interface MediaDropzoneProps {
  onFileAnalyzed: (analyzed: AnalyzedMediaFile | null) => void;
  currentFile: AnalyzedMediaFile | null;
  className?: string;
  maxSizeMB?: number;
}

export function MediaDropzone({
  onFileAnalyzed,
  currentFile,
  className = "",
  maxSizeMB = 100,
}: MediaDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to format bytes
  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  // Helper to extract dimensions & metadata from File
  const analyzeFile = useCallback(
    async (file: File) => {
      setErrorMessage(null);
      setIsAnalyzing(true);

      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setErrorMessage(`File exceeds the maximum limit of ${maxSizeMB}MB.`);
        setIsAnalyzing(false);
        return;
      }

      const fileExt = (file.name.split(".").pop() || "").toLowerCase();
      const isImage = file.type.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"].includes(fileExt);
      const isVideo = file.type.startsWith("video/") || ["mp4", "webm", "mov", "avi", "mkv"].includes(fileExt);
      const isDoc = file.type.includes("pdf") || ["pdf", "doc", "docx", "txt"].includes(fileExt);

      const mediaType: "image" | "video" | "document" = isVideo
        ? "video"
        : isDoc
        ? "document"
        : "image";

      const previewUrl = URL.createObjectURL(file);
      const formattedSize = formatFileSize(file.size);
      const formatStr = (fileExt || (isVideo ? "mp4" : "jpg")).toUpperCase();

      let dimensions = "1920x1080";
      let suggestedCategory: MediaAsset["category"] = "product";

      if (isImage) {
        try {
          const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => reject(new Error("Cannot load image"));
            img.src = previewUrl;
          });

          dimensions = `${dims.width}x${dims.height}`;
          const aspectRatio = dims.width / (dims.height || 1);

          // Smart category suggestion based on aspect ratio
          if (aspectRatio >= 2.0) {
            suggestedCategory = "banner";
          } else if (file.name.toLowerCase().includes("logo") || file.name.toLowerCase().includes("brand")) {
            suggestedCategory = "brand";
          } else if (file.name.toLowerCase().includes("review") || file.name.toLowerCase().includes("customer")) {
            suggestedCategory = "review";
          } else {
            suggestedCategory = "product";
          }
        } catch {
          dimensions = "1200x800";
          suggestedCategory = "product";
        }
      } else if (isVideo) {
        suggestedCategory = "dual-video";
        try {
          const dims = await new Promise<{ width: number; height: number }>((resolve) => {
            const video = document.createElement("video");
            video.preload = "metadata";
            video.onloadedmetadata = () => {
              resolve({
                width: video.videoWidth || 1920,
                height: video.videoHeight || 1080,
              });
            };
            video.onerror = () => resolve({ width: 1920, height: 1080 });
            video.src = previewUrl;
          });
          dimensions = `${dims.width}x${dims.height}`;
        } catch {
          dimensions = "1920x1080";
        }
      } else {
        dimensions = "A4 Document";
        suggestedCategory = "brand";
      }

      const analyzed: AnalyzedMediaFile = {
        file,
        previewUrl,
        name: file.name,
        size: formattedSize,
        format: formatStr,
        type: mediaType,
        dimensions,
        suggestedCategory,
      };

      setIsAnalyzing(false);
      onFileAnalyzed(analyzed);
    },
    [maxSizeMB, onFileAnalyzed]
  );

  // Drag Events Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      analyzeFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      analyzeFile(file);
    }
  };

  // Clipboard Paste Support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        analyzeFile(file);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [analyzeFile]);

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentFile?.previewUrl) {
      URL.revokeObjectURL(currentFile.previewUrl);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileAnalyzed(null);
    setErrorMessage(null);
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

      {!currentFile ? (
        /* Empty State Dropzone */
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-6 flex flex-col items-center justify-center text-center select-none overflow-hidden ${
            isDragActive
              ? "border-[#2F65F6] bg-blue-500/10 dark:bg-blue-500/15 scale-[1.01] shadow-lg shadow-blue-500/10 ring-4 ring-blue-500/20"
              : "border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:border-slate-400 dark:hover:border-slate-600"
          }`}
        >
          {/* Subtle Ambient Background Animation when Dragging */}
          {isDragActive && (
            <div className="absolute inset-0 bg-radial from-blue-500/20 to-transparent pointer-events-none animate-pulse" />
          )}

          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-200 ${
              isDragActive
                ? "bg-[#2F65F6] text-white scale-110 shadow-lg shadow-blue-500/30"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#2F65F6] group-hover:scale-105 shadow-xs"
            }`}
          >
            {isAnalyzing ? (
              <RefreshCw className="w-6 h-6 animate-spin text-[#2F65F6]" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1 relative z-10">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <span>Drag & drop your media file here</span>
              <span className="text-[10px] font-semibold text-slate-400 font-mono">(or click to browse)</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Supports <strong className="text-slate-700 dark:text-slate-300">JPG, PNG, WebP, GIF, MP4, WebM, PDF</strong> up to {maxSizeMB}MB
            </p>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 relative z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-600 dark:text-slate-300 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Auto-detects dimensions & format
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-600 dark:text-slate-300 shadow-2xs">
              📋 Paste from clipboard
            </span>
          </div>
        </div>
      ) : (
        /* Loaded File Preview State */
        <div className="relative rounded-2xl border border-blue-500/40 bg-blue-50/30 dark:bg-blue-950/20 p-4 transition-all duration-200 overflow-hidden shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Visual Thumbnail / Player Area */}
            <div className="relative w-full sm:w-36 h-28 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center">
              {currentFile.type === "image" ? (
                <Image
                  src={currentFile.previewUrl}
                  alt={currentFile.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : currentFile.type === "video" ? (
                <video
                  src={currentFile.previewUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-8 h-8 text-blue-400 mb-1" />
                  <span className="text-[10px] font-mono font-bold text-slate-300">{currentFile.format}</span>
                </div>
              )}

              {/* Format Badge */}
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[9px] font-mono font-bold uppercase tracking-wider">
                {currentFile.format}
              </span>
            </div>

            {/* Analyzed Metadata & Actions */}
            <div className="flex-1 min-w-0 space-y-2.5 w-full">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <h4
                      className="text-xs font-bold text-slate-900 dark:text-white truncate font-mono"
                      title={currentFile.name}
                    >
                      {currentFile.name}
                    </h4>
                  </div>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    Ready to upload • Auto-extracted specifications
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Extracted Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                  <Maximize2 className="w-3 h-3 text-[#2F65F6]" />
                  {currentFile.dimensions}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                  {currentFile.type === "image" ? (
                    <FileImage className="w-3 h-3 text-emerald-500" />
                  ) : currentFile.type === "video" ? (
                    <Video className="w-3 h-3 text-rose-500" />
                  ) : (
                    <FileText className="w-3 h-3 text-amber-500" />
                  )}
                  {currentFile.size}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100/80 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/60 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                  <Layers className="w-3 h-3" />
                  Suggested: {currentFile.suggestedCategory}
                </span>
              </div>

              {/* Action row to change file */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-bold text-[#2F65F6] hover:text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Replace with different file
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-between animate-in fade-in">
          <span>⚠️ {errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs hover:opacity-70 font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
