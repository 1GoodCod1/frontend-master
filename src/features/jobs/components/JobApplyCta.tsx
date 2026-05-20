import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  CheckCircle2,
  LogIn,
  Lock,
  Sparkles,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import { JointsBadge, JointsMark } from '@/components/joints';
import { Button } from '@/components/ui/button';
import { paths } from '@/constants/routes';
import { cn } from '@/lib/utils';
import {
  cabinetCardStaticCls,
  cabinetIconWrapCls,
  cabinetOutlineBtnCls,
  cabinetPrimaryBtnCls,
  cabinetSectionTitleCls,
  cabinetTextMuted,
} from '@/lib/cabinetStyles';

type JobApplyCtaProps = {
  jobId: string;
  minJoints: number;
  isOpen: boolean;
  isAuthed: boolean;
  isMaster: boolean;
  alreadyApplied: boolean;
  className?: string;
};

export function JobApplyCta({
  jobId,
  minJoints,
  isOpen,
  isAuthed,
  isMaster,
  alreadyApplied,
  className,
}: JobApplyCtaProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const applyPath = `/dashboard/jobs/${jobId}/apply`;
  const redirect = encodeURIComponent(applyPath);

  if (!isOpen) {
    return (
      <div className={cn('flex flex-col items-center gap-3 p-6 text-center', cabinetCardStaticCls, className)}>
        <div className={cabinetIconWrapCls}>
          <Lock className="size-5 text-[#868E96] dark:text-white/40" strokeWidth={2} />
        </div>
        <p className={cabinetTextMuted}>{t('jobs.notAccepting')}</p>
      </div>
    );
  }

  if (isMaster && alreadyApplied) {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-[18px] border border-emerald-200/80 dark:border-emerald-500/25',
          'bg-emerald-50/80 dark:bg-emerald-500/10',
          className,
        )}
      >
        <div className="flex gap-3 px-5 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">{t('jobs.alreadyApplied')}</p>
            <p className="mt-0.5 text-xs text-emerald-800/70 dark:text-emerald-400/70">{t('jobs.proposalSubmitted')}</p>
            <Link
              to="/dashboard/jobs/applications"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 transition-all hover:gap-2 dark:text-emerald-400"
            >
              {t('jobs.submittedProposals')}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isMaster) {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-[18px] border border-[#E97525]/25 dark:border-[#E97525]/20',
          className,
        )}
      >
        <div className="flex items-start gap-3 bg-[#E97525]/8 px-5 py-4 dark:bg-[#E97525]/10">
          <div className={cabinetIconWrapCls}>
            <Sparkles className="size-5" strokeWidth={2} />
          </div>
          <div>
            <p className={cabinetSectionTitleCls}>{t('jobs.panel.readyToApply')}</p>
            <p className={cn('mt-1', cabinetTextMuted)}>{t('jobs.panel.readyToApplyDesc', { joints: minJoints })}</p>
          </div>
        </div>
        <div className="border-t border-[#E9ECEF] bg-white px-5 py-4 dark:border-white/[0.08] dark:bg-[#1a1a1a]">
          <Button className={cn(cabinetPrimaryBtnCls, 'h-11 w-full gap-2')} onClick={() => navigate(applyPath)}>
            {t('jobs.applyNow')}
            <JointsBadge value={minJoints} size="sm" variant="inverted" />
          </Button>
        </div>
      </div>
    );
  }

  if (isAuthed) {
    return (
      <div className={cn('p-5 sm:p-6', cabinetCardStaticCls, className)}>
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          <div className={cabinetIconWrapCls}>
            <Briefcase className="size-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cabinetSectionTitleCls}>{t('jobs.panel.clientTitle')}</p>
            <p className={cn('mt-1', cabinetTextMuted)}>{t('jobs.panel.clientDesc')}</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                className={cn(cabinetPrimaryBtnCls, 'w-full sm:w-auto')}
                onClick={() => navigate(`${paths.register}?redirect=${redirect}`)}
              >
                <UserPlus className="size-4" strokeWidth={2} />
                {t('jobs.registerAsMaster')}
              </Button>
              <Button variant="outline" className={cn(cabinetOutlineBtnCls, 'w-full sm:w-auto')} asChild>
                <Link to={paths.plans}>{t('jobs.sidebar.viewPlans')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('p-5 sm:p-6', cabinetCardStaticCls, className)}>
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        <div className={cabinetIconWrapCls}>
          <JointsMark className="size-5 text-[#E97525]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={cabinetSectionTitleCls}>{t('jobs.panel.guestTitle')}</h3>
          <p className={cn('mt-1.5', cabinetTextMuted)}>{t('jobs.panel.guestDesc')}</p>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <Button
              className={cn(cabinetPrimaryBtnCls, 'w-full sm:flex-1')}
              onClick={() => navigate(`${paths.register}?redirect=${redirect}`)}
            >
              <UserPlus className="size-4" strokeWidth={2} />
              {t('jobs.register')}
            </Button>
            <Button
              variant="outline"
              className={cn(cabinetOutlineBtnCls, 'w-full sm:flex-1')}
              onClick={() => navigate(`${paths.login}?redirect=${redirect}`)}
            >
              <LogIn className="size-4" strokeWidth={2} />
              {t('jobs.logIn')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
