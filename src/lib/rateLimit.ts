/**
 * In-memory sliding window rate limiter for Next.js routes and API endpoints.
 * Compatible with Edge and Node.js runtimes.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      const active = record.timestamps.filter((ts) => now - ts < 60000);
      if (active.length === 0) {
        rateLimitStore.delete(key);
      } else {
        record.timestamps = active;
      }
    }
  }, 300000);
}

export interface RateLimitConfig {
  limit: number; // Max requests
  windowMs: number; // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if an identifier exceeds the rate limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 60, windowMs: 60000 }
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const record = rateLimitStore.get(identifier) || { timestamps: [] };

  // Retain timestamps within the active sliding window
  const validTimestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (validTimestamps.length >= config.limit) {
    const earliestInWindow = validTimestamps[0];
    const resetTime = earliestInWindow + config.windowMs;

    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: Math.max(0, resetTime - now),
    };
  }

  // Add current request
  validTimestamps.push(now);
  rateLimitStore.set(identifier, { timestamps: validTimestamps });

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - validTimestamps.length,
    reset: config.windowMs,
  };
}

/**
 * Helper to extract client IP from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
