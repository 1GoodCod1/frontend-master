const KEY = 'master-hub.refreshToken';
const LOGOUT_FLAG_KEY = 'master-hub.logout';

export function loadPersistedRefreshToken(): string | null {
  try {
    const v = localStorage.getItem(KEY);
    return v && v.trim() ? v : null;
  } catch {
    return null;
  }
}

export function persistRefreshToken(refreshToken: string | null) {
  try {
    if (refreshToken && refreshToken.trim()) localStorage.setItem(KEY, refreshToken);
    else localStorage.removeItem(KEY);
  } catch {
    // ignore localStorage errors
  }
}

export function setLogoutFlag() {
  try {
    sessionStorage.setItem(LOGOUT_FLAG_KEY, '1');
  } catch {
    // ignore sessionStorage errors
  }
}

export function takeLogoutFlag(): boolean {
  try {
    const v = sessionStorage.getItem(LOGOUT_FLAG_KEY);
    sessionStorage.removeItem(LOGOUT_FLAG_KEY);
    return v === '1';
  } catch {
    return false;
  }
}
