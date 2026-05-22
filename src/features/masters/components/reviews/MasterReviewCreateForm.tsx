import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Star, Paperclip, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { REVIEW_CRITERIA_KEYS } from '@/types/reviews';
import { cn } from '@/lib/utils';
import { validateImageFiles } from '@/utils/validateFile';
import type { ReviewCanCreateResponse } from '@/types/reviews';
import type { ReviewSubmissionState } from '@/types/masterDetailsReviews';
import { masterDetailInsetCls } from '@/features/masters/components/masterDetailsUi';

export function MasterReviewCreateForm({
  canCreateReview,
  reviewSubmission,
}: {
  canCreateReview: ReviewCanCreateResponse;
  reviewSubmission: ReviewSubmissionState;
}) {
  const { t } = useTranslation();
  const {
    reviewRating,
    setReviewRating,
    reviewComment,
    setReviewComment,
    reviewPhotos,
    setReviewPhotos,
    criteriaRatings,
    setCriterionRating,
    handleCreateReview,
    isLoading: isSubmitting,
  } = reviewSubmission;

  const reviewPhotoUrls = useMemo(
    () => reviewPhotos.map((f) => URL.createObjectURL(f)),
    [reviewPhotos],
  );
  useEffect(
    () => () => {
      reviewPhotoUrls.forEach((url) => URL.revokeObjectURL(url));
    },
    [reviewPhotoUrls],
  );

  return (
    <>
      {canCreateReview.canCreate === true && (
        <div className={cn('border border-[#f5f4eb] dark:border-amber-500/25 bg-amber-100/70 dark:bg-amber-900/15 p-3 space-y-3', masterDetailInsetCls)}>
          <p className="font-bold text-sm">{t('reviews.leaveReview')}</p>
          <div className="flex gap-0.5 items-center">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                className="p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={() => setReviewRating(v)}
              >
                <Star
                  className={cn(
                    'h-7 w-7 transition-colors',
                    v <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/50',
                  )}
                />
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">{t('reviews.detailedRatings')}</p>
            {REVIEW_CRITERIA_KEYS.map((key) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">{t(`reviews.criteria.${key}`)}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className="p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-ring"
                      onClick={() => setCriterionRating(key, v)}
                    >
                      <Star
                        className={cn(
                          'h-4 w-4 transition-colors',
                          v <= criteriaRatings[key]
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-muted-foreground/30',
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Textarea
            placeholder={t('reviews.commentPlaceholder')}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={2}
            className={cn('resize-none', masterDetailInsetCls)}
          />
          <div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-[#f5f4eb] dark:border-white/10 hover:border-[#e8e6dd] dark:hover:border-amber-500/40"
              asChild
            >
              <label>
                <Paperclip className="h-4 w-4" />
                {t('reviews.addPhotos')} ({reviewPhotos.length}/5)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const list = Array.from(e.target.files ?? []);
                    e.target.value = '';
                    const remaining = 5 - reviewPhotos.length;
                    const { valid, errors } = validateImageFiles(list, remaining);
                    if (errors.length > 0) {
                      const msgs = [...new Set(errors)].map((k) => t(k));
                      toast.error(msgs.join('. '));
                    }
                    if (valid.length === 0) return;
                    setReviewPhotos((p) => [...p, ...valid]);
                  }}
                />
              </label>
            </Button>
            {reviewPhotos.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {reviewPhotos.map((_f: File, i: number) => (
                  <div
                    key={i}
                    className="relative w-12 h-12 rounded-lg overflow-hidden border border-border"
                  >
                    <img src={reviewPhotoUrls[i]} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-0 right-0 w-5 h-5 bg-black/50 text-white rounded-bl flex items-center justify-center hover:bg-black/70"
                      onClick={() => setReviewPhotos((p) => p.filter((_, j) => j !== i))}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button size="sm" onClick={handleCreateReview} disabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : t('reviews.submit')}
          </Button>
        </div>
      )}
      {canCreateReview.alreadyReviewed === true && (
        <Alert className="border-[#f5f4eb] dark:border-amber-500/25 bg-amber-50/80 dark:bg-amber-900/10">
          <AlertDescription>{t('reviews.alreadyReviewed')}</AlertDescription>
        </Alert>
      )}
      {canCreateReview.noClosedLead === true && (
        <Alert className="border-[#f5f4eb] dark:border-amber-500/25 bg-amber-50/80 dark:bg-amber-900/10">
          <AlertDescription>{t('reviews.needClosedLead')}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
