import { useEffect, useMemo, useState } from 'react';
import { User, Star, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/app/hooks';
import { clearUnreadReviews } from '@/features/socket/socketSlice';
import { useReviewsMyQuery } from '@/features/reviews/reviewsApi';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusChip } from '@/components/ui/StatusChip';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StarRatingDisplay } from '@/components/admin/common/StarRatingDisplay';
import { unwrapList } from '@/utils/data';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import {
  REVIEW_STATUS_OPTIONS,
  type ReviewFilterStatus,
} from '@/types/reviews';
import type { SortOrderNewestOldest } from '@/types/ui';

export default function ReviewsPage() {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const dispatch = useAppDispatch();
  const [statusFilter, setStatusFilter] = useState<ReviewFilterStatus>('ALL');
  const [sortOrder, setSortOrder] = useState<SortOrderNewestOldest>('newest');

  const q = useReviewsMyQuery();

  useEffect(() => {
    dispatch(clearUnreadReviews());
  }, [dispatch]);

  const allItems = unwrapList(q.data);

  const filteredAndSortedItems = useMemo(() => {
    const items = allItems as Record<string, unknown>[];
    let filtered = items;
    if (statusFilter !== 'ALL') {
      filtered = items.filter((r) => r.status === statusFilter);
    }
    const sorted = [...filtered].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [allItems, statusFilter, sortOrder]);

  if (q.isLoading) return <LoadingState label={t('reviews.loading')} />;
  if (q.isError) return <ErrorState error={q.error} onRetry={q.refetch} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 lg:px-8">
      <div className="mb-8">
        <PageHeader title={t('reviews.title')} subtitle={t('reviews.subtitle')} />
      </div>

      <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300 animate-in fade-in duration-200">
        <div className="border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.04] px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-500">
              <Star className="size-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">{t('reviews.myReviews')}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReviewFilterStatus)}>
              <SelectTrigger className="w-[180px] h-9 border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.06]" aria-label={t('reviews.status')}>
                <SelectValue placeholder={t('reviews.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('common.all')}</SelectItem>
                {REVIEW_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`reviews.${s.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrderNewestOldest)}>
              <SelectTrigger className="w-[180px] h-9 border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.06]" aria-label={t('reviews.sortBy')}>
                <SelectValue placeholder={t('reviews.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('reviews.newest')}</SelectItem>
                <SelectItem value="oldest">{t('reviews.oldest')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardContent className="p-6">
          {!filteredAndSortedItems.length ? (
            <EmptyState
              title={t('reviews.noReviewsYet')}
              description={t('reviews.noReviewsDescription')}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {filteredAndSortedItems.map((review, idx) => (
                <Card
                  key={String(review.id ?? idx)}
                  className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/30 dark:backdrop-blur-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] hover:shadow-[0_6px_24px_rgb(0,0,0,0.06)] dark:shadow-none dark:hover:bg-white/[0.03] transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards"
                  style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <User className="size-5 text-primary opacity-70 shrink-0" />
                          <span className="font-semibold text-foreground">
                            {String(review?.clientName ?? '').trim() ||
                              (review?.client && typeof review.client === 'object'
                                ? [String((review.client as Record<string, unknown>).firstName ?? ''), String((review.client as Record<string, unknown>).lastName ?? '')].filter(Boolean).join(' ').trim()
                                : '') ||
                              String(t('reviews.client'))}
                          </span>
                          <div className="flex items-center gap-1">
                            <StarRatingDisplay value={Number(review?.rating ?? 0)} size="sm" />
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              {String(review?.rating ?? '—') as unknown as React.ReactNode}
                            </span>
                          </div>
                        </div>
                        {review?.createdAt ? (
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Clock className="size-4 opacity-70" />
                            {formatDateTimeString(review.createdAt as string, locale)}
                          </div>
                        ) : null}
                      </div>
                      <StatusChip kind="review" value={String(review?.status ?? '')} />
                    </div>

                    {Array.isArray(review?.reviewCriteria) && (review.reviewCriteria as Record<string, unknown>[]).length > 0 && (
                      <>
                        <div className="my-3 border-t border-slate-100 dark:border-white/[0.08]" />
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-2">
                            {t('reviews.detailedRatings')}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(review.reviewCriteria as Record<string, unknown>[]).map((crit, critIdx) => {
                              const ratingStr: string = String(crit.rating ?? '');
                              const labelStr: string = String(t(`reviews.criteria.${String(crit.criteria ?? '')}`));
                              return (
                                <div
                                  key={String(crit.id ?? critIdx)}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.06] border border-slate-100 dark:border-white/[0.06]"
                                >
                                  <span className="text-sm font-semibold capitalize">
                                    {labelStr}
                                  </span>
                                  <span className="flex items-center gap-0.5">
                                    <Star className="size-4 text-amber-500 fill-amber-500" />
                                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                      {ratingStr}
                                    </span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}

                    {review?.comment ? (
                      <>
                        <div className="my-3 border-t border-slate-100 dark:border-white/[0.08]" />
                        <div className="p-4 rounded-lg bg-slate-50/80 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06]">
                          <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                            {String(review.comment)}
                          </p>
                        </div>
                      </>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
