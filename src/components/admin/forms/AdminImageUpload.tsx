"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  AlertCircle,
  Eye,
  Maximize2,
  Trash2,
} from "lucide-react";
import { uploadMediaFile } from "@/app/actions/storage";

export interface AdminImageUploadProps {
  label?: string;
  helperText?: string;
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  accept?: string;
  previewShape?: "rectangle" | "square" | "circle";
  aspectRatioTip?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function AdminImageUpload({
  label,
  helperText,
  value,
  onChange,
  bucket = "products",
  folder = "branding",
  maxSizeMB = 20,
  accept = "image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/x-icon,image/vnd.microsoft.icon,image/avif",
  previewShape = "rectangle",
  aspectRatioTip,
  placeholder = "https://... or /logo.png",
  className = "",
  disabled = false,
  required = false,
}: AdminImageUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageMeta, setImageMeta] = useState<{ dimensions?: string; size?: string; format?: string } | null>(null);
  const [bgMode, setBgMode] = useState<"checker" | "dark" | "light">("checker");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  // Extract metadata when value exists
  useEffect(() => {
    if (!value) {
      setImageMeta(null);
      return;
    }

    // Try detecting dimensions
    const img = new window.Image();
    img.onload = () => {
      setImageMeta((prev) => ({
        ...prev,
        dimensions: `${img.naturalWidth} × ${img.naturalHeight}px`,
      }));
    };
    img.onerror = () => {
      // ignore
    };
    img.src = value;

    // Detect format from url
    const extMatch = value.split("?")[0].match(/\.([a-zA-Z0-9]+)$/);
    if (extMatch) {
      setImageMeta((prev) => ({
        ...prev,
        format: extMatch[1].toUpperCase(),
      }));
    }
  }, [value]);

