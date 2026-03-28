import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MessageSquare, ThumbsUp, CheckCircle, Trash2, Send } from 'lucide-react';
import {
  useReviewsForMasterQuery,
  useReviewVoteHelpfulMutation,
  useReviewRemoveVoteMutation,
  useReviewReplyMutation,
  useReviewDeleteReplyMutation
} from '@/features/reviews/reviewsApi';
import { useAppSelector } from '@/app/hooks';
import { selectMe } from '@/features/auth/selectors';
import { mediaUrl } from '@/utils/media';
import { formatDateShort, getLocaleFromLanguage } from '@/utils/date';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { isRecord } from '@/utils/guards';
import { USER_ROLE } from '@/constants/roles';

interface ReviewItem {
  id: string;
  clientName?: string;
  rating?: number;
  createdAt?: string;
  comment?: string;
  isVerifiedClient?: boolean;
  reviewCriteria?: { id: string; criteria: string; rating: number }[];
  reviewFiles?: { id: string; file?: { path?: string; url?: string } }[];
  replies?: { id: string; content: string; createdAt: string }[];
  _count?: { votes: number };
  votes?: { userId: string }[];
}

interface ReviewsSectionProps {
  masterId: string;
}

export function ReviewsSection({ masterId }: ReviewsSectionProps) {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const me = useAppSelector(selectMe);
  const reviews = useReviewsForMasterQuery({ masterId, status: 'VISIBLE' });

  const [voteHelpful] = useReviewVoteHelpfulMutation();
  const [removeVote] = useReviewRemoveVoteMutation();
  const [submitReply] = useReviewReplyMutation();
  const [deleteReply] = useReviewDeleteReplyMutation();

  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [isReplying, setIsReplying] = useState<Record<string, boolean>>({});

  const reviewsList: ReviewItem[] = (reviews.data as { data?: ReviewItem[] })?.data ?? (reviews.data as ReviewItem[]) ?? [];

  if (reviews.isLoading) {
    return <p className="text-muted-foreground">{t('common.loading')}</p>;
  }

  const role = isRecord(me) && typeof me.role === 'string' ? me.role : undefined;
  const meId = isRecord(me) && typeof me.id === 'string' ? me.id : undefined;
  const masterProfileId =
    isRecord(me) && isRecord(me.masterProfile) && typeof me.masterProfile.id === 'string'
      ? me.masterProfile.id
      : undefined;
  const isMasterOwner = role === USER_ROLE.MASTER && masterProfileId === masterId;

  const handleVote = async (reviewId: string, hasVoted: boolean) => {
    if (!me) {
      toast.error(t('reviews.loginToVote', 'Войдите, чтобы проголосовать'));
      return;
    }
    try {
      if (hasVoted) await removeVote(reviewId).unwrap();
      else await voteHelpful(reviewId).unwrap();
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleReply = async (reviewId: string) => {
    const content = replyText[reviewId];
    if (!content?.trim()) return;
    try {
      await submitReply({ reviewId, content: content.trim() }).unwrap();
      setReplyText({ ...replyText, [reviewId]: '' });
      setIsReplying({ ...isReplying, [reviewId]: false });
      toast.success(t('reviews.replyAdded', 'Ответ добавлен'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleDeleteReply = async (reviewId: string) => {
    if (!confirm(t('common.confirmDelete', 'Удалить?'))) return;
    try {
      await deleteReply(reviewId).unwrap();
      toast.success(t('reviews.replyDeleted', 'Ответ удален'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  return (
    <div className="space-y-6">
      {!reviewsList.length ? (
        <p className="text-muted-foreground">{t('reviews.noReviewsYet')}</p>
      ) : (
        reviewsList.map((review) => {
          const hasVoted = !!review.votes?.find((v) => v.userId === meId);
          const voteCount = review._count?.votes || 0;
          const mainReply = review.replies?.[0];

          return (
            <Card key={review.id} className="overflow-hidden border-border/50 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="space-y-4 pt-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{review.clientName || t('reviews.client')}</span>
                      {review.isVerifiedClient && (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 gap-1 px-1.5 py-0.5">
                          <CheckCircle className="size-3" />
                          <span className="text-[10px] uppercase font-bold tracking-tight">{t('reviews.verified', 'Проверенно')}</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn("size-3.5", s <= (review.rating || 0) ? "fill-amber-400 text-amber-500" : "text-muted-foreground/30")}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {review.createdAt && formatDateShort(review.createdAt, locale)}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 gap-2 rounded-full px-3 text-xs transition-colors",
                      hasVoted ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:bg-secondary"
                    )}
                    onClick={() => handleVote(review.id, hasVoted)}
                  >
                    <ThumbsUp className={cn("size-3.5", hasVoted && "fill-current")} />
                    {voteCount > 0 && <span>{voteCount}</span>}
                    <span>{t('reviews.helpful', 'Полезно')}</span>
                  </Button>
                </div>

                {review.reviewCriteria && review.reviewCriteria.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {review.reviewCriteria.map((crit) => (
                      <Badge key={crit.id} variant="secondary" className="bg-muted/50 text-[10px] font-normal py-0">
                        {t(`reviews.criteria.${crit.criteria}`, crit.criteria)}: {crit.rating}
                      </Badge>
                    ))}
                  </div>
                )}

                {review.comment && (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{review.comment}</p>
                )}

                {review.reviewFiles && review.reviewFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {review.reviewFiles.map((rf) => {
                      const src = mediaUrl(rf.file?.path ?? rf.file?.url ?? '');
                      return (
                        <button
                          key={rf.id}
                          type="button"
                          className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border transition hover:ring-2 hover:ring-primary/30"
                          onClick={() => window.open(src, '_blank')}
                        >
                          <img src={src} alt="Review photo" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Master Reply Section */}
                <div className="mt-4 space-y-3">
                  {mainReply ? (
                    <div className="relative rounded-xl bg-muted/30 p-4 border-l-2 border-primary/30">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
                          <MessageSquare className="size-3" />
                          {t('reviews.masterReply', 'Ответ мастера')}
                        </div>
                        {isMasterOwner && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteReply(review.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground italic">"{mainReply.content}"</p>
                      <div className="mt-2 text-[10px] text-muted-foreground/60">
                        {formatDateShort(mainReply.createdAt, locale)}
                      </div>
                    </div>
                  ) : isMasterOwner ? (
                    <div className="space-y-3 pt-2">
                      {!isReplying[review.id] ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-2 text-xs rounded-full border-dashed"
                          onClick={() => setIsReplying({ ...isReplying, [review.id]: true })}
                        >
                          <MessageSquare className="size-3.5" />
                          {t('reviews.replyToAction', 'Ответить на отзыв')}
                        </Button>
                      ) : (
                        <div className="space-y-2 rounded-xl border border-border p-3 bg-muted/20">
                          <Textarea
                            placeholder={t('reviews.replyPlaceholder', 'Ваш ответ клиенту...')}
                            className="min-h-[80px] text-sm resize-none bg-background focus-visible:ring-primary/20"
                            value={replyText[review.id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs rounded-lg"
                              onClick={() => setIsReplying({ ...isReplying, [review.id]: false })}
                            >
                              {t('common.cancel')}
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 gap-2 text-xs rounded-lg shadow-sm"
                              disabled={!replyText[review.id]?.trim()}
                              onClick={() => handleReply(review.id)}
                            >
                              <Send className="size-3" />
                              {t('reviews.sendReply', 'Отправить')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

