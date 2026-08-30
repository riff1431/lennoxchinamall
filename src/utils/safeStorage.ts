import { StateStorage } from "zustand/middleware";

/**
 * A resilient wrapper around window.localStorage that gracefully handles
 * QuotaExceededError and private-browsing / restricted storage environments
 * without crashing React components or form submissions.
 */
export const safeLocalStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(name);
    } catch (err) {
      console.warn(`[SafeStorage] Could not read "${name}" from localStorage:`, err);
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(name, value);
    } catch (err: unknown) {
      console.warn(
        `[SafeStorage] localStorage quota exceeded or write failed for "${name}". Attempting recovery...`,
        err
      );

      // Attempt recovery by purging legacy or oversized keys if possible
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && (key.includes("_v1") || key.startsWith("temp_") || key.includes("cache_"))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));

        // Retry writing
        window.localStorage.setItem(name, value);
      } catch (retryErr) {
        console.warn(
          `[SafeStorage] Storage recovery failed for "${name}". In-memory state remains active.`,
          retryErr
        );
        // Do NOT re-throw the error so that user operations (adding/updating items) do not crash!
      }
    }
  },

  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(name);
    } catch (err) {
      console.warn(`[SafeStorage] Could not remove "${name}" from localStorage:`, err);
    }
  },
};
