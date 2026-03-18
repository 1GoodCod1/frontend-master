import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReportsListQuery, useReportsUpdateStatusMutation } from '@/features/reports/reportsApi';
import { formatDateTimeString } from '@/utils/date';
import { isRecord } from '@/utils/guards';
import { toErrorMessage } from '@/utils/errors';
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
  const [updateStatus, updateState] = useReportsUpdateStatusMutation();

  const reportsList: ReportRow[] = (() => {
    const raw = reports.data as unknown;
    if (Array.isArray(raw)) return raw.filter(isRecord) as ReportRow[];
    if (isRecord(raw) && Array.isArray(raw.data)) return raw.data.filter(isRecord) as ReportRow[];
    return [];
  })();

  // Calculate statistics
  const totalReports = reportsList.length;
  const pendingReports = reportsList.filter((r) => r.status === 'PENDING').length;
  const reviewedReports = reportsList.filter((r) => r.status === 'REVIEWED').length;
  const resolvedReports = reportsList.filter((r) => r.status === 'RESOLVED').length;
  const rejectedReports = reportsList.filter((r) => r.status === 'REJECTED').length;

  const exportToCSV = () => {
    const headers = ['ID', 'Status', 'Reason', 'Client', 'Master', 'Description', 'Created At'];
    const rows = reportsList.map((report) => [
      report.id,
      report.status,
      report.reason,
      report.client?.email || '-',
      report.master ? `${report.master.user?.firstName || ''} ${report.master.user?.lastName || ''}`.trim() : '-',
      report.description || '-',
      report.createdAt ? formatDateTimeString(report.createdAt) : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reports_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Reports exported to CSV');
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
    isLoading: reports.isLoading,
    isError: reports.isError,
    error: reports.error,
    refetch: reports.refetch,
    statistics: {
      totalReports,
      pendingReports,
      reviewedReports,
      resolvedReports,
      rejectedReports,
    },
    updateStatusLoading: updateState.isLoading,
    exportToCSV,
    handleOpenDialog,
    handleCloseDialog,
    handleUpdateStatus,
  };
}
