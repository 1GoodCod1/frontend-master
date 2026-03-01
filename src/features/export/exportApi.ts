import axios from 'axios';
import { env } from '@/services/env';

// Helper function to download file
async function downloadFile(url: string, filename: string, accessToken?: string) {
  const response = await axios.get(url, {
    responseType: 'blob',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
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
    const url = `${env.apiUrl}/export/leads/csv/${masterId}`;
    const filename = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    await downloadFile(url, filename, accessToken);
  },

  async exportLeadsExcel(masterId: string, accessToken?: string) {
    const url = `${env.apiUrl}/export/leads/excel/${masterId}`;
    const filename = `leads_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    await downloadFile(url, filename, accessToken);
  },

  async exportAnalyticsPDF(masterId: string, accessToken?: string) {
    const url = `${env.apiUrl}/export/analytics/pdf/${masterId}`;
    const filename = `analytics_${masterId}_${new Date().toISOString().split('T')[0]}.pdf`;
    await downloadFile(url, filename, accessToken);
  },
};
