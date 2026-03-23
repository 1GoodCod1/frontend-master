import { useEffect, useMemo, useState } from 'react';
import {
  useAdminPaymentsQuery,
  useAdminPaymentsStatsQuery,
  useLazyAdminPaymentsExportQuery,
} from '@/features/admin/adminApi';
import { formatDateTimeString } from '@/utils/date';
import { parseAdminPaginatedResponse } from '@/utils/data';
import { exportToCSV } from '@/utils/csvExport';
import { useAdminCursors } from '../useAdminCursors';
import toast from 'react-hot-toast';
import { toErrorMessage } from '@/utils/errors';
import type { AdminPaymentRow } from '.';

export function useAdminPayments() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentRow | null>(null);

  const { cursor, resetCursors, updateMeta } = useAdminCursors(page);

  useEffect(() => {
    queueMicrotask(() => {
      setPage(1);
      resetCursors();
    });
  }, [limit, status, resetCursors]);

  const q = useAdminPaymentsQuery({
    page,
    limit,
    ...(cursor ? { cursor } : {}),
    status: status || undefined,
  });

  const statsQ = useAdminPaymentsStatsQuery(undefined, { pollingInterval: 30000 });
  const [triggerExport] = useLazyAdminPaymentsExportQuery();

  const { items: allPayments, meta } = useMemo(
    () =>
      parseAdminPaginatedResponse<AdminPaymentRow>(q.data, {
        page, limit, total: 0,
      }),
    [q.data, page, limit],
  );

  useEffect(() => { updateMeta(meta); }, [meta, updateMeta]);

  const statsRaw = statsQ.data as Record<string, unknown> | undefined;
  const statsData = (statsRaw && 'data' in statsRaw ? statsRaw.data : statsRaw) as
    | {
        total?: number;
        pendingCount?: number;
        paidCount?: number;
        failedCount?: number;
        totalRevenue?: number;
      }
    | undefined;

  const statistics = {
    totalPayments: Number(statsData?.total ?? 0),
    paidPayments: Number(statsData?.paidCount ?? 0),
    pendingPayments: Number(statsData?.pendingCount ?? 0),
    failedPayments: Number(statsData?.failedCount ?? 0),
    totalRevenue: Number(Number(statsData?.totalRevenue ?? 0).toFixed(2)),
  };

  const paymentsData = useMemo(() => ({ items: allPayments, meta }), [allPayments, meta]);

  const totalMatching = meta?.total ?? 0;

  const doExportToCSV = async () => {
    const loading = toast.loading('Preparing export...');
    try {
      const result = await triggerExport(
        status ? { status } : {},
      ).unwrap();

      const raw = result as Record<string, unknown>;
      const inner = ('data' in raw ? raw.data : raw) as Record<string, unknown>;
      const payments = (Array.isArray(inner?.payments) ? inner.payments : []) as AdminPaymentRow[];

      const headers = ['ID', 'Status', 'Master', 'Tariff', 'Amount', 'Currency', 'Created At'];
      const rows = payments.map((payment) => [
        payment.id,
        payment.status,
        payment.master
          ? `${payment.master.user?.firstName || ''} ${payment.master.user?.lastName || ''}`.trim() || '-'
          : '-',
        payment.tariffType || payment.plan || payment.type || '-',
        payment.amount ?? '0',
        payment.currency || 'MDL',
        payment.createdAt ? formatDateTimeString(payment.createdAt) : '',
      ]);

      exportToCSV(headers, rows, 'payments_export', 'Payments exported to CSV');
      toast.dismiss(loading);
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? 'Export failed', { id: loading });
    }
  };

  const clearFilters = () => {
    setStatus('');
  };

  return {
    page, setPage, limit, setLimit,
    status, setStatus,
    selectedPayment, setSelectedPayment,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    paymentsData, allPayments,
    statistics,
    totalMatching,
    exportToCSV: doExportToCSV,
    clearFilters,
  };
}
