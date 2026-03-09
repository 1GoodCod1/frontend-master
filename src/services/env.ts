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

// Vite: use VITE_*
// Fallback: allow injecting values at runtime (optional) by setting window.__MASTER_HUB_ENV__ = { apiUrl, wsUrl, envName }
const runtime = (() => {
  try {
    return window.__MASTER_HUB_ENV__ as Partial<AppEnv> | undefined;
  } catch {
    return undefined;
  }
})();

export const env: AppEnv = {
  apiUrl: pick(import.meta.env.VITE_API_URL, runtime?.apiUrl) || 'http://localhost:4000',
  wsUrl: pick(import.meta.env.VITE_WS_URL, runtime?.wsUrl) || 'ws://localhost:4000',
  envName: pick(import.meta.env.VITE_ENV, runtime?.envName) || 'development',
  useHttpOnly: (() => {
    const explicit = import.meta.env.VITE_USE_HTTPONLY;
    if (explicit === 'true') return true;
    if (explicit === 'false') return false;
    const isProd = import.meta.env.MODE === 'production' || import.meta.env.VITE_ENV === 'production';
    return isProd;
  })(),
};
