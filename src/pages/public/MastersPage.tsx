import { SEOHead } from '@/components/seo/SEOHead';
import { RecentlyViewed } from '@/components/home/recommendations/RecentlyViewed';
import { useMastersPage } from '@/features/masters/hooks';
import {
  MastersPageHeader,
  MastersFiltersCard,
  MastersResults,
  MastersPagination,
} from '@/features/masters/components/public';

export default function MastersPage() {
  const {
    t,
    query,
    setQuery,
    showAdvanced,
    setShowAdvanced,
    viewMode,
    setViewMode,
    priceMinLocal,
    setPriceMinLocal,
    priceMaxLocal,
    setPriceMaxLocal,
    priceRange,
    priceMinClamp,
    priceMaxClamp,
    clampedMinPrice,
    clampedMaxPrice,
    priceStep,
    thumbPrimaryClass,
    categories,
    cities,
    availableNowCount,
    hasPromotionCount,
    getCategoryLabel,
    getCityLabel,
    getCategoryValue,
    getCityValue,
    filters,
    list,
    items,
    total,
    totalPages,
    canPrev,
    canNext,
    resetFilters,
    activeFilterCount,
    clearFiltersForEmpty,
    promotionDiscountByMasterId,
  } = useMastersPage();

  return (
    <>
      <SEOHead
        title={t('masters.title')}
        description={t('masters.subtitle')}
        keywords={t('home.seoKeywords')}
      />
      <div className="faber-page-enter container max-w-7xl mx-auto py-3 sm:py-5 md:py-6 lg:py-8 px-3 sm:px-4">
        <MastersPageHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={resetFilters}
          activeFilterCount={activeFilterCount}
          totalCount={total}
          isFetching={list.isFetching}
        />

        {(() => {
          const sharedFilterProps = {
            query,
            setQuery,
            showAdvanced,
            setShowAdvanced,
            categories,
            cities,
            priceRange,
            priceMinLocal,
            priceMaxLocal,
            clampedMinPrice,
            clampedMaxPrice,
            priceStep,
            thumbPrimaryClass,
            priceMinClamp,
            priceMaxClamp,
            setPriceMinLocal,
            setPriceMaxLocal,
            getCategoryLabel,
            getCityLabel,
            getCategoryValue,
            getCityValue,
            availableNowCount,
            hasPromotionCount,
            filters,
          };
          return (
            <>
              {/* Top: search + category + city (full width) */}
              <MastersFiltersCard {...sharedFilterProps} section="top" />

              {/* Below: left sidebar (recently viewed + remaining filters) + masters grid */}
              <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-4 lg:gap-5 items-start">
                <aside className="order-2 lg:order-1 lg:sticky lg:top-20 lg:self-start space-y-4">
                  <RecentlyViewed limit={8} layout="sidebar" />
                  <MastersFiltersCard {...sharedFilterProps} section="sidebar" />
                </aside>
                <div className="order-1 lg:order-2 min-w-0">
                  <MastersResults
                    viewMode={viewMode}
                    items={items}
                    total={total}
                    promotionDiscountByMasterId={promotionDiscountByMasterId}
                    list={list}
                    onClearFilters={clearFiltersForEmpty}
                  />
                  {items.length > 0 && (
                    <MastersPagination
                      page={query.page}
                      totalPages={totalPages}
                      canPrev={canPrev}
                      canNext={canNext}
                      isFetching={list.isFetching}
                      onPrev={() => setQuery((s) => ({ ...s, page: s.page - 1 }))}
                      onNext={() => setQuery((s) => ({ ...s, page: s.page + 1 }))}
                      onGoTo={(p) => setQuery((s) => ({ ...s, page: p }))}
                    />
                  )}
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </>
  );
}
