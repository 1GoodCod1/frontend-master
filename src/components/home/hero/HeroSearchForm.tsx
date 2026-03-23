import { useTranslation } from 'react-i18next';
import { MapPin, ChevronRight } from 'lucide-react';
import { SearchInputWithHistory } from '@/features/masters/components/search/SearchInputWithHistory';
import type { SearchSuggestionEvent } from '@/features/masters/components/search/SearchInputWithHistory';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface HeroSearchFormProps {
  searchQuery: string;
  onSearchQueryChange: (v: string) => void;
  effectiveCityId: string | undefined;
  cities: { id: string; name: string; slug: string }[];
  getCityLabel: (c: { id: string; name: string; slug: string }) => string;
  onCityChange: (v: string) => void;
  onSubmit: (e: React.SubmitEvent) => void;
  onSuggestionSelect?: (event: SearchSuggestionEvent) => void;
  isDark: boolean;
}

export function HeroSearchForm({
  searchQuery,
  onSearchQueryChange,
  effectiveCityId,
  cities,
  getCityLabel,
  onCityChange,
  onSubmit,
  onSuggestionSelect,
  isDark,
}: HeroSearchFormProps) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit}>
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl backdrop-blur-md border transition-all duration-500 focus-within:shadow-[0_0_30px_hsl(var(--primary)/0.15)]',
          isDark
            ? 'bg-white/[0.06] border border-white/10 shadow-lg shadow-black/20'
            : 'bg-white/90 border border-gray-200 shadow-md shadow-black/5',
        )}
      >
        <div className="flex items-center gap-3 flex-1 px-3 min-h-[44px] min-w-0">
          <SearchInputWithHistory
            value={searchQuery}
            onChange={onSearchQueryChange}
            onSuggestionSelect={onSuggestionSelect}
            placeholder={t('home.searchPlaceholder')}
            variant="hero"
            className="flex-1 min-w-0"
            cityId={effectiveCityId}
          />
        </div>
        <div
          className={cn(
            'flex items-center gap-2 px-3 border-t sm:border-t-0 sm:border-l min-h-[44px] min-w-0 flex-1 sm:flex-initial sm:min-w-[160px]',
            isDark ? 'border-white/10 sm:border-l' : 'border-black/8 sm:border-l',
          )}
        >
          <MapPin size={16} className="text-muted-foreground shrink-0" />
          <Select
            value={effectiveCityId || 'all'}
            onValueChange={onCityChange}
          >
            <SelectTrigger
              aria-label={t('home.locationPlaceholder')}
              className={cn(
                'flex-1 min-w-0 w-full border-0 bg-transparent shadow-none focus:ring-0',
                'h-auto py-2 text-sm font-medium [&>span]:truncate [&>span]:max-w-full',
              )}
            >
              <SelectValue placeholder={t('home.locationPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('home.locationPlaceholder')}</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {getCityLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          size="sm"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 bg-[hsl(var(--button-bg))] text-white hover:bg-[hsl(var(--button-bg-hover))]"
        >
          {t('home.searchButton')} <ChevronRight size={16} />
        </Button>
      </div>
    </form>
  );
}
