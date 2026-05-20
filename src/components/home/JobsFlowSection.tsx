import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { FileText, Zap, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paths } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { getPostJobNavigationPath } from '@/utils/postJobNavigation';
import { surfaceCardInteractiveCls } from '@/lib/surfaceCard';

const STEPS = [
  {
    icon: FileText,
    titleKey: 'home.jobsFlow.step1Title',
    descKey: 'home.jobsFlow.step1Desc',
    accent: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 dark:bg-amber-400/10',
  },
  {
    icon: Zap,
    titleKey: 'home.jobsFlow.step2Title',
    descKey: 'home.jobsFlow.step2Desc',
    accent: 'text-[#E97525] dark:text-[#E97525]',
    bg: 'bg-[#E97525]/10 dark:bg-[#E97525]/12',
  },
  {
    icon: Trophy,
    titleKey: 'home.jobsFlow.step3Title',
    descKey: 'home.jobsFlow.step3Desc',
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
  },
] as const;

const STEPS_GRID =
  'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full';

type JobsFlowSectionProps = {
  hideHeader?: boolean;
  showPostJobCta?: boolean;
  isAuthed?: boolean;
  role?: string | null;
};

export const JobsFlowSection = ({
  hideHeader = false,
  showPostJobCta = true,
  isAuthed = false,
  role = null,
}: JobsFlowSectionProps) => {
  const { t } = useTranslation();
  const postJobPath = getPostJobNavigationPath(isAuthed, role);

  return (
    <div className="w-full">
      {!hideHeader ? (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t('home.jobsFlow.title')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            {t('home.jobsFlow.subtitle')}
          </p>
        </div>
      ) : null}

      <div className={STEPS_GRID}>
        {STEPS.map(({ icon: Icon, titleKey, descKey, accent, bg }, i) => (
          <div
            key={titleKey}
            className={cn(
              'relative flex flex-col gap-2 px-4 py-4 sm:px-5 sm:py-5 rounded-xl min-w-0',
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

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button
          asChild
          className="h-10 rounded-[14px] px-4 gap-2 text-sm font-semibold bg-[#E97525] text-white hover:bg-[#d86920] shadow-none"
        >
          <RouterLink to={paths.jobs.list}>
            {t('home.jobsFlow.ctaBrowse')}
            <ArrowRight size={14} strokeWidth={2} />
          </RouterLink>
        </Button>
        {showPostJobCta ? (
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-[14px] px-4 text-sm font-medium"
          >
            <RouterLink to={postJobPath}>
              {t('home.heroPostJob')}
            </RouterLink>
          </Button>
        ) : null}
      </div>
    </div>
  );
};
