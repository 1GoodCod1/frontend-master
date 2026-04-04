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
        />

        <MastersFiltersCard
          query={query}
          setQuery={setQuery}
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
          categories={categories}
          cities={cities}
          priceRange={priceRange}
          priceMinLocal={priceMinLocal}
          priceMaxLocal={priceMaxLocal}
          clampedMinPrice={clampedMinPrice}
          clampedMaxPrice={clampedMaxPrice}
          priceStep={priceStep}
          thumbPrimaryClass={thumbPrimaryClass}
          priceMinClamp={priceMinClamp}
          priceMaxClamp={priceMaxClamp}
          setPriceMinLocal={setPriceMinLocal}
          setPriceMaxLocal={setPriceMaxLocal}
          getCategoryLabel={getCategoryLabel}
          getCityLabel={getCityLabel}
          getCategoryValue={getCategoryValue}
          getCityValue={getCityValue}
          availableNowCount={availableNowCount}
          hasPromotionCount={hasPromotionCount}
          filters={filters}
        />

        <RecentlyViewed limit={6} />

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
          />
        )}
      </div>
    </>
  );
}
