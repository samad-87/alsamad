"use client";

/**
 * Client-only persisted state for the Quran Reader UI foundation.
 *
 * Follows the same localStorage + useSyncExternalStore + window custom
 * event pattern already used by ThemeSwitcher/TasbeehCounter in
 * src/components/client-controls.tsx, so reader settings, bookmarks, and
 * last-read state stay in sync across every mounted component without a
 * new state-management dependency. The mutator functions are plain module-
 * level functions (not created per render) so they have a stable identity
 * and are safe to use directly inside effect dependency arrays.
 */
import { useSyncExternalStore } from "react";

export type ReaderFontScale = "sm" | "md" | "lg" | "xl";
export type ReaderWidth = "narrow" | "comfortable" | "wide";
export type ReaderLineSpacing = "compact" | "comfortable" | "relaxed";
export type ReaderViewMode = "continuous" | "focus";

export interface ReaderSettingsState {
  readonly fontScale: ReaderFontScale;
  readonly width: ReaderWidth;
  readonly lineSpacing: ReaderLineSpacing;
  readonly showTranslation: boolean;
  readonly showTafsir: boolean;
  readonly viewMode: ReaderViewMode;
}

export const DEFAULT_READER_SETTINGS: ReaderSettingsState = {
  fontScale: "md",
  width: "comfortable",
  lineSpacing: "comfortable",
  showTranslation: false,
  showTafsir: false,
  viewMode: "continuous",
};

const SETTINGS_KEY = "alsamad-quran-reader-settings";
const SETTINGS_EVENT = "alsamad-quran-settings-change";
const BOOKMARKS_KEY = "alsamad-quran-bookmarks";
const BOOKMARKS_EVENT = "alsamad-quran-bookmarks-change";
const LAST_READ_KEY = "alsamad-quran-last-read";
const LAST_READ_EVENT = "alsamad-quran-last-read-change";

function subscribeWindowEvent(eventName: string) {
  return (notify: () => void) => {
    window.addEventListener("storage", notify);
    window.addEventListener(eventName, notify);
    return () => {
      window.removeEventListener("storage", notify);
      window.removeEventListener(eventName, notify);
    };
  };
}

/**
 * useSyncExternalStore requires getSnapshot to return a referentially
 * stable value when the underlying data hasn't changed, or React treats
 * every render as a fresh change and loops. JSON.parse always allocates a
 * new object/array, so the last raw string and its parsed result are
 * cached here and only re-parsed when the raw string itself changes.
 */
let cachedSettingsRaw: string | null = null;
let cachedSettings: ReaderSettingsState = DEFAULT_READER_SETTINGS;

function readSettings(): ReaderSettingsState {
  let raw: string | null;
  try {
    raw = localStorage.getItem(SETTINGS_KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedSettingsRaw) {
    return cachedSettings;
  }
  cachedSettingsRaw = raw;
  try {
    cachedSettings = raw
      ? { ...DEFAULT_READER_SETTINGS, ...JSON.parse(raw) }
      : DEFAULT_READER_SETTINGS;
  } catch {
    cachedSettings = DEFAULT_READER_SETTINGS;
  }
  return cachedSettings;
}

function updateReaderSettings(patch: Partial<ReaderSettingsState>): void {
  const next = { ...readSettings(), ...patch };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

const subscribeSettings = subscribeWindowEvent(SETTINGS_EVENT);

export function useReaderSettings(): readonly [
  ReaderSettingsState,
  (patch: Partial<ReaderSettingsState>) => void,
] {
  const settings = useSyncExternalStore(
    subscribeSettings,
    readSettings,
    () => DEFAULT_READER_SETTINGS,
  );
  return [settings, updateReaderSettings] as const;
}

const emptyBookmarks: readonly string[] = [];
let cachedBookmarksRaw: string | null = null;
let cachedBookmarks: readonly string[] = emptyBookmarks;

export function parseStoredBookmarks(raw: string | null): readonly string[] {
  if (!raw) return emptyBookmarks;

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) &&
      parsed.every((entry): entry is string => typeof entry === "string")
      ? parsed
      : emptyBookmarks;
  } catch {
    return emptyBookmarks;
  }
}

function readBookmarks(): readonly string[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(BOOKMARKS_KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedBookmarksRaw) {
    return cachedBookmarks;
  }
  cachedBookmarksRaw = raw;
  cachedBookmarks = parseStoredBookmarks(raw);
  return cachedBookmarks;
}

function toggleBookmark(reference: string): void {
  const current = readBookmarks();
  const next = current.includes(reference)
    ? current.filter((entry) => entry !== reference)
    : [...current, reference];
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(BOOKMARKS_EVENT));
}

const subscribeBookmarks = subscribeWindowEvent(BOOKMARKS_EVENT);

export interface UseBookmarksResult {
  readonly bookmarks: readonly string[];
  readonly isBookmarked: (reference: string) => boolean;
  readonly toggle: (reference: string) => void;
}

export function useBookmarks(): UseBookmarksResult {
  const bookmarks = useSyncExternalStore(
    subscribeBookmarks,
    readBookmarks,
    () => emptyBookmarks,
  );
  return {
    bookmarks,
    isBookmarked: (reference: string) => bookmarks.includes(reference),
    toggle: toggleBookmark,
  };
}

function readLastRead(): string | null {
  return localStorage.getItem(LAST_READ_KEY);
}

function writeLastRead(reference: string): void {
  localStorage.setItem(LAST_READ_KEY, reference);
  window.dispatchEvent(new Event(LAST_READ_EVENT));
}

const subscribeLastRead = subscribeWindowEvent(LAST_READ_EVENT);

export interface UseLastReadResult {
  readonly lastRead: string | null;
  readonly setLastRead: (reference: string) => void;
}

export function useLastRead(): UseLastReadResult {
  const lastRead = useSyncExternalStore(
    subscribeLastRead,
    readLastRead,
    () => null,
  );
  return { lastRead, setLastRead: writeLastRead };
}
