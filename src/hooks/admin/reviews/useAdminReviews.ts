import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { clearUnreadReviews } from '@/features/socket/socketSlice';
import {
  useAdminReviewsQuery,
  useAdminReviewsStatsQuery,
  useLazyAdminReviewsExportQuery,
} from '@/features/admin/adminApi';
import { useReviewsUpdateStatusMutation } from '@/features/reviews/reviewsApi';
import { formatDateTimeString } from '@/utils/date';
import toast from 'react-hot-toast';
import { parseAdminPaginatedResponse } from '@/utils/data';
import { exportToCSV } from '@/utils/csvExport';
import { toErrorMessage } from '@/utils/errors';
import { useAdminCursors } from '../useAdminCursors';
import { useIsRecent } from '../useIsRecent';
import type { AdminReviewRow } from '.';

export function useAdminReviews() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedReview, setSelectedReview] = useState<AdminReviewRow | null>(null);

  const isRecent = useIsRecent('reviews');
  const { cursor, resetCursors, updateMeta } = useAdminCursors(page);

  useEffect(() => {
    dispatch(clearUnreadReviews());
  }, [dispatch]);

  useEffect(() => {
    queueMicrotask(() => {
      setPage(1);
      resetCursors();
    });
  }, [limit, statusFilter, resetCursors]);

  const q = useAdminReviewsQuery({
    page,
    limit,
    ...(cursor ? { cursor } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  });
  const [updateStatus, upd] = useReviewsUpdateStatusMutation();

  const { items: allReviews, meta } = useMemo(
    () =>
      parseAdminPaginatedResponse<AdminReviewRow>(q.data, {
        page, limit, total: 0,
      }),
    [q.data, page, limit],
  );

  useEffect(() => { updateMeta(meta); }, [meta, updateMeta]);

  const statsQ = useAdminReviewsStatsQuery(undefined, { pollingInterval: 30000 });
  const statsRaw = statsQ.data as Record<string, unknown> | undefined;
  const statsData = (statsRaw && 'data' in statsRaw ? statsRaw.data : statsRaw) as
    | {
        total?: number;
        pendingCount?: number;
        visibleCount?: number;
        hiddenCount?: number;
        reportedCount?: number;
      }
    | undefined;

  const statistics = {
    totalReviews: Number(statsData?.total ?? 0),
    pendingReviews: Number(statsData?.pendingCount ?? 0),
    visibleReviews: Number(statsData?.visibleCount ?? 0),
    hiddenReviews: Number(statsData?.hiddenCount ?? 0),
    reportedReviews: Number(statsData?.reportedCount ?? 0),
  };

  const reviewsData = useMemo(() => ({ items: allReviews, meta }), [allReviews, meta]);

  const [triggerExport] = useLazyAdminReviewsExportQuery();

  const doExportToCSV = async () => {
    const t = toast.loading('Preparing export...');
    try {
      const result = await triggerExport(
        statusFilter ? { status: statusFilter } : {},
      ).unwrap();

      const raw = result as Record<string, unknown>;
      const inner = ('data' in raw ? raw.data : raw) as Record<string, unknown>;
      const reviews = (Array.isArray(inner?.reviews) ? inner.reviews : []) as AdminReviewRow[];

      const headers = ['ID', 'Client Name', 'Master', 'Rating', 'Status', 'Comment', 'Created At'];
      const rows = reviews.map((review) => [
        review.id,
        review.clientName || '-',
        review.master ? `${review.master.user?.firstName || ''} ${review.master.user?.lastName || ''}`.trim() : '-',
        review.rating || '0',
        review.status,
        review.comment || '-',
        review.createdAt ? formatDateTimeString(review.createdAt) : '',
      ]);

      exportToCSV(headers, rows, 'reviews_export', 'Reviews exported to CSV');
      toast.dismiss(t);
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? 'Export failed', { id: t });
    }
  };

  const handleToggleVisibility = async (review: AdminReviewRow) => {
    try {
      await updateStatus({
        id: review.id,
        body: { status: review.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE' },
      }).unwrap();
      toast.success(`Review ${review.status === 'VISIBLE' ? 'hidden' : 'made visible'}`);
      setSelectedReview(null);
      q.refetch();
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? 'Failed');
    }
  };

  return {
    page, setPage, limit, setLimit,
    statusFilter, setStatusFilter,
    selectedReview, setSelectedReview,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    reviewsData, allReviews,
    statistics,
    /** Total rows for current table filter (for empty state / export availability) */
    totalMatching: meta?.total ?? 0,
    isRecent,
    updateStatusLoading: upd.isLoading,
    handleToggleVisibility,
    exportToCSV: doExportToCSV,
  };
}
