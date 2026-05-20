import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { FileText, Zap, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paths } from '@/constants/routes';
import { HomeStepCard } from '@/components/home/HomeStepCard';
import { getPostJobNavigationPath } from '@/utils/postJobNavigation';
const STEPS = [
  { icon: FileText, titleKey: 'home.jobsFlow.step1Title', descKey: 'home.jobsFlow.step1Desc' },
  { icon: Zap, titleKey: 'home.jobsFlow.step2Title', descKey: 'home.jobsFlow.step2Desc' },
  { icon: Trophy, titleKey: 'home.jobsFlow.step3Title', descKey: 'home.jobsFlow.step3Desc' },
] as const;

const STEPS_GRID = 'grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5';

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
          <h2 className="text-[clamp(26px,3vw,36px)] font-bold tracking-[-0.025em] leading-[1.1] text-foreground">
            {t('home.jobsFlow.title')}
          </h2>
        </div>
      ) : null}

      <div className={STEPS_GRID}>
        {STEPS.map(({ icon, titleKey, descKey }, i) => (
          <HomeStepCard
            key={titleKey}
            index={i + 1}
            icon={icon}
            title={t(titleKey)}
            description={t(descKey)}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button
          asChild
          className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#E97525] px-4 text-[13px] font-semibold text-white shadow-none hover:bg-[#d86920]"
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
            className="inline-flex h-10 rounded-[14px] border-2 border-[#E9ECEF] bg-white px-4 text-[13px] font-medium text-[#495057] shadow-none hover:border-[#E97525]/35 hover:bg-[#E97525]/10 hover:text-[#c45f1a] dark:border-white/12 dark:bg-white/[0.04] dark:text-white/90"
          >
            <RouterLink to={postJobPath}>{t('home.heroPostJob')}</RouterLink>
          </Button>
        ) : null}
      </div>
    </div>
  );
};
