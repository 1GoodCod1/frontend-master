import { useEffect, useCallback, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { clearUnreadReviews } from '@/features/socket/socketSlice';
import { useAdminReviewsQuery, useAdminModerateReviewMutation } from '@/features/admin/adminApi';
import { useReviewsUpdateStatusMutation } from '@/features/reviews/reviewsApi';
import { formatDateTimeString } from '@/utils/date';
import toast from 'react-hot-toast';
import { REVIEW_STATUS_OPTIONS, type ReviewStatus } from '@/types/reviews';

export const STATUS_OPTIONS = REVIEW_STATUS_OPTIONS;
export type StatusOption = ReviewStatus;

export type AdminReviewRow = {
  id: string;
  status?: string | null;
  clientName?: string | null;
  rating?: number | null;
  comment?: string | null;
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

  const recent = useAppSelector((s) => s.socket.recent.reviews);
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
    dispatch(clearUnreadReviews());
  }, [dispatch]);

  const cursorForPage = pageCursors[page];
  const cursor = typeof cursorForPage === 'string' && cursorForPage ? cursorForPage : undefined;

  useEffect(() => {
    setPage(1);
    setPageCursors({ 1: undefined });
  }, [limit, statusFilter]);

  const q = useAdminReviewsQuery({
    page,
    limit,
    ...(cursor ? { cursor } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  });
  const [updateStatus, upd] = useReviewsUpdateStatusMutation();
  const [moderate, mod] = useAdminModerateReviewMutation();

  // Calculate statistics - handle different data structures
  const responseData = unwrapEnvelope(q.data);
  const allReviews: AdminReviewRow[] =
    isRecord(responseData) && Array.isArray(responseData.items)
      ? (responseData.items.filter(isRecord) as AdminReviewRow[])
      : isRecord(responseData) && Array.isArray(responseData.reviews)
        ? (responseData.reviews.filter(isRecord) as AdminReviewRow[])
        : Array.isArray(responseData)
          ? (responseData.filter(isRecord) as AdminReviewRow[])
          : [];
  const totalReviews = allReviews.length;
  const pendingReviews = allReviews.filter((r) => r.status === 'PENDING').length;
  const visibleReviews = allReviews.filter((r) => r.status === 'VISIBLE').length;
  const hiddenReviews = allReviews.filter((r) => r.status === 'HIDDEN').length;
  const reportedReviews = allReviews.filter((r) => r.status === 'REPORTED').length;

  const reviewsData = {
    items: allReviews,
    meta:
      (isRecord(responseData) ? (responseData.pagination ?? responseData.meta) : undefined) ||
      { total: allReviews.length, page, limit },
  };

  useEffect(() => {
    const meta = isRecord(responseData) ? (responseData.pagination ?? responseData.meta) : undefined;
    const next = isRecord(meta) && typeof meta.nextCursor === 'string' ? meta.nextCursor : undefined;
    if (!next) return;
    setPageCursors((prev) => (prev[page + 1] === next ? prev : { ...prev, [page + 1]: next }));
  }, [page, responseData]);

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

  const exportToCSV = () => {
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

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reviews_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Reviews exported to CSV');
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
    exportToCSV,
  };
}
