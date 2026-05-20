import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useIsDark } from '@/hooks/useIsDark';
import { surfaceCardCls } from '@/lib/surfaceCard';
import { ROADMAP_ITEMS } from '@/constants';

export const RoadmapSection = () => {
  const { t } = useTranslation();
  const isDark = useIsDark();

  return (
    <div className="py-2">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase mb-4',
            isDark
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-primary/8 text-primary border border-primary/15',
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {t('home.roadmap.statusSoon')}
        </div>
        <h2
          className={cn(
            'text-2xl sm:text-3xl font-bold tracking-tight',
            'text-slate-800 dark:text-slate-100',
          )}
        >
          {t('home.roadmap.title')}
        </h2>
        <p
          className={cn(
            'mt-2 text-sm sm:text-base max-w-lg mx-auto',
            'text-slate-500 dark:text-slate-400',
          )}
        >
          {t('home.roadmap.subtitle')}
        </p>
      </div>

      {/* Cards */}
      <div className="relative max-w-3xl mx-auto">
        {/* Connector line — visible on sm+ */}
        <div
          className={cn(
            'hidden sm:block absolute top-[2.6rem] left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px',
            isDark
              ? 'bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20'
              : 'bg-gradient-to-r from-primary/15 via-primary/8 to-primary/15',
          )}
          aria-hidden
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {ROADMAP_ITEMS.map(({ icon: Icon, titleKey, descKey, statusKey, accent, bg, ring, statusColor }, i) => (
            <div
              key={titleKey}
              className={cn(
                'relative h-full flex flex-col items-center text-center px-4 py-6 sm:px-5 sm:py-7 rounded-xl sm:rounded-2xl',
                surfaceCardCls,
                'hover:-translate-y-1 hover:shadow-md hover:shadow-black/10',
                'transition duration-300',
              )}
            >
              {/* Step number */}
              <span
                className={cn(
                  'absolute -top-3 -left-2 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ring-2',
                  bg,
                  accent,
                  ring,
                )}
              >
                {i + 1}
              </span>

              {/* Icon */}
              <div className={cn('p-2.5 sm:p-3 rounded-xl mb-3', bg)}>
                <Icon className={cn('w-5 h-5 sm:w-6 sm:h-6', accent)} strokeWidth={1.75} />
              </div>

              {/* Status badge */}
              <span
                className={cn(
                  'inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full mb-2',
                  statusColor,
                )}
              >
                {t(statusKey)}
              </span>

              <h3
                className={cn(
                  'font-semibold text-sm sm:text-base mb-1.5',
                  'text-slate-800 dark:text-slate-100',
                )}
              >
                {t(titleKey)}
              </h3>
              <p
                className={cn(
                  'text-[11px] sm:text-xs leading-relaxed',
                  'text-slate-500 dark:text-slate-400',
                )}
              >
                {t(descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
