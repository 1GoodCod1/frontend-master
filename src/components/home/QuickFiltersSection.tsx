import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Filter, User, MapPin, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { cn } from '@/lib/utils';

const quickFilterButtonClass = cn(
  'font-medium rounded-xl px-4 py-3 sm:px-5 sm:py-2.5 min-h-[44px] sm:min-h-0 ring-1 transition-colors',
  'bg-amber-50 ring-amber-200 text-amber-800 hover:bg-amber-100 hover:ring-amber-300',
  'dark:bg-amber-950/50 dark:ring-amber-600/80 dark:text-amber-300 dark:hover:bg-amber-900/40 dark:hover:ring-amber-500'
);

export const QuickFiltersSection = () => {
  const { t } = useTranslation();

  return (
    <ScrollReveal>
      <div
        className={cn(
          'rounded-2xl p-4 sm:p-6 md:p-8 bg-card',
          'shadow-lg shadow-black/5 dark:shadow-black/20',
          'border-2 border-[#f5f4eb] dark:border-white/[0.08]'
        )}
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary text-primary-foreground shrink-0">
            <Filter className="h-5 w-5" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100">
            {t('home.quickFilters.title')}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <Button variant="ghost" className={quickFilterButtonClass} asChild>
            <RouterLink to="/masters">
              <User className="mr-2 h-4 w-4 shrink-0 opacity-90" />
              {t('home.quickFilters.filterByCategory')}
            </RouterLink>
          </Button>
          <Button variant="ghost" className={quickFilterButtonClass} asChild>
            <RouterLink to="/masters">
              <MapPin className="mr-2 h-4 w-4 shrink-0 opacity-90" />
              {t('home.quickFilters.filterByCity')}
            </RouterLink>
          </Button>
          <Button variant="ghost" className={quickFilterButtonClass} asChild>
            <RouterLink to="/masters?sortBy=rating&sortOrder=desc">
              <Star className="mr-2 h-4 w-4 shrink-0 opacity-90" />
              {t('home.quickFilters.sortByRating')}
            </RouterLink>
          </Button>
          <Button variant="ghost" className={quickFilterButtonClass} asChild>
            <RouterLink to="/masters?sortBy=views&sortOrder=desc">
              <Eye className="mr-2 h-4 w-4 shrink-0 opacity-90" />
              {t('home.quickFilters.sortByViews')}
            </RouterLink>
          </Button>
        </div>
      </div>
    </ScrollReveal>
  );
};
