import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/common/States';
import { ImageLightboxModal } from '@/components/common/ImageLightboxModal';
import { mediaUrl } from '@/utils/media';
import { getLocaleFromLanguage } from '@/utils/date';
import { MasterReviewCreateForm } from './MasterReviewCreateForm';
import { ReviewsSummaryPanel } from './ReviewsSummaryPanel';
import { ReviewCard } from './ReviewCard';
import { computeReviewStats } from '@/utils/reviewStats';
import type { ReviewFile, MasterDetailsReviewsProps } from '@/types/masterDetailsReviews';
import { masterDetailCardCls, masterDetailIconWrapCls } from '@/features/masters/components/masterDetailsUi';

export function MasterDetailsReviews({
  reviews,
  isLoading,
  isError,
  error,
  onRetry,
  isClient,
  isMaster = false,
  canCreateReview,
  reviewSubmission,
}: MasterDetailsReviewsProps) {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openReviewPhotos = (reviewFiles: ReviewFile[], index: number) => {
    const urls = reviewFiles
      .map((rf) => mediaUrl(rf.file?.path ?? rf.file?.url ?? (rf as { path?: string }).path))
      .filter(Boolean);
    if (urls.length > 0) {
      setLightboxImages(urls);
      setLightboxIndex(Math.min(index, urls.length - 1));
      setLightboxOpen(true);
    }
  };

  const { avgRating, totalCount, distribution } = useMemo(
    () => computeReviewStats(reviews),
    [reviews],
  );

  return (
    <Card className={masterDetailCardCls}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={masterDetailIconWrapCls}>
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-gray-900 dark:text-gray-100 font-semibold">
              {t('masterDetails.reviews')}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isClient && canCreateReview && (
          <MasterReviewCreateForm canCreateReview={canCreateReview} reviewSubmission={reviewSubmission} />
        )}

        {isLoading ? (
          <p className="text-muted-foreground">{t('common.loading')}</p>
        ) : isError ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : (
          <div className="space-y-3">
            <ReviewsSummaryPanel
              avgRating={avgRating}
              totalCount={totalCount}
              distribution={distribution}
            />

            {!reviews.length ? (
              <p className="text-muted-foreground">{t('reviews.noReviewsYet')}</p>
            ) : (
              <>
                {reviews.map((review, idx) => {
                  const reviewId = String(review.id ?? review._id ?? idx);
                  return (
                    <ReviewCard
                      key={reviewId}
                      review={review}
                      reviewId={reviewId}
                      locale={locale}
                      isMaster={isMaster}
                      onOpenPhotos={openReviewPhotos}
                    />
                  );
                })}
              </>
            )}
          </div>
        )}
      </CardContent>
      <ImageLightboxModal
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={lightboxImages}
        initialIndex={lightboxIndex}
      />
    </Card>
  );
}
