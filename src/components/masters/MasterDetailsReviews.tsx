import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MessageSquare, Paperclip, Trash2, CornerDownRight } from 'lucide-react';
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
import type { ReviewCanCreateResponse } from '@/types/reviews';
import { useReviewReplyMutation, useReviewDeleteReplyMutation } from '@/features/reviews/reviewsApi';

type ReviewFile = { id?: string; file?: { path?: string; url?: string } };

type ReviewReply = {
  id?: string;
  content?: string;
  createdAt?: string | Date;
};

type ReviewSubmissionState = {
  reviewRating: number;
  setReviewRating: (v: number) => void;
  reviewComment: string;
  setReviewComment: (v: string) => void;
  reviewPhotos: File[];
  setReviewPhotos: React.Dispatch<React.SetStateAction<File[]>>;
  handleCreateReview: () => Promise<void>;
  isLoading: boolean;
};

interface MasterDetailsReviewsProps {
  reviews: Record<string, unknown>[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  isClient: boolean;
  isMaster?: boolean;
  canCreateReview?: ReviewCanCreateResponse | undefined;
  reviewSubmission: ReviewSubmissionState;
}

// Reply form shown inline below a review for the master
function ReviewReplyForm({
  reviewId,
  existingReply,
}: {
  reviewId: string;
  existingReply?: ReviewReply | null;
}) {
  const { t } = useTranslation();
  const [replyContent, setReplyContent] = useState(existingReply?.content ?? '');
  const [showForm, setShowForm] = useState(false);
  const [replyToReview, { isLoading: isReplying }] = useReviewReplyMutation();
  const [deleteReply, { isLoading: isDeleting }] = useReviewDeleteReplyMutation();

  const handleSubmit = async () => {
    if (!replyContent.trim()) return;
    await replyToReview({ reviewId, content: replyContent.trim() });
    setShowForm(false);
  };

  const handleDelete = async () => {
    await deleteReply(reviewId);
    setReplyContent('');
    setShowForm(false);
  };

  if (existingReply && !showForm) {
    return (
      <div className="flex gap-2 ml-4 mt-2 p-3 rounded-lg bg-muted/50 border border-border">
        <CornerDownRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
        <div className="flex-1 space-y-1">
          <p className="text-xs font-semibold text-foreground">{t('reviews.masterReply', 'Master reply')}</p>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{existingReply.content}</p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground underline"
              onClick={() => { setShowForm(true); setReplyContent(existingReply.content ?? ''); }}
            >
              {t('common.edit', 'Edit')}
            </button>
            <button
              type="button"
              className="text-xs text-destructive hover:text-destructive/80 underline"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '...' : t('common.delete', 'Delete')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showForm && !existingReply) {
    return (
      <button
        type="button"
        className="ml-4 mt-1 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 underline"
        onClick={() => setShowForm(true)}
      >
        <CornerDownRight className="h-3 w-3" />
        {t('reviews.replyToReview', 'Reply to this review')}
      </button>
    );
  }

  return (
    <div className="ml-4 mt-2 space-y-2 p-3 rounded-lg border border-border bg-muted/30">
      <p className="text-xs font-semibold">{t('reviews.yourReply', 'Your reply')}</p>
      <Textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder={t('reviews.replyPlaceholder', 'Write a professional reply...')}
        rows={2}
        className="resize-none text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={isReplying || !replyContent.trim()}>
          {isReplying ? t('common.loading') : t('common.save', 'Save')}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
          {t('common.cancel', 'Cancel')}
        </Button>
      </div>
    </div>
  );
}

// Display reply to a review (public-facing, no edit form)
function ReviewReplyDisplay({ reply }: { reply: ReviewReply }) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2 ml-4 mt-2 p-3 rounded-lg bg-muted/40 border border-border/60">
      <CornerDownRight className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
          {t('reviews.masterReply', 'Master reply')}
        </p>
        <p className="text-sm text-foreground/80 whitespace-pre-wrap">{reply.content}</p>
      </div>
    </div>
  );
}

