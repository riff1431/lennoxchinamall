/**
 * Security utilities for Lennox ChinaMall.
 * Handles safe redirection, file upload validation, and input sanitization.
 */

/**
 * Validates and normalizes a redirect URL to prevent Open Redirect attacks.
 * Disallows absolute URLs to external origins and protocol-relative URLs (e.g. //evil.com).
 */
export function getSafeRedirectUrl(
  requestedUrl: string | null | undefined,
  fallback = "/account/profile"
): string {
  if (!requestedUrl || typeof requestedUrl !== "string") {
    return fallback;
  }

  const trimmed = requestedUrl.trim();

  // Reject protocol-relative URLs like //evil.com
  if (trimmed.startsWith("//")) {
    return fallback;
  }

  // Reject URLs containing protocols like javascript:, https:, http:, data:
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }

  // Ensure it starts with a single forward slash
  if (!trimmed.startsWith("/")) {
    return fallback;
  }

  // Check against double backslashes / encoded attacks
  if (trimmed.includes("\\") || trimmed.includes("%2f") || trimmed.includes("%2F") || trimmed.includes("%5c")) {
    return fallback;
  }

  return trimmed;
}

/**
 * Validates file upload parameters (MIME type and maximum allowed size).
 */
export interface FileValidationOptions {
  allowedMimeTypes?: string[];
  maxSizeBytes?: number;
}

export const DEFAULT_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const DEFAULT_MEDIA_MIMES = [
  ...DEFAULT_IMAGE_MIMES,
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export const MAX_IMAGE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB
export const MAX_MEDIA_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export function validateFileUpload(
  file: { size: number; type: string; name?: string },
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } {
  const allowedMimes = options.allowedMimeTypes || DEFAULT_MEDIA_MIMES;
  const maxSize = options.maxSizeBytes || MAX_MEDIA_SIZE_BYTES;

  if (!file || typeof file.size !== "number" || typeof file.type !== "string") {
    return { valid: false, error: "Invalid file object" };
  }

  if (file.size <= 0) {
    return { valid: false, error: "File is empty" };
  }

  if (file.size > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    return { valid: false, error: `File exceeds maximum allowed size of ${maxMb}MB` };
  }

  const normalizedType = file.type.toLowerCase().trim();
  if (!allowedMimes.includes(normalizedType)) {
    return { valid: false, error: `File type "${file.type}" is not supported` };
  }

  // Validate file extension against allowed types if filename is provided
  if (file.name) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const dangerousExtensions = ["exe", "bat", "cmd", "sh", "php", "js", "html", "svg", "py", "vbs", "msi"];
    if (ext && dangerousExtensions.includes(ext)) {
      return { valid: false, error: "Executable or scripted file extensions are not allowed" };
    }
  }

  return { valid: true };
}
