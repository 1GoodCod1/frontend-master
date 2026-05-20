import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Briefcase, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

      <div className={cn('w-full rounded-[18px] p-5 sm:p-7 md:p-8', surfaceCardCls)}>
        <p className="max-w-3xl text-[13px] leading-snug text-[#6C757D] dark:text-white/50">
          {t('home.howItWorks.summary')}
        </p>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
          {clientPaths.map(({ icon: Icon, titleKey, descKey, ctaKey, to, accent }) => (
            <li
              key={titleKey}
              className={cn(
                'flex flex-col rounded-[14px] border px-4 py-4',
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
              <Button
                asChild
                variant="ghost"
                className="mt-3 h-auto justify-start gap-1.5 p-0 text-[13px] font-medium hover:bg-transparent"
                style={{ color: accent }}
              >
                <RouterLink to={to}>
                  {t(ctaKey)}
                  <ArrowRight size={13} strokeWidth={2} />
                </RouterLink>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
