import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { clearUnreadReviews } from '@/features/socket/socketSlice';
import { useAdminReviewsQuery, useAdminModerateReviewMutation } from '@/features/admin/adminApi';
import { useReviewsUpdateStatusMutation } from '@/features/reviews/reviewsApi';
import { formatDateTimeString } from '@/utils/date';
import toast from 'react-hot-toast';
import { parseAdminPaginatedResponse } from '@/utils/data';
import { exportToCSV } from '@/utils/csvExport';
import { toErrorMessage } from '@/utils/errors';
import { useAdminCursors } from '../useAdminCursors';
import { useAdminConfirm } from '../useAdminConfirm';
import { useIsRecent } from '../useIsRecent';
import type { AdminReviewRow, StatusOption } from '.';

export function useAdminReviews() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selection, setSelection] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<StatusOption>('VISIBLE');
  const [selectedReview, setSelectedReview] = useState<AdminReviewRow | null>(null);

  const isRecent = useIsRecent('reviews');
  const { cursor, resetCursors, updateMeta } = useAdminCursors(page);
  const confirm = useAdminConfirm();

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
  const [moderate, mod] = useAdminModerateReviewMutation();

  const { items: allReviews, meta } = useMemo(
    () =>
      parseAdminPaginatedResponse<AdminReviewRow>(q.data, {
        page, limit, total: 0,
      }),
    [q.data, page, limit],
  );

  useEffect(() => { updateMeta(meta); }, [meta, updateMeta]);

  const totalReviews = allReviews.length;
  const pendingReviews = allReviews.filter((r) => r.status === 'PENDING').length;
  const visibleReviews = allReviews.filter((r) => r.status === 'VISIBLE').length;
  const hiddenReviews = allReviews.filter((r) => r.status === 'HIDDEN').length;
  const reportedReviews = allReviews.filter((r) => r.status === 'REPORTED').length;

  const reviewsData = useMemo(() => ({ items: allReviews, meta }), [allReviews, meta]);

  const applyBulkStatus = async () => {
    if (!selection.length) return toast.error('Select rows first');
    const t = toast.loading(`Updating ${selection.length} review(s)...`);
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

  const applyBulkModerate = async () => {
    if (!selection.length) return toast.error('Select rows first');
    const t = toast.loading(`Moderating ${selection.length} review(s)...`);
    try {
      for (const id of selection) {
        await moderate({ id }).unwrap();
      }
      toast.success('Moderated', { id: t });
      setSelection([]);
      q.refetch();
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? 'Failed', { id: t });
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

  const doExportToCSV = () => {
    const headers = ['ID', 'Client Name', 'Master', 'Rating', 'Status', 'Comment', 'Created At'];
    const rows = allReviews.map((review) => [
      review.id,
      review.clientName || '-',
      review.master ? `${review.master.user?.firstName || ''} ${review.master.user?.lastName || ''}`.trim() : '-',
      review.rating || '0',
      review.status,
      review.comment || '-',
      review.createdAt ? formatDateTimeString(review.createdAt) : '',
    ]);
    exportToCSV(headers, rows, 'reviews_export', 'Reviews exported to CSV');
  };

  return {
    page, setPage, limit, setLimit,
    statusFilter, setStatusFilter,
    selection, setSelection, bulkStatus, setBulkStatus,
    selectedReview, setSelectedReview,
    ...confirm,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    reviewsData, allReviews,
    statistics: { totalReviews, pendingReviews, visibleReviews, hiddenReviews, reportedReviews },
    isRecent,
    updateStatusLoading: upd.isLoading,
    moderateLoading: mod.isLoading,
    applyBulkStatus, applyBulkModerate,
    handleToggleVisibility,
    exportToCSV: doExportToCSV,
  };
}
