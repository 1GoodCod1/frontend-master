import axios, { isAxiosError } from 'axios';
import { env } from '@/services/env';
import { getSessionId } from '@/utils/sessionId';
import { isRecord } from '@/utils/guards';

const EXPORT_HTTP_TIMEOUT_MS = 30_000;
/** Large Excel/PDF responses may exceed default client timeout. */
const EXPORT_DOWNLOAD_TIMEOUT_MS = 120_000;

/** Same transport as RTK axios (cookies + session header for authenticated flows). */
function exportRequestConfig(accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const sid = getSessionId(!!accessToken);
  if (sid) headers['x-session-id'] = sid;
  return {
    withCredentials: env.useHttpOnly,
    timeout: EXPORT_HTTP_TIMEOUT_MS,
    headers,
  };
}

function messageFromAxiosError(err: unknown): string {
  if (!isAxiosError(err)) {
    return err instanceof Error ? err.message : 'Export failed';
  }
  const d = err.response?.data;
  if (isRecord(d)) {
    const m = d.message;
    if (typeof m === 'string') return m;
    if (Array.isArray(m) && m.length > 0 && typeof m[0] === 'string') return m[0];
  }
  if (typeof d === 'string') return d;
  return err.message || 'Export failed';
}

async function runExport<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    throw new Error(messageFromAxiosError(e));
  }
}

// Helper function to download file
async function downloadFile(url: string, filename: string, accessToken?: string) {
  const response = await axios.get(url, {
    ...exportRequestConfig(accessToken),
    timeout: EXPORT_DOWNLOAD_TIMEOUT_MS,
    responseType: 'blob',
  });

  const blob = new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = downloadUrl;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  window.URL.revokeObjectURL(downloadUrl);
  document.body.removeChild(link);
}

export const exportService = {
  async exportLeadsCSV(masterId: string, accessToken?: string) {
    return runExport(async () => {
      const url = `${env.apiUrl}/export/leads/csv/${encodeURIComponent(masterId)}`;
      const filename = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
      await downloadFile(url, filename, accessToken);
    });
  },

  async exportLeadsExcel(masterId: string, accessToken?: string) {
    return runExport(async () => {
      const url = `${env.apiUrl}/export/leads/excel/${encodeURIComponent(masterId)}`;
      const filename = `leads_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      await downloadFile(url, filename, accessToken);
    });
  },

  async exportAnalyticsPDF(
    masterId: string,
    accessToken?: string,
    locale?: string,
  ) {
    return runExport(async () => {
      const params = locale ? `?locale=${locale}` : '';
      const url = `${env.apiUrl}/export/analytics/pdf/${encodeURIComponent(masterId)}${params}`;
      const filename = `analytics_${masterId}_${new Date().toISOString().split('T')[0]}.pdf`;
      await downloadFile(url, filename, accessToken);
    });
  },
};
