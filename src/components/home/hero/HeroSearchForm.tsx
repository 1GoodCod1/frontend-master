import { useTranslation } from 'react-i18next';
import { MapPin, Search } from 'lucide-react';
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
          'flex flex-col sm:flex-row sm:items-stretch gap-0 sm:gap-0 p-1.5 sm:p-2 rounded-[22px] border transition duration-500',
          'focus-within:shadow-[0_8px_32px_rgba(233,117,37,0.12)]',
          isDark
            ? 'bg-white/[0.06] border-white/10 shadow-lg shadow-black/30'
            : 'bg-white border-gray-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
        )}
      >
        <div className="flex items-center gap-2.5 flex-1 px-3 sm:px-4 min-h-[48px] min-w-0">
          <Search size={18} className="text-muted-foreground shrink-0 hidden sm:block" aria-hidden />
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
            'flex items-center gap-2 px-3 sm:px-4 border-t sm:border-t-0 sm:border-l min-h-[48px] min-w-0 flex-1 sm:flex-initial sm:min-w-[150px]',
            isDark ? 'border-white/10' : 'border-gray-200',
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
          className={cn(
            'm-1 sm:m-0 flex items-center justify-center px-6 sm:px-7 min-h-[44px] sm:min-h-[48px]',
            'rounded-[18px] sm:rounded-[18px] text-sm font-semibold whitespace-nowrap transition duration-200',
            'bg-[#E97525] text-white hover:bg-[#d86920] shadow-none',
          )}
        >
          {t('home.searchButton')}
        </Button>
      </div>
    </form>
  );
}
