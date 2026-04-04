import { lazy, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { VirtuosoGrid } from 'react-virtuoso';
import {
  MastersCardSkeleton,
  MastersMapSkeleton,
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

/** Совпадает с прежней CSS-сеткой карточек */
const GRID_LIST_CLASS =
  'grid grid-cols-2 gap-2 min-[480px]:gap-3 sm:gap-3 md:gap-4 lg:grid-cols-3 lg:gap-5 xl:gap-6 xl:[grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]';

/** Ниже порога — обычный map, без оверхеда виртуализации (типичная страница ~20 карточек) */
const VIRTUOSO_GRID_THRESHOLD = 20;

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

function MasterCardItem({
  m,
  promotionDiscountByMasterId,
}: {
  m: PublicMaster;
  promotionDiscountByMasterId: Record<string, number>;
}) {
  return (
    <MasterCard
      master={{
        ...m,
        displayName:
          `${m?.user?.firstName || ''} ${m?.user?.lastName || ''}`.trim() ||
          'Master',
      }}
      compact
      promotionDiscount={m?.id ? promotionDiscountByMasterId[m.id] : undefined}
    />
  );
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

  const mapMasters = useMemo(
    () =>
      items.map((m) => ({
        ...m,
        slug: m.slug ?? undefined,
        displayName:
          `${m?.user?.firstName || ''} ${m?.user?.lastName || ''}`.trim() ||
          'Master',
      })),
    [items],
  );

  if (list.isLoading) {
    return viewMode === 'list' ? (
      <div className="grid grid-cols-2 gap-2 min-[480px]:gap-3 sm:gap-3 md:gap-4 lg:grid-cols-3 lg:gap-5 xl:gap-6 xl:[grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]">
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

      {viewMode === 'list' ? (
        <div key="list" className="faber-view-swap">
          {items.length >= VIRTUOSO_GRID_THRESHOLD ? (
            <VirtuosoGrid<PublicMaster>
              useWindowScroll
              data={items}
              listClassName={GRID_LIST_CLASS}
              itemClassName="min-w-0"
              increaseViewportBy={{ top: 600, bottom: 800 }}
              computeItemKey={(_, m) => m.id}
              itemContent={(_index, m) => (
                <div className="min-w-0 h-full">
                  <MasterCardItem m={m} promotionDiscountByMasterId={promotionDiscountByMasterId} />
                </div>
              )}
            />
          ) : (
            <div className={GRID_LIST_CLASS}>
              {items.map((m) => (
                <div key={m.id} className="min-w-0 h-full">
                  <MasterCardItem m={m} promotionDiscountByMasterId={promotionDiscountByMasterId} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          key="map"
          className="faber-view-swap h-[400px] sm:h-[450px] md:h-[500px]"
        >
          <Suspense fallback={<MastersMapSkeleton />}>
            <MastersMap masters={mapMasters} className="h-full" />
          </Suspense>
        </div>
      )}
    </>
  );
}
