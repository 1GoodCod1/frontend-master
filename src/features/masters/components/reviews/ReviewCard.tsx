import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateShort } from '@/utils/date';
import { mediaUrl } from '@/utils/media';
import { InlineStarRating } from './InlineStarRating';
import { ReviewReplyForm } from './ReviewReplyForm';
import { ReviewReplyDisplay } from './ReviewReplyDisplay';
import type { ReviewFile, ReviewReply } from '@/types/masterDetailsReviews';

function getReviewClientLabel(
  review: Record<string, unknown>,
  t: (key: string) => string,
): string {
  const fromName = (typeof review.clientName === 'string' ? review.clientName : '').trim();
  if (fromName) return fromName;
  const client = review.client;
  if (client && typeof client === 'object') {
    const c = client as Record<string, unknown>;
    return [String(c.firstName ?? ''), String(c.lastName ?? '')].filter(Boolean).join(' ').trim();
  }
  return t('reviews.client');
}

export function ReviewCard({
  review,
  reviewId,
  locale,
  isMaster,
  onOpenPhotos,
}: {
  review: Record<string, unknown>;
  reviewId: string;
  locale: string;
  isMaster: boolean;
  onOpenPhotos: (reviewFiles: ReviewFile[], index: number) => void;
}) {
  const { t } = useTranslation();
  const reply =
    review.replies && Array.isArray(review.replies) && review.replies.length > 0
      ? (review.replies[0] as ReviewReply)
      : ((review.reply as ReviewReply | null | undefined) ?? null);

  return (
    <Card className="border border-[#f5f4eb] dark:border-white/[0.08] transition duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-[#e8e6dd] dark:hover:border-amber-500/40">
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{getReviewClientLabel(review, t)}</span>
            <div className="flex items-center gap-1">
              <InlineStarRating rating={Number(review.rating ?? 0)} starClassName="h-3.5 w-3.5" />
              <span className="text-xs font-medium text-muted-foreground ml-0.5">
                {String(review.rating ?? '')}
              </span>
            </div>
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

        {Array.isArray(review.reviewFiles) && review.reviewFiles.length > 0 && (() => {
          const filesWithSrc = (review.reviewFiles as ReviewFile[])
            .map((rf, fileIdx) => {
              const pathOrUrl = rf.file?.path ?? rf.file?.url ?? (rf as { path?: string }).path;
              const src = mediaUrl(pathOrUrl);
              return { rf, idx: fileIdx, src };
            })
            .filter((x) => x.src);
          if (filesWithSrc.length === 0) return null;
          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filesWithSrc.map(({ rf, idx: fileIdx, src }) => (
                <button
                  key={rf.id ?? fileIdx}
                  type="button"
                  className="rounded-lg overflow-hidden border border-[#f5f4eb] dark:border-white/10 hover:border-[#e8e6dd] dark:hover:border-amber-500/40 active:scale-[0.98] transition-colors text-left cursor-pointer touch-manipulation"
                  onClick={() => onOpenPhotos(review.reviewFiles as ReviewFile[], fileIdx)}
                >
                  <img
                    src={src}
                    alt="Review"
                    className="w-full h-20 sm:h-24 object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          );
        })()}

        {isMaster ? (
          <ReviewReplyForm reviewId={reviewId} existingReply={reply} />
        ) : reply?.content ? (
          <ReviewReplyDisplay reply={reply} />
        ) : null}
      </CardContent>
    </Card>
  );
}
