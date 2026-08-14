"use client";

/**
 * Client-only persisted state for the Adhkar UI.
 *
 * Follows the same localStorage + useSyncExternalStore + window custom
 * event pattern already used by ThemeSwitcher/TasbeehCounter
 * (src/components/client-controls.tsx) and the Quran reader's bookmarks
 * (src/lib/quran-reader-client.ts), scoped to its own storage keys so it
 * never collides with either. Bookmark UI only — no account dependency,
 * no server sync.
 */
import { useSyncExternalStore } from "react";

const BOOKMARKS_KEY = "alsamad-adhkar-bookmarks";
const BOOKMARKS_EVENT = "alsamad-adhkar-bookmarks-change";

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

function toggleBookmark(itemId: string): void {
  const current = readBookmarks();
  const next = current.includes(itemId)
    ? current.filter((entry) => entry !== itemId)
    : [...current, itemId];
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(BOOKMARKS_EVENT));
}

const subscribeBookmarks = subscribeWindowEvent(BOOKMARKS_EVENT);

export interface UseAdhkarBookmarksResult {
  readonly bookmarks: readonly string[];
  readonly isBookmarked: (itemId: string) => boolean;
  readonly toggle: (itemId: string) => void;
}

export function useAdhkarBookmarks(): UseAdhkarBookmarksResult {
  const bookmarks = useSyncExternalStore(
    subscribeBookmarks,
    readBookmarks,
    () => emptyBookmarks,
  );
  return {
    bookmarks,
    isBookmarked: (itemId: string) => bookmarks.includes(itemId),
    toggle: toggleBookmark,
  };
}
