import { cn } from '@/lib/utils';
import { CATEGORY_META, CATEGORY_DEFAULT_META } from '@/constants';
import { getCategoryIconWrap } from '@/utils/categoryIconStyle';

type CategoryIconBoxProps = {
  slug: string;
  className?: string;
};

/** Faber v2 — Lucide outline icon in a pastel box (not API emoji). */
export function CategoryIconBox({ slug, className }: CategoryIconBoxProps) {
  const meta = CATEGORY_META[slug] ?? CATEGORY_DEFAULT_META;
  const Icon = meta.icon;
  const iconWrap = getCategoryIconWrap(slug, meta.color);

  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]',
        iconWrap,
        className,
      )}
    >
      <Icon
        className={cn('h-4 w-4', meta.color)}
        strokeWidth={1.75}
        aria-hidden
      />
    </div>
  );
}
