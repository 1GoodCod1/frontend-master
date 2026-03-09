import { useState, useCallback } from 'react';
import { safeStorage } from '@/utils/safeStorage';
import { hasSearchHistoryConsent } from '@/features/cookie-consent/storage';

const STORAGE_KEY = 'mastersSearchHistory';
const MAX_ITEMS = 12;

function loadHistory(): string[] {
  if (!hasSearchHistoryConsent()) return [];
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string').slice(0, MAX_ITEMS)
      : [];
  } catch {
    return [];
  }
}

function saveHistory(items: string[]) {
  if (!hasSearchHistoryConsent()) return;
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    //
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(loadHistory);

  const refresh = useCallback(() => {
    setHistory(loadHistory());
  }, []);

  const add = useCallback((term: string) => {
    if (!hasSearchHistoryConsent()) return;
    const trimmed = term.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const filtered = prev.filter((x) => x.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, MAX_ITEMS);
      saveHistory(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    try {
      safeStorage.removeItem(STORAGE_KEY);
    } catch {
      //
    }
  }, []);

  const getFiltered = useCallback((query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) =>
      item.toLowerCase().includes(q)
    );
  }, [history]);

  return { history, add, clear, getFiltered, refresh };
}
