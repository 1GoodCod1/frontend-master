import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useReviewsCreateMutation } from '@/features/reviews/reviewsApi';
import { useFilesUploadManyMutation } from '@/features/files/filesApi';

type ReviewModalMaster = { id: string; user?: { firstName?: string; lastName?: string } } | null;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function toErrorMessage(e: unknown): string | undefined {
  if (!isRecord(e)) return undefined;
  const data = isRecord(e.data) ? e.data : undefined;
  return (
    (typeof data?.message === 'string' ? data.message : undefined) ??
    (typeof e.message === 'string' ? e.message : undefined)
  );
}

export function useReviewModal() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [master, setMaster] = useState<ReviewModalMaster>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [submittedMasterIds, setSubmittedMasterIds] = useState<Set<string>>(() => new Set());

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
    setRating(5);
    setComment('');
    setPhotos([]);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setMaster(null);
    setRating(5);
    setComment('');
    setPhotos([]);
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

    try {
      await createReview({
        masterId: master.id,
        rating,
        comment: comment || undefined,
        fileIds: fileIds.length ? fileIds : undefined,
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
    submittedMasterIds,
    isLoading: createReviewState.isLoading,
    openModal,
    closeModal,
    submitReview,
  };
}
