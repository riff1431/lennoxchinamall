"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  FileText,
  Video,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/utils/helpers";

export interface UploadedFileItem {
  id: string;
  url: string;
  name: string;
  size?: string;
  type?: "image" | "video" | "document";
}

export interface AdminUploaderProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  values?: (string | UploadedFileItem)[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
  accept?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
  onUpload?: (file: File) => Promise<string>;
}

export function AdminUploader({
  label,
  helperText = "PNG, JPG, WEBP, MP4 up to 10MB",
  errorMessage,
  values = [],
  onChange,
  maxFiles = 5,
  maxSizeMb = 10,
  accept = "image/*,video/*,application/pdf",
  required,
  disabled,
  className,
  containerClassName,
  onUpload,
}: AdminUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize string URLs vs UploadedFileItem
  const normalizedItems: UploadedFileItem[] = values.map((val, idx) => {
    if (typeof val === "string") {
      const isVid = val.match(/\.(mp4|webm|mov)$/i);
      const isDoc = val.match(/\.(pdf|doc|docx)$/i);
      return {
        id: `file-${idx}`,
        url: val,
        name: val.split("/").pop() || `Asset-${idx + 1}`,
        type: isVid ? "video" : isDoc ? "document" : "image",
      };
    }
    return val;
  });

  const handleFiles = async (files: FileList | File[]) => {
    if (disabled || isUploading) return;
    setUploadError(null);

    const fileList = Array.from(files);
    if (normalizedItems.length + fileList.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    setIsUploading(true);
    const newUrls: string[] = [...values.map((v) => (typeof v === "string" ? v : v.url))];

    for (const file of fileList) {
      if (file.size > maxSizeMb * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds ${maxSizeMb}MB limit.`);
        continue;
      }

      try {
        if (onUpload) {
          const uploadedUrl = await onUpload(file);
          newUrls.push(uploadedUrl);
        } else {
          // Local preview URL fallback
          const localUrl = URL.createObjectURL(file);
          newUrls.push(localUrl);
        }
      } catch (err: unknown) {
        console.error("Upload error:", err);
        setUploadError(`Failed to upload "${file.name}".`);
      }
    }

    setIsUploading(false);
    onChange(newUrls);
  };

  const handleRemove = (index: number) => {
    const next = values
      .map((v) => (typeof v === "string" ? v : v.url))
      .filter((_, idx) => idx !== index);
    onChange(next);
  };

  const isError = Boolean(errorMessage || uploadError);

  return (
    <div className={cn("space-y-2 w-full font-montserrat", containerClassName)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-heading">
            {label}
            {required && <span className="text-[#FF1028] ml-1">*</span>}
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            {normalizedItems.length}/{maxFiles}
          </span>
        </div>
      )}

      {/* Dropzone Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => {
          if (!disabled && !isUploading && normalizedItems.length < maxFiles) {
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          "border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-150 flex flex-col items-center justify-center gap-2.5 cursor-pointer select-none",
          isDragging
            ? "border-[#FF1028] bg-red-50/50 dark:bg-red-950/20"
            : isError
            ? "border-rose-400 bg-rose-50/30 dark:bg-rose-950/10"
            : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-50 hover:border-slate-300 dark:hover:border-slate-700",
          (disabled || normalizedItems.length >= maxFiles) &&
            "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-7 h-7 text-[#FF1028] animate-spin" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Uploading asset to Storage CDN...
            </span>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 text-[#FF1028] flex items-center justify-center shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-heading">
                Click to upload or drag &amp; drop files
              </p>
              <p className="text-[11px] text-slate-400">{helperText}</p>
            </div>
          </>
        )}
      </div>

      {/* Upload Previews Grid */}
      {normalizedItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
          {normalizedItems.map((item, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-xs"
            >
              {item.type === "video" ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-2">
                  <Video className="w-6 h-6 text-white mb-1" />
                  <span className="text-[10px] truncate max-w-full text-center text-slate-300 font-mono">
                    Video
                  </span>
                </div>
              ) : item.type === "document" ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 p-2">
                  <FileText className="w-6 h-6 text-[#2F65F6] mb-1" />
                  <span className="text-[10px] truncate max-w-full text-center text-slate-700 dark:text-slate-300 font-mono">
                    {item.name}
                  </span>
                </div>
              ) : (
                <Image
                  src={item.url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  unoptimized={item.url.startsWith("blob:") || item.url.startsWith("data:")}
                />
              )}

              {/* Remove Button */}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(idx);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer opacity-90 group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {(errorMessage || uploadError) && (
        <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 animate-in fade-in duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage || uploadError}</span>
        </p>
      )}
    </div>
  );
}