  const handleUploadFile = useCallback(
    async (file: File) => {
      if (disabled) return;
      setErrorMessage(null);

      // Validate size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setErrorMessage(`File size exceeds limit of ${maxSizeMB}MB.`);
        return;
      }

      setIsUploading(true);
      setUploadProgress(15);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", bucket);
        formData.append("folder", folder);

        // Progress simulation
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => (prev && prev < 85 ? prev + 15 : prev));
        }, 200);

        let res: any;
        try {
          const apiRes = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          });
          res = await apiRes.json();
        } catch {
          // Fallback to server action if API route is unreachable
          res = await uploadMediaFile(formData);
        }

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (res.success && res.url) {
          onChange(res.url);
          setImageMeta({
            dimensions: undefined,
            size: res.size,
            format: res.format,
          });
        } else {
          setErrorMessage(res.error || "Upload failed. Please try again.");
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        const rawMsg = err?.message || "";
        if (rawMsg.includes("Server Action") || rawMsg.includes("failed-to-find-server-action")) {
          setErrorMessage("A new deployment was completed. Please refresh this page (Cmd + Shift + R) and try again.");
        } else {
          setErrorMessage(rawMsg || "Failed to upload image.");
        }
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(null), 500);
      }
    },
    [bucket, folder, maxSizeMB, onChange, disabled]
  );

  // Drag handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isDragActive) setIsDragActive(true);
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

    if (disabled || isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/") || file.name.endsWith(".ico")) {
        handleUploadFile(file);
      } else {
        setErrorMessage("Please drop a valid image file (.png, .jpg, .svg, .webp, .ico)");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFile(e.target.files[0]);
      e.target.value = "";
    }
  };

  const handleCopyUrl = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    onChange("");
    setImageMeta(null);
    setErrorMessage(null);
  };

  return (
    <div className={`space-y-2 w-full font-sans ${className}`}>
      {/* Label & Top Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {label && (
            <label className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1">
              {label}
              {required && <span className="text-rose-500">*</span>}
            </label>
          )}
          {aspectRatioTip && (
            <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
              {aspectRatioTip}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowManualUrl(!showManualUrl)}
            className="text-[11px] font-semibold text-[#2F65F6] hover:text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showManualUrl ? "Hide URL Input" : "Direct URL / Path"}</span>
          </button>
        </div>
      </div>

      {/* Manual URL Input Bar (When toggled or when entering custom paths) */}
      {showManualUrl && (
        <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="relative flex-1">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#2F65F6] transition-colors"
            />
          </div>
          {value && (
            <button
              type="button"
              onClick={handleCopyUrl}
              title="Copy URL"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#2F65F6] text-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Main Drag-and-Drop & Preview Area */}
      {!value ? (
        /* Empty State: Dropzone */
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`relative group rounded-2xl border-2 border-dashed transition-all duration-200 p-5 flex flex-col items-center justify-center text-center cursor-pointer select-none overflow-hidden ${
            isDragActive
              ? "border-[#2F65F6] bg-blue-500/10 dark:bg-blue-500/15 scale-[1.01] ring-4 ring-blue-500/20 shadow-md"
              : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 hover:bg-slate-100/70 dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isUploading ? (
            <div className="py-3 flex flex-col items-center gap-2">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-[#2F65F6] animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Uploading to Cloud Storage...
                </p>
                {uploadProgress !== null && (
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{uploadProgress}%</p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5 transition-transform duration-200 ${
                  isDragActive
                    ? "bg-[#2F65F6] text-white scale-110 shadow-lg shadow-blue-500/30"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#2F65F6] group-hover:scale-105 shadow-2xs"
                }`}
              >
                <UploadCloud className="w-5 h-5" />
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Drag &amp; drop image here, or{" "}
                  <span className="text-[#2F65F6] underline decoration-blue-400/50 underline-offset-2">
                    browse
                  </span>
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {helperText || `Supports PNG, JPG, WebP, SVG, ICO (Max ${maxSizeMB}MB)`}
                </p>
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                  Auto-optimizes &amp; uploads
                </span>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Populated Preview State */
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-2xl border transition-all duration-200 p-3.5 bg-white dark:bg-slate-900/90 ${
            isDragActive
              ? "border-[#2F65F6] ring-4 ring-blue-500/20 shadow-lg"
              : "border-slate-200 dark:border-slate-800 shadow-xs"
          }`}
        >
          {isDragActive && (
            <div className="absolute inset-0 bg-[#2F65F6]/10 backdrop-blur-2xs rounded-2xl z-20 flex items-center justify-center border-2 border-dashed border-[#2F65F6]">
              <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold text-[#2F65F6]">
                <UploadCloud className="w-4 h-4 animate-bounce" />
                <span>Drop new image to replace</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Visual Thumbnail with transparency checkerboard background */}
            <div
              className={`relative shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner flex items-center justify-center ${
                previewShape === "circle"
                  ? "w-20 h-20 rounded-full"
                  : previewShape === "square"
                  ? "w-24 h-24 rounded-xl"
                  : "w-full sm:w-36 h-24 rounded-xl"
              } ${
                bgMode === "checker"
                  ? "bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[size:12px_12px] bg-[position:0_0,0_6px,6px_-6px,-6px_0] dark:bg-[linear-gradient(45deg,#1f2937_25%,transparent_25%),linear-gradient(-45deg,#1f2937_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1f2937_75%),linear-gradient(-45deg,transparent_75%,#1f2937_75%)]"
                  : bgMode === "dark"
                  ? "bg-slate-950"
                  : "bg-white"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt={label || "Uploaded preview"}
                className="max-h-full max-w-full object-contain p-1.5 transition-transform duration-200 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />

              {/* Background preview switcher badge */}
              <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/70 backdrop-blur-xs rounded-md p-0.5 z-10">
                <button
                  type="button"
                  title="Checkerboard BG"
                  onClick={() => setBgMode("checker")}
                  className={`w-3.5 h-3.5 rounded text-[8px] flex items-center justify-center ${
                    bgMode === "checker" ? "bg-white text-black font-bold" : "text-white/70 hover:text-white"
                  }`}
                >
                  🏁
                </button>
                <button
                  type="button"
                  title="Dark BG"
                  onClick={() => setBgMode("dark")}
                  className={`w-3.5 h-3.5 rounded text-[8px] flex items-center justify-center ${
                    bgMode === "dark" ? "bg-white text-black font-bold" : "text-white/70 hover:text-white"
                  }`}
                >
                  🌑
                </button>
                <button
                  type="button"
                  title="Light BG"
                  onClick={() => setBgMode("light")}
                  className={`w-3.5 h-3.5 rounded text-[8px] flex items-center justify-center ${
                    bgMode === "light" ? "bg-white text-black font-bold" : "text-white/70 hover:text-white"
                  }`}
                >
                  ☀️
                </button>
              </div>
            </div>

            {/* Metadata & Actions */}
            <div className="flex-1 min-w-0 w-full space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate" title={value}>
                    {value.split("/").pop() || value}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-xs">{value}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    title="Copy Image URL"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#2F65F6] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    title="Open Full Image in New Tab"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#2F65F6] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {!disabled && (
                    <button
                      type="button"
                      onClick={handleClear}
                      title="Remove image"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                {imageMeta?.dimensions && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                    <Maximize2 className="w-2.5 h-2.5 text-[#2F65F6]" />
                    {imageMeta.dimensions}
                  </span>
                )}
                {imageMeta?.format && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[#2F65F6] dark:text-blue-300 font-bold uppercase">
                    {imageMeta.format}
                  </span>
                )}
                {imageMeta?.size && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    {imageMeta.size}
                  </span>
                )}
              </div>

              {/* Action row to replace */}
              {!disabled && (
                <div className="flex items-center gap-3 pt-0.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-[11px] font-bold text-[#2F65F6] hover:text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3 h-3" />
                        <span>Replace with new file</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-slate-400">• or drag &amp; drop new file onto this card</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold hover:opacity-70 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
