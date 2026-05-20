import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  UserPlus,
  FileText,
  Bookmark,
  Star,
  ArrowRight,
  Lightbulb,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paths } from '@/constants/routes';
import { JointsMark } from '@/components/joints';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';
import { PublicJobsFilters } from './PublicJobsFilters';

const sidebarCardCls = cn('rounded-2xl p-4', surfaceCardCls);

const accentCardCls = cn(
  'rounded-2xl p-4',
  surfaceCardCls,
  'border-[#E97525]/25 dark:border-[#E97525]/20',
);

interface SidebarLinkProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function JointsSidebarIcon({ className }: { className?: string }) {
  return <JointsMark className={cn('h-4 w-4 shrink-0', className)} />;
}

function SidebarLink({ to, icon: Icon, label }: SidebarLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors duration-200',
        'text-[#495057] dark:text-white/70 hover:text-[#E97525] hover:bg-[#F1F3F5] dark:hover:bg-white/[0.04]',
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-70 group-hover:text-[#E97525] transition-colors" />
      <span className="flex-1 truncate">{label}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
    </Link>
  );
}

export type JobsSidebarFilterProps = {
  cityId: string;
  categoryId: string;
  onCityChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onReset: () => void;
  showBestHint?: boolean;
  profileCategory?: string | null;
  profileCity?: string | null;
};

export function JobsSidebar({
  isAuthed,
  isMaster,
  filters,
}: {
  isAuthed: boolean;
  isMaster: boolean;
  filters: JobsSidebarFilterProps;
}) {
  const { t } = useTranslation();
  const isClient = isAuthed && !isMaster;

  return (
    <div className="space-y-3">
      <PublicJobsFilters {...filters} />

      {!isAuthed && (
        <>
          <div className={accentCardCls}>
            <div className="flex items-center gap-2 mb-2">
              <JointsMark className="h-4 w-4 text-[#D97706] dark:text-[#FBBF24]" />
              <h3 className="text-sm font-semibold text-[#212529] dark:text-white">
                {t('jobs.sidebar.guestCtaTitle')}
              </h3>
            </div>
            <p className="text-xs text-[#6C757D] dark:text-white/55 mb-3 leading-relaxed">
              {t('jobs.sidebar.guestCtaDesc')}
            </p>
            <Button asChild size="sm" className="w-full h-9 rounded-full font-semibold gap-1.5">
              <Link to={paths.register}>
                <UserPlus className="h-3.5 w-3.5" />
                {t('jobs.sidebar.register')}
              </Link>
            </Button>
          </div>

          <div className={sidebarCardCls}>
            <h3 className="text-sm font-semibold text-[#212529] dark:text-white mb-2">
              {t('jobs.sidebar.masterPromoTitle')}
            </h3>
            <p className="text-xs text-[#6C757D] dark:text-white/55 mb-3 leading-relaxed">
              {t('jobs.sidebar.masterPromoDesc')}
            </p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full h-9 rounded-full font-semibold border-[#e8e8e8] dark:border-[#2d2d2d]"
            >
              <Link to={paths.plans}>{t('jobs.sidebar.viewPlans')}</Link>
            </Button>
          </div>
        </>
      )}

      {isClient && (
        <div className={sidebarCardCls}>
          <Button asChild className="w-full h-10 rounded-full font-semibold gap-2 mb-3">
            <Link to="/client-dashboard/jobs/create">
              <Plus className="h-4 w-4" />
              {t('jobs.sidebar.postNew')}
            </Link>
          </Button>
          <div className="space-y-0.5">
            <SidebarLink
              to="/client-dashboard/jobs"
              icon={FileText}
              label={t('jobs.sidebar.myJobs')}
            />
            <SidebarLink
              to="/client-dashboard/favorites"
              icon={Bookmark}
              label={t('jobs.sidebar.savedSpecialists')}
            />
          </div>
        </div>
      )}

      {isMaster && (
        <div className={sidebarCardCls}>
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#E9ECEF] dark:border-white/[0.08]">
            <JointsMark className="h-4 w-4 text-[#D97706] dark:text-[#FBBF24]" />
            <div className="min-w-0">
              <p className="text-xs text-[#6C757D] dark:text-white/50 leading-tight">
                {t('jobs.sidebar.master')}
              </p>
              <p className="text-sm font-semibold text-[#212529] dark:text-white leading-tight mt-0.5">
                {t('jobs.sidebar.masterDashboard')}
              </p>
            </div>
          </div>
          <div className="space-y-0.5">
            <SidebarLink
              to="/dashboard/jobs/applications"
              icon={FileText}
              label={t('jobs.sidebar.myApplications')}
            />
            <SidebarLink
              to="/dashboard/subscription"
              icon={Star}
              label={t('jobs.sidebar.mySubscription')}
            />
            <SidebarLink
              to={paths.plans}
              icon={JointsSidebarIcon}
              label={t('jobs.sidebar.viewPlans')}
            />
          </div>
        </div>
      )}

      <div className={sidebarCardCls}>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-[#E97525]" />
          <h3 className="text-sm font-semibold text-[#212529] dark:text-white">
            {t('jobs.sidebar.tipsTitle')}
          </h3>
        </div>
        <ul className="space-y-1.5 text-xs text-[#6C757D] dark:text-white/55 leading-relaxed">
          <li className="flex gap-1.5">
            <span className="text-[#E97525] shrink-0">·</span>
            <span>
              {t(
                isMaster ? 'jobs.sidebar.tip1Master' : 'jobs.sidebar.tip1',
              )}
            </span>
          </li>
          <li className="flex gap-1.5">
            <span className="text-[#E97525] shrink-0">·</span>
            <span>
              {t(
                isMaster ? 'jobs.sidebar.tip2Master' : 'jobs.sidebar.tip2',
              )}
            </span>
          </li>
          <li className="flex gap-1.5">
            <span className="text-[#E97525] shrink-0">·</span>
            <span>{t('jobs.sidebar.tip3')}</span>
          </li>
        </ul>
        <Link
          to={paths.howItWorks}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#E97525] hover:gap-2 transition-all"
        >
          <BookOpen className="h-3 w-3" />
          {t('jobs.sidebar.learnMore')}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {!isAuthed && (
        <div className={cn(sidebarCardCls, 'flex items-start gap-2.5')}>
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-[#6C757D] dark:text-white/55 leading-relaxed">
            {t('jobs.sidebar.trust')}
          </p>
        </div>
      )}
    </div>
  );
}
