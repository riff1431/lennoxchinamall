import fs from "fs";
import path from "path";
import { AllStoreSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS } from "@/lib/settings-constants";

const SETTINGS_FILE_PATH = path.join(process.cwd(), ".store_settings_cache.json");

/**
 * Read persistent local store settings from disk
 */
export function readLocalSettings(): Partial<AllStoreSettings> {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const content = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      if (content) {
        return JSON.parse(content);
      }
    }
  } catch (err) {
    console.warn("Could not read .store_settings_cache.json:", err);
  }
  return {};
}

/**
 * Persist a domain or complete settings object to disk
 */
export function writeLocalSettingsDomain<D extends keyof AllStoreSettings>(
  domainKey: D,
  value: AllStoreSettings[D]
): void {
  try {
    const current = readLocalSettings();
    const updated = {
      ...current,
      [domainKey]: value,
    };
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write .store_settings_cache.json:", err);
  }
}

/**
 * Helper to get merged settings: Defaults -> File Cache -> DB overrides
 */
export function mergeSettings(
  fileSettings: Partial<AllStoreSettings>,
  dbRows?: { key: string; value: any }[]
): AllStoreSettings {
  const merged: AllStoreSettings = JSON.parse(JSON.stringify(DEFAULT_STORE_SETTINGS));

  // 1. Merge DB rows first (database baseline)
  if (dbRows && dbRows.length > 0) {
    dbRows.forEach((row) => {
      const domainKey = row.key as keyof AllStoreSettings;
      if (domainKey in merged && row.value && typeof row.value === "object") {
        (merged as any)[domainKey] = {
          ...(merged as any)[domainKey],
          ...row.value,
        };
      }
    });
  }

  // 2. Merge File Settings on top (latest admin saves)
  if (fileSettings) {
    Object.keys(fileSettings).forEach((key) => {
      const domainKey = key as keyof AllStoreSettings;
      if (fileSettings[domainKey]) {
        (merged as any)[domainKey] = {
          ...(merged as any)[domainKey],
          ...fileSettings[domainKey],
        };
      }
    });
  }

  return merged;
}
