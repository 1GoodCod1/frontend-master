import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHead } from '@/components/home/SectionHead';
import { HomeStepCard } from '@/components/home/HomeStepCard';
import { COMPANII_SECTION_ACCENT, COMPANII_TEASER_ITEMS } from '@/constants/home';
import { paths } from '@/constants/routes';
import { cn } from '@/lib/utils';

function SoonTrailing() {
  const { t } = useTranslation();

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/12 dark:text-violet-400">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />
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

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5">
        {COMPANII_TEASER_ITEMS.map(({ icon, titleKey, descKey, statusKey, accent, bg }, i) => (
          <HomeStepCard
            key={titleKey}
            index={i + 1}
            icon={icon}
            title={t(titleKey)}
            description={t(descKey)}
            badge={t(statusKey)}
            badgeClassName="bg-violet-500/10 text-violet-700 dark:bg-violet-500/12 dark:text-violet-400"
            accentClass={accent}
            iconBgClass={bg}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-6">
        <Button
          asChild
          className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#8B5CF6] px-4 text-[13px] font-semibold text-white shadow-none hover:bg-[#7c4fe0]"
        >
          <RouterLink to={paths.companii}>
            {t('home.companii.ctaLearn')}
            <ArrowRight size={14} strokeWidth={2} />
          </RouterLink>
        </Button>
        <Button
          asChild
          variant="outline"
          className={cn(
            'inline-flex h-10 rounded-[14px] border-2 px-4 text-[13px] font-medium shadow-none',
            'border-[#E9ECEF] bg-white text-[#495057] hover:border-violet-500/35 hover:bg-violet-500/10 hover:text-violet-700',
            'dark:border-white/12 dark:bg-white/[0.04] dark:text-white/90',
          )}
        >
          <RouterLink to={`${paths.companii}#waitlist`}>{t('home.companii.ctaWaitlist')}</RouterLink>
        </Button>
      </div>
    </div>
  );
}
