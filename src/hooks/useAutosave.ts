"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error" | "unsaved";

export interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<boolean | void>;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutosave<T>({
  data,
  onSave,
  debounceMs = 2500,
  enabled = true,
}: UseAutosaveOptions<T>) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const dataRef = useRef<T>(data);
  const isInitialMount = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync ref with latest data
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const executeSave = useCallback(async () => {
    if (!enabled) return;
    setStatus("saving");
    try {
      await onSave(dataRef.current);
      setStatus("saved");
      setLastSavedTime(new Date());
    } catch (err) {
      console.error("Autosave error:", err);
      setStatus("error");
    }
  }, [enabled, onSave]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!enabled) return;

    const notifyTimer = setTimeout(() => setStatus("unsaved"), 0);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      executeSave();
    }, debounceMs);

    return () => {
      clearTimeout(notifyTimer);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, debounceMs, enabled, executeSave]);

  return {
    status,
    lastSavedTime,
    saveNow: executeSave,
  };
}
