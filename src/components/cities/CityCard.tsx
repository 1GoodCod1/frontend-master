import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTranslatedCityName } from '@/utils/translateCityCategory';
import { getMastersCountLabel } from '@/utils/categoryLabels';
import { categoryCardClassName } from '@/utils/categoryIconStyle';
import type { MastersFilterItem } from '@/types';

type CityCardProps = {
  city: MastersFilterItem;
  href: string;
  className?: string;
};

export function CityCard({ city, href, className }: CityCardProps) {
  const { t, i18n } = useTranslation();
  const translatedName = getTranslatedCityName(t, city, i18n.language);
  const mastersCount = city.count ?? 0;
  const mastersLabel = getMastersCountLabel(mastersCount, i18n.language);

  return (
    <RouterLink to={href} className={cn(categoryCardClassName, className)}>
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]',
          'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-400',
        )}
      >
        <MapPin size={18} strokeWidth={2} />
      </div>

      <div className="flex flex-col flex-1 min-h-0 pt-2.5">
        <p className="text-[13px] font-semibold text-[#212529] dark:text-white leading-[1.25] line-clamp-2 min-h-[33px]">
          {translatedName}
        </p>
        <p className="mt-auto font-mono text-[10px] text-[#6C757D] dark:text-white/50 leading-tight pt-1">
          {mastersLabel}
        </p>
      </div>
    </RouterLink>
  );
}
