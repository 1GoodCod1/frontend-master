import { useEffect, useMemo, useState } from 'react';
import { useAdminPaymentsQuery } from '@/features/admin/adminApi';
import { formatDateTimeString } from '@/utils/date';
import toast from 'react-hot-toast';

export type AdminPaymentRow = {
  id: string;
  status?: string | null;
  amount?: string | number | null;
  currency?: string | null;
  tariffType?: string | null;
  plan?: string | null;
  type?: string | null;
  createdAt?: string | null;
  master?: { user?: { firstName?: string | null; lastName?: string | null } | null } | null;
} & Record<string, unknown>;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function unwrapEnvelope(raw: unknown): unknown {
  return isRecord(raw) && 'data' in raw ? (raw as { data: unknown }).data : raw;
}

function toNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function useAdminPayments() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentRow | null>(null);
  const [pageCursors, setPageCursors] = useState<Record<number, string | undefined>>({ 1: undefined });

  const cursorForPage = pageCursors[page];
  const cursor = typeof cursorForPage === 'string' && cursorForPage ? cursorForPage : undefined;

  useEffect(() => {
    queueMicrotask(() => {
      setPage(1);
      setPageCursors({ 1: undefined });
    });
  }, [limit, status]);

  const q = useAdminPaymentsQuery({ 
    page, 
    limit, 
    ...(cursor ? { cursor } : {}),
    status: status || undefined 
  });

  const responseData = unwrapEnvelope(q.data);
  const allPayments: AdminPaymentRow[] = useMemo(() => {
    if (isRecord(responseData) && Array.isArray(responseData.items)) {
      return responseData.items.filter(isRecord) as AdminPaymentRow[];
    }
    if (isRecord(responseData) && Array.isArray(responseData.payments)) {
      return responseData.payments.filter(isRecord) as AdminPaymentRow[];
    }
    return Array.isArray(responseData) ? (responseData.filter(isRecord) as AdminPaymentRow[]) : [];
  }, [responseData]);
  
  const totalPayments = allPayments.length;
  const paidPayments = allPayments.filter((p) => p.status === 'PAID' || p.status === 'COMPLETED').length;
  const pendingPayments = allPayments.filter((p) => p.status === 'PENDING').length;
  const failedPayments = allPayments.filter((p) => p.status === 'FAILED').length;
  const totalRevenue = allPayments
    .filter((p) => p.status === 'PAID' || p.status === 'COMPLETED')
    .reduce((sum, p) => sum + toNumber(p.amount), 0);

  const paymentsData = useMemo(
    () => ({
      items: allPayments,
      meta: (isRecord(responseData) ? (responseData.pagination ?? responseData.meta) : undefined) || { 
        total: allPayments.length, 
        page, 
        limit 
      },
    }),
    [allPayments, responseData, page, limit],
  );

  useEffect(() => {
    const meta = isRecord(responseData) ? (responseData.pagination ?? responseData.meta) : undefined;
    const next = isRecord(meta) && typeof meta.nextCursor === 'string' ? meta.nextCursor : undefined;
    if (!next) return;
    queueMicrotask(() =>
      setPageCursors((prev) => (prev[page + 1] === next ? prev : { ...prev, [page + 1]: next }))
    );
  }, [page, responseData]);

  const exportToCSV = () => {
    const headers = ['ID', 'Status', 'Master', 'Tariff', 'Amount', 'Currency', 'Created At'];
    const rows = allPayments.map((payment) => [
      payment.id,
      payment.status,
      payment.master ? `${payment.master.user?.firstName || ''} ${payment.master.user?.lastName || ''}`.trim() : '-',
      payment.tariffType || payment.plan || payment.type || '-',
      payment.amount || '0',
      payment.currency || 'MDL',
      payment.createdAt ? formatDateTimeString(payment.createdAt) : '',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Payments exported to CSV');
  };

  const clearFilters = () => {
    setStatus('');
  };

  return {
    page,
    setPage,
    limit,
    setLimit,
    status,
    setStatus,
    selectedPayment,
    setSelectedPayment,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    paymentsData,
    allPayments,
    statistics: {
      totalPayments,
      paidPayments,
      pendingPayments,
      failedPayments,
      totalRevenue,
    },
    exportToCSV,
    clearFilters,
  };
}
