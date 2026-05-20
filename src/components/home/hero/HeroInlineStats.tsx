import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroInlineStatsProps {
  stats: {
    verified: string;
    projects: string;
    rating: string;
  };
  isDark: boolean;
}

export function HeroInlineStats({ stats, isDark }: HeroInlineStatsProps) {
  const { t } = useTranslation();

  const items = [
    t('home.heroInlineVerified', { count: stats.verified }),
    t('home.heroInlineProjects', { count: stats.projects }),
  ];

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium',
        isDark ? 'text-white/55' : 'text-slate-500',
      )}
    >
      {items.map((label, idx) => (
        <span key={label} className="inline-flex items-center gap-5">
          {idx > 0 ? (
            <span
              className={cn('hidden sm:inline w-1 h-1 rounded-full', isDark ? 'bg-white/25' : 'bg-slate-300')}
              aria-hidden
            />
          ) : null}
          <span>{label}</span>
        </span>
      ))}
      <span
        className={cn('hidden sm:inline w-1 h-1 rounded-full', isDark ? 'bg-white/25' : 'bg-slate-300')}
        aria-hidden
      />
      <span className="inline-flex items-center gap-1.5">
        <Star size={14} className="fill-amber-400 text-amber-400 shrink-0" aria-hidden />
        {t('home.heroInlineRating', { rating: stats.rating })}
      </span>
    </div>
  );
}
