import { useState, useRef } from 'react';
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

// Map of category slug to RGB brand colors
const CATEGORY_COLOR_MAP: Record<string, string> = {
  santehnika: '6, 182, 212', // cyan
  elektrika: '245, 158, 11',  // amber
  plitka: '249, 115, 22',    // orange
  uborka: '14, 165, 233',    // sky
  pereezdy: '99, 102, 241',  // indigo
  mebel: '16, 185, 129',     // emerald
  landshaft: '34, 197, 94',   // green
  internet: '139, 92, 246',  // violet
  manikyur: '236, 72, 153',  // pink
  'dj-muzicieni': '217, 70, 239', // fuchsia
  'foto-video': '244, 63, 94',    // rose
  'panouri-solare': '234, 179, 8', // yellow
  'antrenori-fitness': '239, 68, 68', // red
};

// Map of category slug to Tailwind hover text classes
const CATEGORY_HOVER_TEXT_MAP: Record<string, string> = {
  santehnika: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-450',
  elektrika: 'group-hover:text-amber-600 dark:group-hover:text-amber-450',
  plitka: 'group-hover:text-orange-600 dark:group-hover:text-orange-450',
  uborka: 'group-hover:text-sky-600 dark:group-hover:text-sky-450',
  pereezdy: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-450',
  mebel: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-450',
  landshaft: 'group-hover:text-green-600 dark:group-hover:text-green-450',
  internet: 'group-hover:text-violet-600 dark:group-hover:text-violet-450',
  manikyur: 'group-hover:text-pink-600 dark:group-hover:text-pink-450',
  'dj-muzicieni': 'group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-450',
  'foto-video': 'group-hover:text-rose-600 dark:group-hover:text-rose-450',
  'panouri-solare': 'group-hover:text-yellow-600 dark:group-hover:text-yellow-450',
  'antrenori-fitness': 'group-hover:text-red-600 dark:group-hover:text-red-450',
};

const DEFAULT_RGB = '233, 117, 37'; // Brand orange #E97525
const DEFAULT_HOVER_TEXT = 'group-hover:text-amber-600 dark:group-hover:text-amber-400';

export function CategoryCard({ category, href, className }: CategoryCardProps) {
  const { t, i18n } = useTranslation();
  const translatedName = getTranslatedCategoryName(t, category, i18n.language);
  const mastersCount = category.count ?? 0;
  const mastersLabel = getMastersCountLabel(mastersCount, i18n.language);

  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const rgb = CATEGORY_COLOR_MAP[category.slug] ?? DEFAULT_RGB;
  const hoverTextClass = CATEGORY_HOVER_TEXT_MAP[category.slug] ?? DEFAULT_HOVER_TEXT;

  const spotlightStyle = {
    background: `radial-gradient(120px circle at ${coords.x}px ${coords.y}px, rgba(${rgb}, 0.09), transparent 80%)`,
  };

  const borderSpotlightStyle = {
    maskImage: `radial-gradient(70px circle at ${coords.x}px ${coords.y}px, black, transparent)`,
    WebkitMaskImage: `radial-gradient(70px circle at ${coords.x}px ${coords.y}px, black, transparent)`,
  };

  return (
    <RouterLink
      ref={cardRef}
      onMouseMove={handleMouseMove}
      to={href}
      className={cn(
        categoryCardClassName,
        'relative overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-black/[0.04]',
        className,
      )}
    >
      {/* 1. Dynamic Spectral Spotlight Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={spotlightStyle}
      />

      {/* 2. Dynamic Spectral Spotlight Border Shine */}
      <div
        className="pointer-events-none absolute -inset-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10 rounded-[22px] border"
        style={{
          ...borderSpotlightStyle,
          borderColor: `rgba(${rgb}, 0.45)`,
        }}
      />

      {/* 3. Original Content elements with z-20 relative */}
      <div className="relative z-20 flex flex-col h-full w-full">
        <CategoryIconBox slug={category.slug} />

        <div className="flex flex-col flex-1 min-h-0 pt-2.5">
          <p className={cn(
            'text-[13px] font-semibold text-[#212529] dark:text-white leading-[1.25] line-clamp-2 min-h-[33px] transition-colors duration-300',
            hoverTextClass,
          )}>
            {translatedName}
          </p>
          <p className="mt-auto font-mono text-[10px] text-[#6C757D] dark:text-white/50 leading-tight pt-1">
            {mastersLabel}
          </p>
        </div>
      </div>
    </RouterLink>
  );
}
