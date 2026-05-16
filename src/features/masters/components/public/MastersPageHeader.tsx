import { useTranslation } from 'react-i18next';
import { List, Map, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewMode = 'list' | 'map';

interface MastersPageHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  totalCount?: number;
  isFetching?: boolean;
}

export function MastersPageHeader({
  viewMode,
  onViewModeChange,
  onResetFilters,
  activeFilterCount,
  totalCount,
  isFetching,
}: MastersPageHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            {t('masters.title')}
          </h1>
          {typeof totalCount === 'number' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
              {t('masters.found', { count: totalCount })}
              {isFetching && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <div className="flex rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
          <button
            onClick={() => onViewModeChange('list')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 min-h-[44px] sm:min-h-0 text-sm font-medium transition ${
              viewMode === 'list'
                ? 'bg-[hsl(var(--button-bg))] text-white'
                : 'bg-card hover:bg-primary/10 text-muted-foreground'
            }`}
          >
            <List className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{t('masters.listView')}</span>
          </button>
          <button
            onClick={() => onViewModeChange('map')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 min-h-[44px] sm:min-h-0 text-sm font-medium transition ${
              viewMode === 'map'
                ? 'bg-[hsl(var(--button-bg))] text-white'
                : 'bg-card hover:bg-primary/10 text-muted-foreground'
            }`}
          >
            <Map className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{t('masters.mapView')}</span>
          </button>
        </div>

        <Button
          variant="outline"
          onClick={onResetFilters}
          className="shrink-0 gap-1.5 sm:gap-2 min-h-[44px] sm:min-h-9 border-gray-200 dark:border-white/10 hover:bg-primary/10 hover:border-primary/30 text-sm"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          {t('common.reset')}
          {activeFilterCount > 0 && (
            <span className="ml-1 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
