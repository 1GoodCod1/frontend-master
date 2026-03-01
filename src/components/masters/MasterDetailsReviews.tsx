import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MessageSquare, Paperclip, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/common/States';
import { ImageLightboxModal } from '@/components/common/ImageLightboxModal';
import { mediaUrl } from '@/utils/media';
import { formatDateShort, getLocaleFromLanguage } from '@/utils/date';
import { cn } from '@/lib/utils';

interface MasterDetailsReviewsProps {
  reviews: any[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  onRetry: () => void;
  isClient: boolean;
  canCreateReview: any;
  reviewSubmission: any;
}

export const MasterDetailsReviews = ({
  reviews,
  isLoading,
  isError,
  error,
  onRetry,
  isClient,
  canCreateReview,
  reviewSubmission,
}: MasterDetailsReviewsProps) => {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openReviewPhotos = (reviewFiles: any[], index: number) => {
    const urls = reviewFiles
      .map((rf: any) => mediaUrl(rf.file?.path ?? rf.file?.url))
      .filter(Boolean);
    if (urls.length > 0) {
      setLightboxImages(urls);
      setLightboxIndex(Math.min(index, urls.length - 1));
      setLightboxOpen(true);
    }
  };

  const {
    reviewRating,
    setReviewRating,
    reviewComment,
    setReviewComment,
    reviewPhotos,
    setReviewPhotos,
    handleCreateReview,
    isLoading: isSubmitting,
  } = reviewSubmission;

  return (
    <Card className="bg-card border-2 border-[#f5f4eb] dark:border-white/[0.08] shadow-xl shadow-amber-900/20 dark:shadow-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{t('masterDetails.reviews')}</CardTitle>
            <CardDescription>{t('masterDetails.reviewsSubtitle')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isClient && canCreateReview && (
          <>
            {canCreateReview.canCreate && (
              <div className="rounded-xl border border-[#f5f4eb] dark:border-amber-500/25 bg-amber-100/70 dark:bg-amber-900/15 p-4 space-y-4">
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
                          v <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/50'
                        )}
                      />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder={t('reviews.commentPlaceholder')}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={2}
                  className="resize-none rounded-xl"
                />
                <div>
                  <Button variant="outline" size="sm" className="gap-2 border-[#f5f4eb] dark:border-white/10 hover:border-[#e8e6dd] dark:hover:border-amber-500/40" asChild>
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
                          const left = 5 - reviewPhotos.length;
                          if (left <= 0) return;
                          setReviewPhotos((p: any) => [...p, ...list.slice(0, left)]);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </Button>
                  {reviewPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {reviewPhotos.map((f: any, i: number) => (
                        <div
                          key={i}
                          className="relative w-12 h-12 rounded-lg overflow-hidden border border-border"
                        >
                          <img
                            src={URL.createObjectURL(f)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-0 w-5 h-5 bg-black/50 text-white rounded-bl flex items-center justify-center hover:bg-black/70"
                            onClick={() => setReviewPhotos((p: any[]) => p.filter((_, j) => j !== i))}
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
            {canCreateReview.alreadyReviewed && (
              <Alert className="border-[#f5f4eb] dark:border-amber-500/25 bg-amber-50/80 dark:bg-amber-900/10">
                <AlertDescription>{t('reviews.alreadyReviewed')}</AlertDescription>
              </Alert>
            )}
            {canCreateReview.noClosedLead && (
              <Alert className="border-[#f5f4eb] dark:border-amber-500/25 bg-amber-50/80 dark:bg-amber-900/10">
                <AlertDescription>{t('reviews.needClosedLead')}</AlertDescription>
              </Alert>
            )}
          </>
        )}

        {isLoading ? (
          <p className="text-muted-foreground">{t('common.loading')}</p>
        ) : isError ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : !reviews.length ? (
          <p className="text-muted-foreground">{t('reviews.noReviewsYet')}</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <Card
                key={review.id}
                className="border border-[#f5f4eb] dark:border-white/[0.08] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-[#e8e6dd] dark:hover:border-amber-500/40 cursor-pointer"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {review.clientName?.trim() ||
                          (review.client &&
                            [review.client.firstName, review.client.lastName]
                              .filter(Boolean)
                              .join(' ')
                              .trim()) ||
                          t('reviews.client')}
                      </span>
                      <Badge variant="secondary" className="gap-1 text-amber-600 dark:text-amber-400 bg-amber-500/10 border-0">
                        <Star className="h-3 w-3 fill-current" />
                        {review.rating}
                      </Badge>
                    </div>
                    {review.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDateShort(review.createdAt, locale)}
                      </span>
                    )}
                  </div>

                  {review.reviewCriteria?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {review.reviewCriteria.map((crit: any) => (
                        <Badge key={crit.id} variant="outline" className="text-xs font-normal">
                          {t(`reviews.criteria.${crit.criteria}`, crit.criteria)}: {crit.rating}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {review.comment && (
                    <p className="text-sm whitespace-pre-wrap text-foreground">{review.comment}</p>
                  )}

                  {review.reviewFiles?.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {review.reviewFiles.map((rf: any, idx: number) => {
                        const src = mediaUrl(rf.file?.path ?? rf.file?.url);
                        return (
                          <button
                            key={rf.id}
                            type="button"
                            className="rounded-lg overflow-hidden border border-[#f5f4eb] dark:border-white/10 hover:border-[#e8e6dd] dark:hover:border-amber-500/40 active:scale-[0.98] transition-colors text-left cursor-pointer touch-manipulation"
                            onClick={() => openReviewPhotos(review.reviewFiles, idx)}
                          >
                            <img
                              src={src}
                              alt="Review"
                              className="w-full h-20 sm:h-24 object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
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
};
