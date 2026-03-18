import { useEffect, useRef, useState, useMemo } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { clearUnreadReviews } from '@/features/socket/socketSlice';
import { useAdminReviewsQuery, useAdminModerateReviewMutation } from '@/features/admin/adminApi';
import { useReviewsUpdateStatusMutation } from '@/features/reviews/reviewsApi';
import { formatDateTimeString } from '@/utils/date';
import toast from 'react-hot-toast';
import { parseAdminPaginatedResponse } from '@/utils/data';
import { exportToCSV } from '@/utils/csvExport';
import { toErrorMessage } from '@/utils/errors';
import { useIsRecent } from '../useIsRecent';
import type { AdminReviewRow, StatusOption } from '.';

export function useAdminReviews() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pageCursors, setPageCursors] = useState<Record<number, string | undefined>>({ 1: undefined });
  const [selection, setSelection] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<StatusOption>('VISIBLE');
  const [selectedReview, setSelectedReview] = useState<AdminReviewRow | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDesc, setConfirmDesc] = useState<string | undefined>(undefined);
  const actionRef = useRef<null | (() => Promise<void>)>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const isRecent = useIsRecent('reviews');

  useEffect(() => {
    dispatch(clearUnreadReviews());
  }, [dispatch]);

  const cursor =
    typeof pageCursors[page] === 'string' && pageCursors[page] ? pageCursors[page] : undefined;

  useEffect(() => {
    queueMicrotask(() => {
      setPage(1);
      setPageCursors({ 1: undefined });
    });
  }, [limit, statusFilter]);

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
        page,
        limit,
        total: 0,
      }),
    [q.data, page, limit],
  );

  const totalReviews = allReviews.length;
  const pendingReviews = allReviews.filter((r) => r.status === 'PENDING').length;
  const visibleReviews = allReviews.filter((r) => r.status === 'VISIBLE').length;
  const hiddenReviews = allReviews.filter((r) => r.status === 'HIDDEN').length;
  const reportedReviews = allReviews.filter((r) => r.status === 'REPORTED').length;

  const reviewsData = useMemo(
    () => ({
      items: allReviews,
      meta,
    }),
    [allReviews, meta],
  );

  useEffect(() => {
    const next = meta?.nextCursor && typeof meta.nextCursor === 'string' ? meta.nextCursor : undefined;
    if (!next) return;
    queueMicrotask(() =>
      setPageCursors((prev) => (prev[page + 1] === next ? prev : { ...prev, [page + 1]: next })));
  }, [page, meta]);

  const openConfirm = (title: string, description: string | undefined, action: () => Promise<void>) => {
    setConfirmTitle(title);
    setConfirmDesc(description);
    actionRef.current = action;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    const act = actionRef.current;
    if (!act) return;
    setConfirmLoading(true);
    try {
      await act();
      setConfirmOpen(false);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setConfirmTitle('');
    setConfirmDesc(undefined);
    actionRef.current = null;
  };

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
    page,
    setPage,
    limit,
    setLimit,
    statusFilter,
    setStatusFilter,
    selection,
    setSelection,
    bulkStatus,
    setBulkStatus,
    selectedReview,
    setSelectedReview,
    confirmOpen,
    confirmTitle,
    confirmDesc,
    confirmLoading,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    reviewsData,
    allReviews,
    statistics: {
      totalReviews,
      pendingReviews,
      visibleReviews,
      hiddenReviews,
      reportedReviews,
    },
    isRecent,
    updateStatusLoading: upd.isLoading,
    moderateLoading: mod.isLoading,
    openConfirm,
    handleConfirm,
    handleCloseConfirm,
    applyBulkStatus,
    applyBulkModerate,
    handleToggleVisibility,
    exportToCSV: doExportToCSV,
  };
}
