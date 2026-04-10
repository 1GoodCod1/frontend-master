import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useReviewsCreateMutation } from '@/features/reviews/reviewsApi';
import { useFilesUploadManyMutation } from '@/features/files/filesApi';
import { toErrorMessage } from '@/utils/errors';
import { isRecord } from '@/utils/guards';
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

export function useReviewSubmission(masterId: string | undefined, leadId: string | undefined) {
    const { t } = useTranslation();
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewPhotos, setReviewPhotos] = useState<File[]>([]);
    const [criteriaRatings, setCriteriaRatings] = useState<CriteriaRatings>(createDefaultCriteriaRatings);

    const setCriterionRating = useCallback((key: ReviewCriteriaKey, value: number) => {
        setCriteriaRatings((prev) => ({ ...prev, [key]: value }));
    }, []);

    const [uploadMany] = useFilesUploadManyMutation();
    const [createReview, { isLoading }] = useReviewsCreateMutation();

    const handleCreateReview = async () => {
        if (!masterId || !leadId) return;

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

            const criteria = buildCriteriaPayload(criteriaRatings);

            await createReview({
                masterId,
                leadId,
                rating: reviewRating,
                comment: reviewComment || undefined,
                fileIds: fileIds.length ? fileIds : undefined,
                criteria: criteria.length > 0 ? criteria : undefined,
            }).unwrap();

            toast.success(t('reviews.created'));
            setReviewRating(5);
            setReviewComment('');
            setReviewPhotos([]);
            setCriteriaRatings(createDefaultCriteriaRatings());
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
        criteriaRatings,
        setCriterionRating,
        handleCreateReview,
        isLoading,
    };
}
