import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { CategoryIconBox } from '@/components/categories/CategoryIconBox';
import { getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { getMastersCountLabel } from '@/utils/categoryLabels';
import { categoryCardClassName } from '@/utils/categoryIconStyle';
import type { MastersFilterItem } from '@/types';

type CategoryCardProps = {
  category: MastersFilterItem;
  href: string;
  className?: string;
};

export function CategoryCard({ category, href, className }: CategoryCardProps) {
  const { t, i18n } = useTranslation();
  const translatedName = getTranslatedCategoryName(t, category, i18n.language);
  const mastersCount = category.count ?? 0;
  const mastersLabel = getMastersCountLabel(mastersCount, i18n.language);

  return (
    <RouterLink
      to={href}
      className={cn(categoryCardClassName, className)}
    >
      <CategoryIconBox slug={category.slug} />

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
