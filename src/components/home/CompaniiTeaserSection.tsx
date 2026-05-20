import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHead } from '@/components/home/SectionHead';
import { COMPANII_SECTION_ACCENT, COMPANII_TEASER_ITEMS } from '@/constants/home';
import { paths } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { surfaceCardInteractiveCls } from '@/lib/surfaceCard';

function SoonTrailing() {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold',
        'bg-violet-500/10 text-violet-700 dark:bg-violet-500/12 dark:text-violet-400',
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
      {t('home.companii.statusSoon')}
    </span>
  );
}

export function CompaniiTeaserSection() {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <SectionHead
        kicker={t('home.companii.kicker')}
        title={t('home.companii.title')}
        accent={COMPANII_SECTION_ACCENT}
        trailing={<SoonTrailing />}
        link={{ label: t('home.companii.ctaLearn'), href: paths.companii }}
      />

      <p className="-mt-4 mb-6 sm:mb-8 text-sm sm:text-[15px] text-muted-foreground leading-relaxed max-w-3xl">
        {t('home.companii.subtitle')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full">
        {COMPANII_TEASER_ITEMS.map(({ icon: Icon, titleKey, descKey, statusKey, accent, bg }, i) => (
          <div
            key={titleKey}
            className={cn(
              'relative flex flex-col gap-2 px-4 py-4 sm:px-5 sm:py-5 rounded-xl min-w-0 h-full',
              surfaceCardInteractiveCls,
              'transition duration-200',
            )}
          >
            <span
              className={cn(
                'absolute top-3 left-3 sm:top-3.5 sm:left-3.5 text-[10px] font-bold tabular-nums w-5 h-5 rounded-full flex items-center justify-center',
                bg,
                accent,
              )}
              aria-hidden
            >
              {i + 1}
            </span>
            <div className="flex items-start gap-3 sm:gap-4 ml-7 sm:ml-8 min-w-0">
              <div className={cn('shrink-0 p-2.5 rounded-xl', bg)}>
                <Icon className={cn('w-5 h-5', accent)} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <span
                  className={cn(
                    'inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5',
                    'bg-violet-500/10 text-violet-700 dark:bg-violet-500/12 dark:text-violet-400',
                  )}
                >
                  {t(statusKey)}
                </span>
                <p className="font-semibold text-sm sm:text-[15px] text-foreground leading-snug">
                  {t(titleKey)}
                </p>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-snug">
                  {t(descKey)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 sm:mt-6 flex flex-wrap gap-2.5">
        <Button
          asChild
          className="h-10 rounded-[14px] px-4 gap-2 text-sm font-semibold bg-[#8B5CF6] text-white hover:bg-[#7c4fe0] shadow-none"
        >
          <RouterLink to={paths.companii}>
            {t('home.companii.ctaLearn')}
            <ArrowRight size={14} strokeWidth={2} />
          </RouterLink>
        </Button>
        <Button
          asChild
          className="h-10 rounded-[14px] px-4 text-sm font-medium border-2 shadow-none border-gray-200 bg-white text-foreground hover:bg-violet-500/10 hover:text-violet-700 hover:border-violet-500/35 dark:border-white/12 dark:bg-white/[0.04] dark:text-white/90 dark:hover:bg-white/[0.08] dark:hover:text-white dark:hover:border-white/20"
        >
          <RouterLink to={`${paths.companii}#waitlist`}>
            {t('home.companii.ctaWaitlist')}
          </RouterLink>
        </Button>
      </div>
    </div>
  );
}
