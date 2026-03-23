import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useReportsListQuery,
  useReportsStatsQuery,
  useLazyReportsExportQuery,
  useReportsUpdateStatusMutation,
} from '@/features/reports/reportsApi';
import { formatDateTimeString } from '@/utils/date';
import { isRecord } from '@/utils/guards';
import { toErrorMessage } from '@/utils/errors';
import { exportToCSV } from '@/utils/csvExport';
import toast from 'react-hot-toast';
import type { ReportRow } from '.';

export function useAdminReports() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [action, setAction] = useState<string>('');
  const [notes, setNotes] = useState('');

  const reports = useReportsListQuery(statusFilter ? { status: statusFilter } : undefined);
  const statsQ = useReportsStatsQuery(undefined, { pollingInterval: 30000 });
  const [triggerExport] = useLazyReportsExportQuery();
  const [updateStatus, updateState] = useReportsUpdateStatusMutation();

  const reportsList: ReportRow[] = (() => {
    const raw = reports.data as unknown;
    if (Array.isArray(raw)) return raw.filter(isRecord) as ReportRow[];
    if (isRecord(raw) && Array.isArray(raw.data)) return raw.data.filter(isRecord) as ReportRow[];
    return [];
  })();

  const statsRaw = statsQ.data as Record<string, unknown> | undefined;
  const statsData = (statsRaw && 'data' in statsRaw ? statsRaw.data : statsRaw) as
    | {
        total?: number;
        pendingCount?: number;
        reviewedCount?: number;
        resolvedCount?: number;
        rejectedCount?: number;
      }
    | undefined;

  const statistics = {
    totalReports: Number(statsData?.total ?? 0),
    pendingReports: Number(statsData?.pendingCount ?? 0),
    reviewedReports: Number(statsData?.reviewedCount ?? 0),
    resolvedReports: Number(statsData?.resolvedCount ?? 0),
    rejectedReports: Number(statsData?.rejectedCount ?? 0),
  };

  const totalMatching = reportsList.length;

  const doExportToCSV = async () => {
    const loading = toast.loading('Preparing export...');
    try {
      const result = await triggerExport(
        statusFilter ? { status: statusFilter } : {},
      ).unwrap();

      const raw = result as Record<string, unknown>;
      const inner = ('data' in raw ? raw.data : raw) as Record<string, unknown>;
      const exported = (Array.isArray(inner?.reports) ? inner.reports : []) as ReportRow[];

      const headers = ['ID', 'Status', 'Reason', 'Client', 'Master', 'Description', 'Created At'];
      const rows = exported.map((report) => [
        report.id,
        report.status,
        report.reason ?? '-',
        report.client?.email || report.client?.phone || '-',
        report.master
          ? `${report.master.user?.firstName || ''} ${report.master.user?.lastName || ''}`.trim() || '-'
          : '-',
        report.description || '-',
        report.createdAt ? formatDateTimeString(report.createdAt) : '',
      ]);

      exportToCSV(headers, rows, 'reports_export', 'Reports exported to CSV');
      toast.dismiss(loading);
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? 'Export failed', { id: loading });
    }
  };

  const handleOpenDialog = (report: ReportRow) => {
    setSelectedReport(report);
    setOpenDialog(true);
    setAction('');
    setNotes('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReport(null);
    setAction('');
    setNotes('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport || !action) return;

    try {
      await updateStatus({
        id: selectedReport.id,
        status: action === 'REJECTED' ? 'REJECTED' : 'RESOLVED',
        action: action !== 'REJECTED' && action !== 'RESOLVED' ? action : undefined,
        notes: notes || undefined,
      }).unwrap();
      toast.success(t('admin.reports.statusUpdated'));
      handleCloseDialog();
      reports.refetch();
    } catch (error: unknown) {
      toast.error(toErrorMessage(error) ?? t('admin.reports.updateFailed'));
    }
  };

  return {
    statusFilter,
    setStatusFilter,
    selectedReport,
    openDialog,
    action,
    setAction,
    notes,
    setNotes,
    reportsList,
    totalMatching,
    isLoading: reports.isLoading,
    isError: reports.isError,
    error: reports.error,
    refetch: reports.refetch,
    statistics,
    updateStatusLoading: updateState.isLoading,
    exportToCSV: doExportToCSV,
    handleOpenDialog,
    handleCloseDialog,
    handleUpdateStatus,
  };
}
