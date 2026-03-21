import { useState, useEffect, useMemo } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { clearUnreadLeads } from '@/features/socket/socketSlice';
import { useAdminLeadsQuery } from '@/features/admin/adminApi';
import { useLeadsUpdateStatusMutation } from '@/features/leads/leadsApi';
import { formatDateTimeString } from '@/utils/date';
import toast from 'react-hot-toast';
import { parseAdminPaginatedResponse } from '@/utils/data';
import { exportToCSV } from '@/utils/csvExport';
import { toErrorMessage } from '@/utils/errors';
import { useAdminCursors } from '../useAdminCursors';
import { useIsRecent } from '../useIsRecent';
import type { AdminLeadRow, StatusOption } from '.';

export function useAdminLeads() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selection, setSelection] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<StatusOption>('IN_PROGRESS');
  const [selectedLead, setSelectedLead] = useState<AdminLeadRow | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { cursor, resetCursors, updateMeta } = useAdminCursors(page);

  useEffect(() => {
    queueMicrotask(() => {
      setPage(1);
      resetCursors();
    });
  }, [limit, status, dateFrom, dateTo, resetCursors]);

  const q = useAdminLeadsQuery({
    page,
    limit,
    ...(cursor ? { cursor } : {}),
    ...(status ? { status } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  });

  const { items: allLeads, meta } = useMemo(
    () =>
      parseAdminPaginatedResponse<AdminLeadRow>(q.data, {
        page, limit, total: 0,
      }),
    [q.data, page, limit],
  );

  useEffect(() => { updateMeta(meta); }, [meta, updateMeta]);

  useEffect(() => {
    dispatch(clearUnreadLeads());
  }, [dispatch]);

  const leadsData = useMemo(() => ({ items: allLeads, meta }), [allLeads, meta]);

  const totalLeads = allLeads.length;
  const newLeads = allLeads.filter((l) => l.status === 'NEW').length;
  const inProgressLeads = allLeads.filter((l) => l.status === 'IN_PROGRESS').length;
  const closedLeads = allLeads.filter((l) => l.status === 'CLOSED').length;
  const premiumLeads = allLeads.filter((l) => l.isPremium).length;

  const [updateStatus, upd] = useLeadsUpdateStatusMutation();

  const doExportToCSV = () => {
    const headers = ['ID', 'Status', 'Client Name', 'Phone', 'Master', 'Message', 'Premium', 'Created At'];
    const rows = allLeads.map((lead) => [
      lead.id,
      lead.status,
      lead.clientName || lead.name || '-',
      lead.clientPhone || lead.phone || '-',
      lead.master ? `${lead.master.user?.firstName || ''} ${lead.master.user?.lastName || ''}`.trim() : '-',
      lead.message || '-',
      lead.isPremium ? 'Yes' : 'No',
      lead.createdAt ? formatDateTimeString(lead.createdAt) : '',
    ]);
    exportToCSV(headers, rows, 'requests_export', 'Requests exported to CSV');
  };

  const applyBulkStatus = async () => {
    if (!selection.length) return toast.error('Select rows first');
    const t = toast.loading(`Updating ${selection.length} request(s)...`);
    try {
      for (const id of selection) {
        await updateStatus({ id, body: { status: bulkStatus } }).unwrap();
      }
      toast.success('Updated', { id: t });
      setSelection([]);
      q.refetch();
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? 'Failed', { id: t });
    }
  };

  const clearFilters = () => {
    setStatus('');
    setDateFrom('');
    setDateTo('');
  };

  const isRecent = useIsRecent('leads');

  return {
    page, setPage, limit, setLimit,
    status, setStatus, dateFrom, setDateFrom, dateTo, setDateTo,
    selection, setSelection, bulkStatus, setBulkStatus,
    selectedLead, setSelectedLead, confirmOpen, setConfirmOpen,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    leadsData, allLeads,
    statistics: { totalLeads, newLeads, inProgressLeads, closedLeads, premiumLeads },
    isRecent,
    updateStatusLoading: upd.isLoading,
    exportToCSV: doExportToCSV,
    applyBulkStatus, clearFilters,
  };
}
