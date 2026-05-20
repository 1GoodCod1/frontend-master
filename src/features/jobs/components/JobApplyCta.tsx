import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  CheckCircle2,
  LogIn,
  Lock,
  Sparkles,
  UserPlus,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paths } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';

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
      <div
        className={cn(
          'rounded-2xl p-6 flex flex-col items-center text-center gap-3',
          surfaceCardCls,
          className,
        )}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1F3F5] dark:bg-white/[0.06]">
          <Lock className="h-5 w-5 text-[#868E96] dark:text-white/40" />
        </div>
        <p className="text-sm font-medium text-[#495057] dark:text-white/70">
          {t('jobs.notAccepting')}
        </p>
      </div>
    );
  }

  if (isMaster && alreadyApplied) {
    return (
      <div
        className={cn(
          'rounded-2xl overflow-hidden border border-emerald-200/80 dark:border-emerald-500/25',
          'bg-emerald-50/80 dark:bg-emerald-500/10',
          className,
        )}
      >
        <div className="px-5 py-5 flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              {t('jobs.alreadyApplied')}
            </p>
            <p className="mt-0.5 text-xs text-emerald-800/70 dark:text-emerald-400/70">
              {t('jobs.proposalSubmitted')}
            </p>
            <Link
              to="/dashboard/jobs/applications"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:gap-2 transition-all"
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
          'rounded-2xl overflow-hidden',
          'border border-[#E97525]/25 dark:border-[#E97525]/20',
          className,
        )}
      >
        <div className="bg-[#E97525]/8 dark:bg-[#E97525]/10 px-5 py-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E97525]/15">
            <Sparkles className="h-5 w-5 text-[#E97525]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#212529] dark:text-white">
              {t('jobs.panel.readyToApply')}
            </p>
            <p className="mt-1 text-xs text-[#6C757D] dark:text-white/55 leading-relaxed">
              {t('jobs.panel.readyToApplyDesc', { joints: minJoints })}
            </p>
          </div>
        </div>
        <div className="px-5 py-4 bg-white dark:bg-[#1a1a1a] border-t border-[#E9ECEF] dark:border-white/[0.08]">
          <Button
            className="w-full h-11 rounded-full font-semibold gap-2 bg-[#E97525] hover:bg-[#d4691f] text-white"
            onClick={() => navigate(applyPath)}
          >
            <Zap className="h-4 w-4" />
            {t('jobs.applyNow')} · {minJoints} joints
          </Button>
        </div>
      </div>
    );
  }

  if (isAuthed) {
    return (
      <div
        className={cn(
          'rounded-2xl overflow-hidden',
          surfaceCardCls,
          className,
        )}
      >
        <div className="px-5 py-5 flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F1F3F5] dark:bg-white/[0.06]">
            <Briefcase className="h-5 w-5 text-[#E97525]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#212529] dark:text-white">
              {t('jobs.panel.clientTitle')}
            </p>
            <p className="mt-1 text-xs text-[#6C757D] dark:text-white/55 leading-relaxed">
              {t('jobs.panel.clientDesc')}
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button
                size="sm"
                className="rounded-full font-semibold gap-1.5 bg-[#212529] hover:bg-[#343a40] text-white dark:bg-[#E97525] dark:hover:bg-[#d4691f]"
                onClick={() => navigate(`${paths.register}?redirect=${redirect}`)}
              >
                <UserPlus className="h-3.5 w-3.5" />
                {t('jobs.registerAsMaster')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full font-semibold border-[#e8e8e8] dark:border-[#2d2d2d]"
                asChild
              >
                <Link to={paths.plans}>{t('jobs.sidebar.viewPlans')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden',
        'border border-[#E9ECEF] dark:border-white/[0.08]',
        className,
      )}
    >
      <div className="bg-[#F8F9FA] dark:bg-white/[0.03] px-6 py-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E97525]/12">
          <Zap className="h-7 w-7 text-[#E97525]" />
        </div>
        <h3 className="text-base font-bold text-[#212529] dark:text-white">
          {t('jobs.panel.guestTitle')}
        </h3>
        <p className="mt-2 text-sm text-[#6C757D] dark:text-white/55 max-w-xs mx-auto leading-relaxed">
          {t('jobs.panel.guestDesc')}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 px-5 py-4 bg-white dark:bg-[#1a1a1a] border-t border-[#E9ECEF] dark:border-white/[0.08]">
        <Button
          className="flex-1 h-10 rounded-full font-semibold gap-1.5 bg-[#212529] hover:bg-[#343a40] text-white dark:bg-[#E97525] dark:hover:bg-[#d4691f]"
          onClick={() => navigate(`${paths.register}?redirect=${redirect}`)}
        >
          <UserPlus className="h-4 w-4" />
          {t('jobs.register')}
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-10 rounded-full font-semibold gap-1.5 border-[#e8e8e8] dark:border-[#2d2d2d]"
          onClick={() => navigate(`${paths.login}?redirect=${redirect}`)}
        >
          <LogIn className="h-4 w-4" />
          {t('jobs.logIn')}
        </Button>
      </div>
    </div>
  );
}
