/**
 * Lennox ChinaMall — Authentication Rate Limiter & Brute-Force Defender
 *
 * Enforces per-IP and per-Email rate limiting with exponential backoff
 * and automatic temporary account lockout.
 */

interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  lastAttemptAt: number;
  lockedUntil: number | null;
}

// In-memory cache for fast local checking across serverless invocations
const memoryCache = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

export interface RateLimitStatus {
  allowed: boolean;
  isLocked: boolean;
  attemptsLeft: number;
  lockedUntilSeconds: number;
  totalAttempts: number;
}

function cleanExpiredEntries() {
  const now = Date.now();
  for (const [key, record] of memoryCache.entries()) {
    if (record.lockedUntil && record.lockedUntil < now && now - record.lastAttemptAt > WINDOW_MS) {
      memoryCache.delete(key);
    } else if (!record.lockedUntil && now - record.firstAttemptAt > WINDOW_MS) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Check if an IP or identifier is currently rate limited or locked out.
 */
export function checkRateLimit(identifier: string): RateLimitStatus {
  cleanExpiredEntries();
  const now = Date.now();
  const key = identifier.toLowerCase().trim();
  const record = memoryCache.get(key);

  if (!record) {
    return {
      allowed: true,
      isLocked: false,
      attemptsLeft: MAX_ATTEMPTS,
      lockedUntilSeconds: 0,
      totalAttempts: 0,
    };
  }

  // Check if currently locked
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      isLocked: true,
      attemptsLeft: 0,
      lockedUntilSeconds: remainingSeconds,
      totalAttempts: record.attempts,
    };
  }

  // Window expired without active lock -> reset
  if (now - record.firstAttemptAt > WINDOW_MS) {
    memoryCache.delete(key);
    return {
      allowed: true,
      isLocked: false,
      attemptsLeft: MAX_ATTEMPTS,
      lockedUntilSeconds: 0,
      totalAttempts: 0,
    };
  }

  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - record.attempts);
  return {
    allowed: attemptsLeft > 0,
    isLocked: attemptsLeft <= 0,
    attemptsLeft,
    lockedUntilSeconds: 0,
    totalAttempts: record.attempts,
  };
}

/**
 * Records a failed login/auth attempt and triggers lockout if threshold is reached.
 */
export function recordFailedAttempt(identifier: string): RateLimitStatus {
  const now = Date.now();
  const key = identifier.toLowerCase().trim();
  const existing = memoryCache.get(key);

  let record: RateLimitRecord;

  if (!existing || (now - existing.firstAttemptAt > WINDOW_MS && !existing.lockedUntil)) {
    record = {
      attempts: 1,
      firstAttemptAt: now,
      lastAttemptAt: now,
      lockedUntil: null,
    };
  } else {
    const newAttempts = existing.attempts + 1;
    const isNowLocked = newAttempts >= MAX_ATTEMPTS;
    record = {
      attempts: newAttempts,
      firstAttemptAt: existing.firstAttemptAt,
      lastAttemptAt: now,
      lockedUntil: isNowLocked ? now + LOCKOUT_MS : null,
    };
  }

  memoryCache.set(key, record);

  const isLocked = !!record.lockedUntil && record.lockedUntil > now;
  const lockedUntilSeconds = isLocked ? Math.ceil((record.lockedUntil! - now) / 1000) : 0;
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - record.attempts);

  return {
    allowed: !isLocked && attemptsLeft > 0,
    isLocked,
    attemptsLeft,
    lockedUntilSeconds,
    totalAttempts: record.attempts,
  };
}

/**
 * Resets the rate limit counter after a successful authentication.
 */
export function resetRateLimit(identifier: string): void {
  const key = identifier.toLowerCase().trim();
  memoryCache.delete(key);
}

/**
 * Calculates a progressive delay (in ms) to slow down brute-force attackers.
 */
export function getProgressiveDelayMs(attempts: number): number {
  if (attempts <= 1) return 0;
  if (attempts === 2) return 200;
  if (attempts === 3) return 500;
  if (attempts === 4) return 1000;
  return 2000;
}
