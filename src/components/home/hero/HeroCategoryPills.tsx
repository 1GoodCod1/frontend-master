import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { MastersFilterItem } from '@/types';
import { getTranslatedCategoryName } from '@/utils/translateCityCategory';

interface HeroCategoryPillsProps {
  categories: MastersFilterItem[];
  effectiveCityId: string | undefined;
  getCitySlugForUrl: (cityId: string) => string;
  isDark: boolean;
}

export function HeroCategoryPills({
  categories,
  effectiveCityId,
  getCitySlugForUrl,
  isDark,
}: HeroCategoryPillsProps) {
  const { t, i18n } = useTranslation();

  return (
    <div
      className={cn(
        'rounded-xl p-4 transition-all duration-500',
        isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white/40 border border-gray-200/60'
      )}
    >
      <p className="text-xs uppercase tracking-wider mb-3 transition-colors duration-500 text-muted-foreground">
        {t('home.popularCategoriesHero')}
      </p>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const emoji = cat.icon?.trim() || '📋';
          const translatedName = getTranslatedCategoryName(t, cat, i18n.language);
          return (
            <RouterLink
              key={cat.id}
              to={`/masters?category=${cat.slug}${effectiveCityId ? `&city=${getCitySlugForUrl(effectiveCityId)}` : ''}`}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200',
                'hover:text-primary',
                isDark
                  ? 'bg-white/[0.04] border border-white/8 hover:bg-primary/10 hover:border-primary/30'
                  : 'bg-secondary/80 border border-border hover:bg-primary/10 hover:border-primary/30',
                'text-foreground/80'
              )}
            >
              <span>{emoji}</span>
              {translatedName}
            </RouterLink>
          );
        })}
      </div>
    </div>
  );
}
