import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useReviewsCreateMutation } from '@/features/reviews/reviewsApi';
import { useFilesUploadManyMutation } from '@/features/files/filesApi';
import { toErrorMessage } from '@/utils/errors';
import { isRecord } from '@/utils/guards';
import type { ReviewModalMaster } from '.';
import {
  type CriteriaRatings,
  type ReviewCriteriaKey,
  createDefaultCriteriaRatings,
} from '@/types/reviews';

function buildCriteriaPayload(ratings: CriteriaRatings) {
  return (Object.entries(ratings) as [ReviewCriteriaKey, number][])
    .filter(([, r]) => r > 0)
    .map(([criteria, rating]) => ({ criteria, rating }));
}

export function useReviewModal() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [master, setMaster] = useState<ReviewModalMaster>(null);
  const [rating, setRating] = useState(5);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [criteriaRatings, setCriteriaRatings] = useState<CriteriaRatings>(createDefaultCriteriaRatings);
  const [submittedMasterIds, setSubmittedMasterIds] = useState<Set<string>>(() => new Set());

  const setCriterionRating = useCallback((key: ReviewCriteriaKey, value: number) => {
    setCriteriaRatings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const [createReview, createReviewState] = useReviewsCreateMutation();
  const [uploadMany] = useFilesUploadManyMutation();

  const masterName = master
    ? [master.user?.firstName, master.user?.lastName].filter(Boolean).join(' ').trim() || 'Master'
    : '';

  const openModal = (masterData: unknown) => {
    // Support both direct master object and lead object with master property
    const m =
      isRecord(masterData) && isRecord(masterData.master) ? masterData.master : masterData;
    if (!isRecord(m) || typeof m.id !== 'string') return;
    const user = isRecord(m.user) ? m.user : undefined;
    setMaster({
      id: m.id,
      user: {
        firstName: typeof user?.firstName === 'string' ? user.firstName : undefined,
        lastName: typeof user?.lastName === 'string' ? user.lastName : undefined,
      },
    });
    setLeadId(isRecord(masterData) && typeof masterData.id === 'string' ? masterData.id : null);
    setRating(5);
    setComment('');
    setPhotos([]);
    setCriteriaRatings(createDefaultCriteriaRatings());
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setMaster(null);
    setLeadId(null);
    setRating(5);
    setComment('');
    setPhotos([]);
    setCriteriaRatings(createDefaultCriteriaRatings());
  };

  const submitReview = async () => {
    if (!master?.id) return;

    let fileIds: string[] = [];
    if (photos.length) {
      try {
        const uploadResult = await uploadMany({ files: photos }).unwrap();
        const items = uploadResult?.items ?? [];
        fileIds = (Array.isArray(items) ? items : [])
          .map((x) =>
            isRecord(x) && 'id' in x ? String((x as { id?: unknown }).id ?? '') : '',
          )
          .filter(Boolean);
      } catch (e: unknown) {
        toast.error(toErrorMessage(e) ?? t('reviews.errorCreate'));
        return;
      }
    }

    const criteria = buildCriteriaPayload(criteriaRatings);

    try {
      await createReview({
        masterId: master.id,
        leadId: leadId || '',
        rating,
        comment: comment || undefined,
        fileIds: fileIds.length ? fileIds : undefined,
        criteria: criteria.length > 0 ? criteria : undefined,
      }).unwrap();
      setSubmittedMasterIds((s) => new Set(s).add(master.id));
      toast.success(t('reviews.created'));
      closeModal();
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? t('reviews.errorCreate'));
    }
  };

  return {
    isOpen,
    master,
    masterName,
    rating,
    setRating,
    comment,
    setComment,
    photos,
    setPhotos,
    criteriaRatings,
    setCriterionRating,
    submittedMasterIds,
    isLoading: createReviewState.isLoading,
    openModal,
    closeModal,
    submitReview,
  };
}
