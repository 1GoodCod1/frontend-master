/**
 * Storage with incognito/private mode support.
 * Falls back to sessionStorage when localStorage throws (Safari private, Firefox private, etc.).
 * In incognito, data persists only for the session — expected behavior.
 */

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    const k = '__safe_storage_test__';
    window.localStorage.setItem(k, k);
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch {
    return window.sessionStorage;
  }
}

let _storage: Storage | null = null;

function storage(): Storage | null {
  if (_storage !== null) return _storage;
  _storage = getStorage();
  return _storage;
}

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      const s = storage();
      return s ? s.getItem(key) : null;
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      const s = storage();
      if (s) s.setItem(key, value);
    } catch {
      try {
        if (typeof window !== 'undefined') window.sessionStorage.setItem(key, value);
      } catch {
        // both failed — incognito with strict restrictions
      }
    }
  },

  removeItem(key: string): void {
    try {
      const s = storage();
      if (s) s.removeItem(key);
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(key);
    } catch {
      //
    }
  },
};

/** redux-persist compatible storage (async API — returns Promises) */
export const safePersistStorage = {
  getItem: (key: string): Promise<string | null> =>
    Promise.resolve(safeStorage.getItem(key)),
  setItem: (key: string, value: string): Promise<void> => {
    safeStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    safeStorage.removeItem(key);
    return Promise.resolve();
  },
};
