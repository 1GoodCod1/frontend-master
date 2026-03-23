import { useState, useEffect, useMemo } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { clearUnreadLeads } from '@/features/socket/socketSlice';
import { useAdminLeadsQuery, useAdminLeadsStatsQuery, useLazyAdminLeadsExportQuery } from '@/features/admin/adminApi';
import { formatDateTimeString } from '@/utils/date';
import toast from 'react-hot-toast';
import { parseAdminPaginatedResponse } from '@/utils/data';
import { exportToCSV } from '@/utils/csvExport';
import { toErrorMessage } from '@/utils/errors';
import { useAdminCursors } from '../useAdminCursors';
import { useIsRecent } from '../useIsRecent';
import type { AdminLeadRow } from '.';

export function useAdminLeads() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<AdminLeadRow | null>(null);

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

  // Global stats — always reflect total counts regardless of pagination, auto-refresh every 30s
  const statsQ = useAdminLeadsStatsQuery(
    {
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    },
    { pollingInterval: 30000 },
  );

  const statsRaw = statsQ.data as Record<string, unknown> | undefined;
  const statsData = (statsRaw && 'data' in statsRaw ? statsRaw.data : statsRaw) as
    | { total?: number; newCount?: number; inProgressCount?: number; closedCount?: number; premiumCount?: number }
    | undefined;

  const statistics = {
    totalLeads: Number(statsData?.total ?? 0),
    newLeads: Number(statsData?.newCount ?? 0),
    inProgressLeads: Number(statsData?.inProgressCount ?? 0),
    closedLeads: Number(statsData?.closedCount ?? 0),
    premiumLeads: Number(statsData?.premiumCount ?? 0),
  };

  // Lazy export — fetches ALL leads matching current filters
  const [triggerExport] = useLazyAdminLeadsExportQuery();

  const doExportToCSV = async () => {
    const t = toast.loading('Preparing export...');
    try {
      const result = await triggerExport({
        ...(status ? { status } : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
      }).unwrap();

      const raw = result as Record<string, unknown>;
      const inner = ('data' in raw ? raw.data : raw) as Record<string, unknown>;
      const leads = (Array.isArray(inner?.leads) ? inner.leads : []) as AdminLeadRow[];

      const headers = ['ID', 'Status', 'Client Name', 'Phone', 'Master', 'Message', 'Premium', 'Created At'];
      const rows = leads.map((lead) => [
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
      toast.dismiss(t);
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? 'Export failed', { id: t });
    }
  };

  const clearFilters = () => {
    setStatus('');
    setDateFrom('');
    setDateTo('');
  };

  const isRecent: (id: unknown) => boolean = useIsRecent('leads');

  return {
    page, setPage, limit, setLimit,
    status, setStatus, dateFrom, setDateFrom, dateTo, setDateTo,
    selectedLead, setSelectedLead,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    leadsData, allLeads,
    statistics,
    isRecent,
    exportToCSV: doExportToCSV,
    clearFilters,
  };
}
