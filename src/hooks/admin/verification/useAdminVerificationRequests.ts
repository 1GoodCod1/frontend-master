import { useState } from 'react';
import { useGetPendingVerificationsQuery, useGetVerificationDetailsQuery, useGetVerificationStatsQuery, useReviewVerificationMutation } from '@/features/verification/verificationApi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function toErrorMessage(error: unknown): string | undefined {
  if (!isRecord(error)) return undefined;
  const data = isRecord(error.data) ? error.data : undefined;
  return (
    (typeof data?.message === 'string' ? data.message : undefined) ??
    (typeof error.message === 'string' ? error.message : undefined)
  );
}

export function useAdminVerificationRequests() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [notes, setNotes] = useState('');

  const q = useGetPendingVerificationsQuery({ page, limit });
  const statsQuery = useGetVerificationStatsQuery();
  const detailQuery = useGetVerificationDetailsQuery(selectedId!, { skip: !selectedId });
  const [reviewVerification, { isLoading: isReviewing }] = useReviewVerificationMutation();

  const responseData = q.data;
  const verifications = responseData?.verifications ?? [];
  const meta = responseData?.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 };

  const detail = detailQuery.data ?? null;
  const isLoadingDetail = Boolean(detailQuery.isLoading && selectedId);

  const handleReview = async () => {
    if (!selectedId) return;

    try {
      await reviewVerification({ id: selectedId, decision, notes: notes || undefined }).unwrap();
      toast.success(t('verification.reviewed'));
      setReviewDialogOpen(false);
      setSelectedId(null);
      setNotes('');
      await Promise.all([q.refetch(), statsQuery.refetch()]);
    } catch (error: unknown) {
      toast.error(toErrorMessage(error) ?? t('verification.reviewError'));
    }
  };

  const handleOpenDetails = (id: string) => {
    setSelectedId(id);
    setReviewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setReviewDialogOpen(false);
    setSelectedId(null);
    setNotes('');
  };

  return {
    page,
    setPage,
    limit,
    setLimit,
    selectedId,
    setSelectedId,
    reviewDialogOpen,
    setReviewDialogOpen,
    decision,
    setDecision,
    notes,
    setNotes,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    verifications,
    meta,
    detail,
    isLoadingDetail,
    detailError: detailQuery.error,
    isReviewing,
    handleReview,
    handleOpenDetails,
    handleCloseDialog,
    refetchDetail: () => {
      if (selectedId) {
        detailQuery.refetch();
      }
    },
  };
}
