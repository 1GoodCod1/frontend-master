import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';
import { paths } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';
import { getPostJobNavigationPath } from '@/utils/postJobNavigation';

type HowItWorksSectionProps = {
  hideHeader?: boolean;
  isAuthed?: boolean;
  role?: string | null;
};

type PathDef = {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  ctaKey: string;
  to: string;
  accent: string;
};

export const HowItWorksSection = ({
  hideHeader = false,
  isAuthed = false,
  role = null,
}: HowItWorksSectionProps) => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotionPreference();
  const postJobPath = getPostJobNavigationPath(isAuthed, role);

  const clientPaths: PathDef[] = [
    {
      icon: Search,
      titleKey: 'home.howItWorks.pathSearchTitle',
      descKey: 'home.howItWorks.pathSearchDesc',
      ctaKey: 'home.findMasters',
      to: paths.masters,
      accent: '#E97525',
    },
    {
      icon: Briefcase,
      titleKey: 'home.howItWorks.pathJobsTitle',
      descKey: 'home.howItWorks.pathJobsDesc',
      ctaKey: 'home.heroPostJob',
      to: postJobPath,
      accent: '#F59E0B',
    },
  ];

  return (
    <div className="w-full">
      {!hideHeader ? (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-[clamp(26px,3vw,36px)] font-bold tracking-[-0.025em] leading-[1.1] text-foreground">
            {t('home.howItWorks.title')}
          </h2>
        </div>
      ) : null}

      <ScrollReveal delay={0} duration={0.45}>
        <div className={cn('w-full rounded-[18px] p-5 sm:p-7 md:p-8', surfaceCardCls)}>
          <p className="max-w-3xl text-[13px] leading-snug text-[#6C757D] dark:text-white/50">
            {t('home.howItWorks.summary')}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
            {clientPaths.map(({ icon: Icon, titleKey, descKey, ctaKey, to, accent }, index) => (
              <ScrollReveal
                key={titleKey}
                delay={0.08 + index * 0.1}
                duration={0.4}
                className="h-full"
              >
                <div
                  className={cn(
                    'flex h-full flex-col rounded-[14px] border px-4 py-4',
                    'border-[#E9ECEF] bg-[hsl(var(--secondary)/0.35)] dark:border-white/10 dark:bg-white/[0.03]',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
                      style={{ backgroundColor: `${accent}18` }}
                    >
                      <Icon className="size-5" style={{ color: accent }} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#212529] dark:text-white">{t(titleKey)}</p>
                      <p className="mt-1 text-xs leading-snug text-[#6C757D] dark:text-white/50">{t(descKey)}</p>
                    </div>
                  </div>
                  <motion.div
                    whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className="mt-3 w-fit"
                  >
                    <Button
                      asChild
                      variant="ghost"
                      className="h-auto justify-start gap-1.5 p-0 text-[13px] font-medium hover:bg-transparent"
                      style={{ color: accent }}
                    >
                      <RouterLink to={to}>
                        {t(ctaKey)}
                        <ArrowRight size={13} strokeWidth={2} />
                      </RouterLink>
                    </Button>
                  </motion.div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
