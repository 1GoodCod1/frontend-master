import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { VirtuosoGrid } from 'react-virtuoso';
import {
  MastersCardSkeleton,
  MastersMapSkeleton,
  MastersVirtualizedGridList,
  MastersVirtualizedGridItem,
} from '@/features/masters/components/public/MastersPageSkeletons';
import { ErrorState } from '@/components/common/States';
import { MasterCard } from '@/components/ui/MasterCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { PublicMaster } from '@/types';

const MastersMap = lazy(() =>
  import('@/features/masters/components/MastersMap').then((m) => ({
    default: m.MastersMap,
  })),
);

interface MastersResultsProps {
  viewMode: 'list' | 'map';
  items: PublicMaster[];
  total: number;
  promotionDiscountByMasterId: Record<string, number>;
  list: {
    isLoading: boolean;
    isError: boolean;
    error?: unknown;
    isFetching: boolean;
    refetch: () => void;
  };
  onClearFilters: () => void;
}

export function MastersResults({
  viewMode,
  items,
  total,
  promotionDiscountByMasterId,
  list,
  onClearFilters,
}: MastersResultsProps) {
  const { t } = useTranslation();

  if (list.isLoading) {
    return viewMode === 'list' ? (
      <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-2 md:grid-cols-3 lg:[grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]">
        {Array.from({ length: 12 }).map((_, i) => (
          <MastersCardSkeleton key={i} />
        ))}
      </div>
    ) : (
      <MastersMapSkeleton />
    );
  }

  if (list.isError) {
    return <ErrorState error={list.error} onRetry={list.refetch} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={t('masters.noMastersFound')}
        description={t('masters.noMastersDescription')}
        actionLabel={t('masters.clearFilters')}
        onAction={onClearFilters}
        icon="🔎"
      />
    );
  }

  return (
    <>
      <div className="mb-3 sm:mb-4 rounded-lg bg-primary/10 px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-primary">
          {t('masters.found', { count: total })}
        </p>
        {list.isFetching && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary/70">Updating…</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <VirtuosoGrid
              useWindowScroll
              totalCount={items.length}
              components={{
                List: MastersVirtualizedGridList,
                Item: MastersVirtualizedGridItem,
              }}
              itemContent={(idx) => {
                const m: PublicMaster = items[idx];
                return (
                  <MasterCard
                    master={{
                      ...m,
                      displayName:
                        `${m?.user?.firstName || ''} ${m?.user?.lastName || ''}`.trim() ||
                        'Master',
                    }}
                    compact
                    promotionDiscount={
                      m?.id ? promotionDiscountByMasterId[m.id] : undefined
                    }
                  />
                );
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="h-[400px] sm:h-[450px] md:h-[500px]"
          >
            <Suspense fallback={<MastersMapSkeleton />}>
              <MastersMap
                masters={items.map((m) => ({
                  ...m,
                  slug: m.slug ?? undefined,
                  displayName:
                    `${m?.user?.firstName || ''} ${m?.user?.lastName || ''}`.trim() ||
                    'Master',
                }))}
                className="h-full"
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
