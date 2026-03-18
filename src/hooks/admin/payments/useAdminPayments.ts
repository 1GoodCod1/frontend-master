import { useEffect, useMemo, useState } from 'react';
import { useAdminPaymentsQuery } from '@/features/admin/adminApi';
import { formatDateTimeString } from '@/utils/date';
import { parseAdminPaginatedResponse, toNumber } from '@/utils/data';
import { exportToCSV } from '@/utils/csvExport';
import type { AdminPaymentRow } from '.';

export function useAdminPayments() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentRow | null>(null);
  const [pageCursors, setPageCursors] = useState<Record<number, string | undefined>>({ 1: undefined });

  const cursor =
    typeof pageCursors[page] === 'string' && pageCursors[page] ? pageCursors[page] : undefined;

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
    status: status || undefined,
  });

  const { items: allPayments, meta } = useMemo(
    () =>
      parseAdminPaginatedResponse<AdminPaymentRow>(q.data, {
        page,
        limit,
        total: 0,
      }),
    [q.data, page, limit],
  );

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
      meta,
    }),
    [allPayments, meta],
  );

  useEffect(() => {
    const next = meta?.nextCursor && typeof meta.nextCursor === 'string' ? meta.nextCursor : undefined;
    if (!next) return;
    queueMicrotask(() =>
      setPageCursors((prev) => (prev[page + 1] === next ? prev : { ...prev, [page + 1]: next })));
  }, [page, meta]);

  const doExportToCSV = () => {
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
    exportToCSV(headers, rows, 'payments_export', 'Payments exported to CSV');
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
    exportToCSV: doExportToCSV,
    clearFilters,
  };
}
