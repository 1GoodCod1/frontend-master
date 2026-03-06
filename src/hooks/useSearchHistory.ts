import { useState, useCallback } from 'react';

const STORAGE_KEY = 'mastersSearchHistory';
const MAX_ITEMS = 12;

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    /* ignore */
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(loadHistory);

  const refresh = useCallback(() => {
    setHistory(loadHistory());
  }, []);

  const add = useCallback((term: string) => {
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
    saveHistory([]);
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
