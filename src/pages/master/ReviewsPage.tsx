import { useEffect, useMemo, useState } from 'react';
import { User, Star, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/app/hooks';
import { clearUnreadReviews } from '@/features/socket/socketSlice';
import { useReviewsMyQuery } from '@/features/reviews/reviewsApi';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { CabinetEmptyState } from '@/components/cabinet/CabinetEmptyState';
import { StatusChip } from '@/components/ui/StatusChip';
import { CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StarRatingDisplay } from '@/features/admin/components/common/StarRatingDisplay';
import { unwrapList } from '@/utils/data';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import {
  REVIEW_STATUS_OPTIONS,
  type ReviewFilterStatus,
} from '@/types/reviews';
import type { SortOrderNewestOldest } from '@/types/ui';
import { cn } from '@/lib/utils';
import {
  masterCardCls,
  masterCardStaticCls,
  masterIconWrapCls,
  masterInsetPanelCls,
  masterPageClassName,
  masterSectionTitleCls,
  masterSelectTriggerCls,
  masterTextBody,
  masterTextMuted,
} from '@/lib/masterCabinetStyles';

export default function ReviewsPage() {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const dispatch = useAppDispatch();
  const [statusFilter, setStatusFilter] = useState<ReviewFilterStatus>('ALL');
  const [sortOrder, setSortOrder] = useState<SortOrderNewestOldest>('newest');

  const q = useReviewsMyQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

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
    <div className={masterPageClassName}>
      <PageHeader title={t('reviews.title')} subtitle={t('reviews.subtitle')} />

      <div className={cn(masterCardStaticCls, 'overflow-hidden animate-in fade-in duration-200')}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e8e8] px-6 py-5 dark:border-[#2d2d2d]">
          <div className="flex items-center gap-3">
            <span className={masterIconWrapCls}>
              <Star className="size-5" />
            </span>
            <h2 className={masterSectionTitleCls}>{t('reviews.myReviews')}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReviewFilterStatus)}>
              <SelectTrigger className={cn(masterSelectTriggerCls, 'w-[180px]')} aria-label={t('reviews.status')}>
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
              <SelectTrigger className={cn(masterSelectTriggerCls, 'w-[180px]')} aria-label={t('reviews.sortBy')}>
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
            <CabinetEmptyState
              icon={Star}
              title={t('reviews.noReviewsYet')}
              description={t('reviews.noReviewsDescription')}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {filteredAndSortedItems.map((review, idx) => (
                <div
                  key={String(review.id ?? idx)}
                  className={cn(
                    masterCardCls,
                    'animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards',
                  )}
                  style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <User className="size-5 shrink-0 text-[#E97525] opacity-80" />
                          <span className={cn('font-semibold', masterSectionTitleCls)}>
                            {String(review?.clientName ?? '').trim() ||
                              (review?.client && typeof review.client === 'object'
                                ? [String((review.client as Record<string, unknown>).firstName ?? ''), String((review.client as Record<string, unknown>).lastName ?? '')].filter(Boolean).join(' ').trim()
                                : '') ||
                              String(t('reviews.client'))}
                          </span>
                          <div className="flex items-center gap-1">
                            <StarRatingDisplay value={Number(review?.rating ?? 0)} size="sm" />
                            <span className="font-semibold text-[#E97525]">
                              {String(review?.rating ?? '—') as unknown as React.ReactNode}
                            </span>
                          </div>
                        </div>
                        {review?.createdAt ? (
                          <div className={cn('flex items-center gap-1', masterTextMuted)}>
                            <Clock className="size-4 opacity-70" />
                            {formatDateTimeString(review.createdAt as string, locale)}
                          </div>
                        ) : null}
                      </div>
                      <StatusChip kind="review" value={String(review?.status ?? '')} />
                    </div>

                    {Array.isArray(review?.reviewCriteria) && (review.reviewCriteria as Record<string, unknown>[]).length > 0 && (
                      <>
                        <div className="my-3 border-t border-[#e8e8e8] dark:border-[#2d2d2d]" />
                        <div>
                          <p className={cn('mb-2 font-semibold', masterTextMuted)}>
                            {t('reviews.detailedRatings')}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(review.reviewCriteria as Record<string, unknown>[]).map((crit, critIdx) => {
                              const ratingStr: string = String(crit.rating ?? '');
                              const labelStr: string = String(t(`reviews.criteria.${String(crit.criteria ?? '')}`));
                              return (
                                <div
                                  key={String(crit.id ?? critIdx)}
                                  className={cn(masterInsetPanelCls, 'flex items-center gap-2 px-3 py-1.5')}
                                >
                                  <span className="text-sm font-semibold capitalize">
                                    {labelStr}
                                  </span>
                                  <span className="flex items-center gap-0.5">
                                    <Star className="size-4 fill-[#E97525] text-[#E97525]" />
                                    <span className="text-sm font-bold text-[#E97525]">
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
                        <div className="my-3 border-t border-[#e8e8e8] dark:border-[#2d2d2d]" />
                        <div className={masterInsetPanelCls}>
                          <p className={cn('whitespace-pre-wrap leading-relaxed', masterTextBody)}>
                            {String(review.comment)}
                          </p>
                        </div>
                      </>
                    ) : null}
                  </CardContent>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
}
