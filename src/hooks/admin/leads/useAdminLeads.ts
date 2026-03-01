import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { clearUnreadLeads } from '@/features/socket/socketSlice';
import { useAdminLeadsQuery } from '@/features/admin/adminApi';
import { useLeadsUpdateStatusMutation } from '@/features/leads/leadsApi';
import { LEAD_STATUS_OPTIONS, type LeadStatus } from '@/types/leads';
import { formatDateTimeString } from '@/utils/date';
import toast from 'react-hot-toast';

export const STATUS_OPTIONS = LEAD_STATUS_OPTIONS;
export type StatusOption = LeadStatus;

type AdminLeadRow = {
  id: string;
  status?: string | null;
  clientName?: string | null;
  clientPhone?: string | null;
  name?: string | null;
  phone?: string | null;
  message?: string | null;
  isPremium?: boolean | null;
  createdAt?: string | null;
  master?: { user?: { firstName?: string | null; lastName?: string | null } | null } | null;
} & Record<string, unknown>;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function unwrapEnvelope(raw: unknown): unknown {
  return isRecord(raw) && 'data' in raw ? (raw as { data: unknown }).data : raw;
}

function toErrorMessage(e: unknown): string | undefined {
  if (!isRecord(e)) return undefined;
  const data = isRecord(e.data) ? e.data : undefined;
  return (
    (typeof data?.message === 'string' ? data.message : undefined) ??
    (typeof e.message === 'string' ? e.message : undefined)
  );
}

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
  const [pageCursors, setPageCursors] = useState<Record<number, string | undefined>>({ 1: undefined });

  const cursorForPage = pageCursors[page];
  const cursor = typeof cursorForPage === 'string' && cursorForPage ? cursorForPage : undefined;

  useEffect(() => {
    setPage(1);
    setPageCursors({ 1: undefined });
  }, [limit, status, dateFrom, dateTo]);

  const recent = useAppSelector((s) => s.socket.recent.leads);
  const isRecent = useCallback(
    (id: unknown) => {
      const key = String(id ?? '');
      const ts = recent[key];
      if (!ts) return false;
      return Date.now() - ts < 2 * 60 * 1000;
    },
    [recent],
  );

  useEffect(() => {
    dispatch(clearUnreadLeads());
  }, [dispatch]);

  const q = useAdminLeadsQuery({
    page,
    limit,
    ...(cursor ? { cursor } : {}),
    ...(status ? { status } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  });
  const [updateStatus, upd] = useLeadsUpdateStatusMutation();

  const responseData = unwrapEnvelope(q.data);
  const allLeads: AdminLeadRow[] =
    isRecord(responseData) && Array.isArray(responseData.items)
      ? (responseData.items.filter(isRecord) as AdminLeadRow[])
      : isRecord(responseData) && Array.isArray(responseData.leads)
        ? (responseData.leads.filter(isRecord) as AdminLeadRow[])
        : Array.isArray(responseData)
          ? (responseData.filter(isRecord) as AdminLeadRow[])
          : [];
  const totalLeads = allLeads.length;
  const newLeads = allLeads.filter((l) => l.status === 'NEW').length;
  const inProgressLeads = allLeads.filter((l) => l.status === 'IN_PROGRESS').length;
  const closedLeads = allLeads.filter((l) => l.status === 'CLOSED').length;
  const premiumLeads = allLeads.filter((l) => l.isPremium).length;

  const leadsData = useMemo(
    () => ({
      items: allLeads,
      meta:
        (isRecord(responseData) ? (responseData.pagination ?? responseData.meta) : undefined) ||
        { total: allLeads.length, page, limit },
    }),
    [allLeads, responseData, page, limit],
  );

  useEffect(() => {
    const meta = isRecord(responseData) ? (responseData.pagination ?? responseData.meta) : undefined;
    const next = isRecord(meta) && typeof meta.nextCursor === 'string' ? meta.nextCursor : undefined;
    if (!next) return;
    setPageCursors((prev) => (prev[page + 1] === next ? prev : { ...prev, [page + 1]: next }));
  }, [page, responseData]);

  const exportToCSV = () => {
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

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Leads exported to CSV');
  };

  const applyBulkStatus = async () => {
    if (!selection.length) return toast.error('Select rows first');
    const t = toast.loading(`Updating ${selection.length} lead(s)...`);
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

  return {
    page,
    setPage,
    limit,
    setLimit,
    status,
    setStatus,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    selection,
    setSelection,
    bulkStatus,
    setBulkStatus,
    selectedLead,
    setSelectedLead,
    confirmOpen,
    setConfirmOpen,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    leadsData,
    allLeads,
    statistics: {
      totalLeads,
      newLeads,
      inProgressLeads,
      closedLeads,
      premiumLeads,
    },
    isRecent,
    updateStatusLoading: upd.isLoading,
    exportToCSV,
    applyBulkStatus,
    clearFilters,
  };
}
