import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Briefcase, FileText, Search, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paths } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';
import { cn } from '@/lib/utils';
import { getPostJobNavigationPath } from '@/utils/postJobNavigation';

type HeroPathActionsProps = {
  isAuthed: boolean;
  role: string | null;
  isDark: boolean;
};

export function HeroPathActions({ isAuthed, role, isDark }: HeroPathActionsProps) {
  const { t } = useTranslation();
  const isMaster = isAuthed && role === USER_ROLE.MASTER;

  const primaryTo = getPostJobNavigationPath(isAuthed, role);
  const primaryLabel = isMaster ? t('home.heroBrowseJobs') : t('home.heroPostJob');
  const PrimaryIcon = isMaster ? Briefcase : FileText;

  return (
    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
      <Button
        asChild
        className={cn(
          'h-10 rounded-[14px] px-4 gap-2 text-sm font-semibold shadow-none',
          'bg-[#E97525] text-white hover:bg-[#d86920]',
        )}
      >
        <RouterLink to={primaryTo}>
          <PrimaryIcon size={16} strokeWidth={2} />
          {primaryLabel}
        </RouterLink>
      </Button>

      <Button
        asChild
        className={cn(
          'h-10 rounded-[14px] px-4 gap-2 text-sm font-medium border-2 shadow-none',
          isDark
            ? 'border-white/12 bg-white/[0.04] text-white/90 hover:bg-white/[0.08] hover:text-white hover:border-white/20'
            : 'border-gray-200 bg-white text-foreground hover:bg-[#E97525]/10 hover:text-[#c45f1a] hover:border-[#E97525]/35',
        )}
      >
        <RouterLink to={paths.masters}>
          <Search size={16} strokeWidth={2} />
          {t('home.findMasters')}
        </RouterLink>
      </Button>

      {!isMaster ? (
        <Button
          asChild
          className={cn(
            'h-10 rounded-[14px] px-3 gap-1.5 text-sm font-medium shadow-none bg-transparent',
            isDark
              ? 'text-white/60 hover:text-[#E97525] hover:bg-white/[0.06]'
              : 'text-muted-foreground hover:text-[#c45f1a] hover:bg-[#E97525]/10',
          )}
        >
          <RouterLink to={paths.plans}>
            <CreditCard size={15} strokeWidth={2} />
            {t('home.viewPlans')}
          </RouterLink>
        </Button>
      ) : null}
    </div>
  );
}
