import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { paths } from '@/constants/routes';
import { displayJobTitle, formatJobPrice, formatJobRelativeTime } from '@/utils/jobs';
import { getTranslatedCategoryName, getTranslatedCityName } from '@/utils/translateCityCategory';
import { homeJobCardClassName } from '@/utils/categoryIconStyle';
import type { JobDto } from '@/types';

type HomeJobCardProps = {
  job: JobDto;
  className?: string;
};

export function HomeJobCard({ job, className }: HomeJobCardProps) {
  const { t, i18n } = useTranslation();
  const apps = job._count?.applications ?? 0;
  const priceLabel = formatJobPrice(job, t);
  const categoryLabel = job.category
    ? getTranslatedCategoryName(
        t,
        {
          slug: job.category.slug,
          name: job.category.name,
          translations: job.category.translations as
            | Record<string, { name?: string }>
            | null
            | undefined,
        },
        i18n.language,
      )
    : null;
  const cityLabel = job.city ? getTranslatedCityName(t, job.city, i18n.language) : null;
  const postedLabel = formatJobRelativeTime(t, job.createdAt);

  return (
    <RouterLink to={paths.jobs.detail(job.id)} className={cn(homeJobCardClassName, className)}>
      <div className="flex items-center justify-between gap-2 mb-2">
        {categoryLabel ? (
          <span
            className={cn(
              'inline-flex max-w-[70%] items-center gap-1 truncate px-2 py-0.5 rounded-full',
              'text-[10px] font-medium leading-tight',
              'bg-[#F1F3F5] text-[#6C757D] dark:bg-white/[0.06] dark:text-white/55',
            )}
          >
            <span className="w-1 h-1 rounded-full bg-[#E97525] shrink-0" aria-hidden />
            {categoryLabel}
          </span>
        ) : (
          <span className="flex-1 min-w-0" aria-hidden />
        )}
        <span className="text-[10px] text-[#6C757D] dark:text-white/45 shrink-0 tabular-nums leading-tight">
          {postedLabel}
        </span>
      </div>

      <h3
        className={cn(
          'text-[13px] font-semibold leading-[1.25] line-clamp-2 min-h-[33px]',
          'text-[#212529] dark:text-white',
          'group-hover:text-[#E97525] transition-colors',
        )}
      >
        {displayJobTitle(job.title)}
      </h3>

      {cityLabel ? (
        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-[#6C757D] dark:text-white/50 min-w-0 leading-tight">
          <MapPin size={10} className="shrink-0 opacity-70" strokeWidth={2} aria-hidden />
          <span className="truncate">{cityLabel}</span>
        </p>
      ) : (
        <div className="mt-1.5 h-4" aria-hidden />
      )}

      <div
        className={cn(
          'mt-auto pt-2.5 flex items-baseline justify-between gap-2',
          'border-t border-[#E9ECEF] dark:border-white/[0.08]',
        )}
      >
        {priceLabel ? (
          <span className="font-mono text-[11px] font-bold text-[#E97525] tabular-nums leading-tight truncate">
            {priceLabel}
          </span>
        ) : (
          <span className="text-[10px] text-[#6C757D] dark:text-white/50 truncate">
            {t('home.activeJobs.priceOnRequest')}
          </span>
        )}
        <span className="font-mono text-[10px] text-[#6C757D] dark:text-white/50 shrink-0 leading-tight">
          {apps > 0
            ? t('home.activeJobs.offers', { count: apps })
            : t('home.activeJobs.noOffers')}
        </span>
      </div>
    </RouterLink>
  );
}