export const MasterDetailsReviews = ({
  reviews,
  isLoading,
  isError,
  error,
  onRetry,
  isClient,
  isMaster = false,
  canCreateReview,
  reviewSubmission,
}: MasterDetailsReviewsProps) => {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openReviewPhotos = (reviewFiles: ReviewFile[], index: number) => {
    const urls = reviewFiles
      .map((rf) => mediaUrl(rf.file?.path ?? rf.file?.url))
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
            {canCreateReview.canCreate === true && (
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
                          setReviewPhotos((p) => [...p, ...list.slice(0, left)]);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </Button>
                  {reviewPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {reviewPhotos.map((f: File, i: number) => (
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
        )}

        {isLoading ? (
          <p className="text-muted-foreground">{t('common.loading')}</p>
        ) : isError ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : !reviews.length ? (
          <p className="text-muted-foreground">{t('reviews.noReviewsYet')}</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, idx) => {
              const reviewId = String(review.id ?? review._id ?? idx);
              const reply = review.replies &&
                Array.isArray(review.replies) &&
                review.replies.length > 0
                ? (review.replies[0] as ReviewReply)
                : (review.reply as ReviewReply | null | undefined) ?? null;

              return (
                <Card
                  key={reviewId}
                  className="border border-[#f5f4eb] dark:border-white/[0.08] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-[#e8e6dd] dark:hover:border-amber-500/40"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {(typeof review.clientName === 'string' ? review.clientName : '').trim() ||
                            (review.client && typeof review.client === 'object'
                              ? [String((review.client as Record<string, unknown>).firstName ?? ''), String((review.client as Record<string, unknown>).lastName ?? '')]
                                .filter(Boolean)
                                .join(' ')
                                .trim()
                              : '') ||
                            t('reviews.client')}
                        </span>
                        <Badge variant="secondary" className="gap-1 text-amber-600 dark:text-amber-400 bg-amber-500/10 border-0">
                          <Star className="h-3 w-3 fill-current" />
                          {String(review.rating ?? '')}
                        </Badge>
                      </div>
                      {review.createdAt != null && (
                        <span className="text-xs text-muted-foreground">
                          {formatDateShort(review.createdAt as string | Date, locale)}
                        </span>
                      )}
                    </div>

                    {Array.isArray(review.reviewCriteria) && review.reviewCriteria.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(review.reviewCriteria as Record<string, unknown>[]).map((crit, ci) => (
                          <Badge key={String(crit.id ?? ci)} variant="outline" className="text-xs font-normal">
                            {String(t(`reviews.criteria.${String(crit.criteria ?? '')}`, String(crit.criteria ?? '')))}:{' '}
                            {String(crit.rating ?? '')}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {review.comment != null && String(review.comment) !== '' && (
                      <p className="text-sm whitespace-pre-wrap text-foreground">{String(review.comment)}</p>
                    )}

                    {Array.isArray(review.reviewFiles) && review.reviewFiles.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {(review.reviewFiles as ReviewFile[]).map((rf, rfIdx) => {
                          const src = mediaUrl(rf.file?.path ?? rf.file?.url);
                          return (
                            <button
                              key={rf.id ?? rfIdx}
                              type="button"
                              className="rounded-lg overflow-hidden border border-[#f5f4eb] dark:border-white/10 hover:border-[#e8e6dd] dark:hover:border-amber-500/40 active:scale-[0.98] transition-colors text-left cursor-pointer touch-manipulation"
                              onClick={() => openReviewPhotos(review.reviewFiles as ReviewFile[], rfIdx)}
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

                    {/* Master reply: show form to master, show text to everyone else */}
                    {isMaster ? (
                      <ReviewReplyForm
                        reviewId={reviewId}
                        existingReply={reply}
                      />
                    ) : reply?.content ? (
                      <ReviewReplyDisplay reply={reply} />
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
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
