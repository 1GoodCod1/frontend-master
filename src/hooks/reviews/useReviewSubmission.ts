import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useReviewsCreateMutation } from '@/features/reviews/reviewsApi';
import { useFilesUploadManyMutation } from '@/features/files/filesApi';

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

export function useReviewSubmission(masterId: string | undefined) {
    const { t } = useTranslation();
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewPhotos, setReviewPhotos] = useState<File[]>([]);

    const [uploadMany] = useFilesUploadManyMutation();
    const [createReview, { isLoading }] = useReviewsCreateMutation();

    const handleCreateReview = async () => {
        if (!masterId) return;

        try {
            let fileIds: string[] = [];
            if (reviewPhotos.length) {
                const up = await uploadMany({ files: reviewPhotos }).unwrap();
                const items = up?.items ?? [];
                fileIds = (Array.isArray(items) ? items : [])
                    .map((x) =>
                        isRecord(x) && 'id' in x ? String((x as { id?: unknown }).id ?? '') : ''
                    )
                    .filter(Boolean);
            }

            await createReview({
                masterId,
                rating: reviewRating,
                comment: reviewComment || undefined,
                fileIds: fileIds.length ? fileIds : undefined,
            }).unwrap();

            toast.success(t('reviews.created'));
            setReviewRating(5);
            setReviewComment('');
            setReviewPhotos([]);
        } catch (e: unknown) {
            toast.error(toErrorMessage(e) ?? t('reviews.errorCreate'));
        }
    };

    return {
        reviewRating,
        setReviewRating,
        reviewComment,
        setReviewComment,
        reviewPhotos,
        setReviewPhotos,
        handleCreateReview,
        isLoading,
    };
}
