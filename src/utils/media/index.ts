import { env } from '@/services/env';

function getBaseUrl(): string {
  const url = env.apiUrl ?? '';
  return (
    url
      .replace(/\/api\/v1\/?$/, '')
      .replace(/\/api\/?$/, '') || 'http://localhost:4000'
  );
}

export function mediaUrl(p?: string | null): string {
  if (!p) return '';
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  const base = getBaseUrl();
  if (p.startsWith('/')) return `${base}${p}`;
  return `${base}/${p}`;
}
