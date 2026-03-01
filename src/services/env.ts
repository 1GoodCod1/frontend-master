export type AppEnv = {
  apiUrl: string;
  wsUrl: string;
  envName: string;
  useHttpOnly: boolean;
};

function pick(...vals: Array<string | undefined | null>): string | undefined {
  for (const v of vals) {
    const s = (v ?? '').toString().trim();
    if (s) return s;
  }
  return undefined;
}

function fromWindow(key: string): string | undefined {
  try {
    const v = (window as unknown as Record<string, unknown>)?.[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  } catch {
    // ignore access errors
  }
  return undefined;
}

// Vite: use VITE_*
// Fallback: allow injecting values at runtime (optional) by setting window.__MOLDMASTERS_ENV__ = { apiUrl, wsUrl, envName }
const runtime = (() => {
  try {
    return window.__MOLDMASTERS_ENV__ as Partial<AppEnv> | undefined;
  } catch {
    return undefined;
  }
})();

export const env: AppEnv = {
  apiUrl:
    pick(import.meta.env.VITE_API_URL, runtime?.apiUrl, fromWindow('__REACT_APP_API_URL__')) || 'http://localhost:4000',
  wsUrl: pick(import.meta.env.VITE_WS_URL, runtime?.wsUrl, fromWindow('__REACT_APP_WS_URL__')) || 'ws://localhost:4000',
  envName: pick(import.meta.env.VITE_ENV, runtime?.envName) || 'development',
  useHttpOnly: import.meta.env.VITE_USE_HTTPONLY === 'true',
};
