import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Briefcase, Clock, DollarSign, Zap, Users, UserPlus, LogIn } from 'lucide-react';
import { useJobByIdQuery } from '@/features/jobs/jobsApi';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { Button } from '@/components/ui/button';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { paths } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';
import { formatDateTimeString } from '@/utils/date';

export default function PublicJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: job, isLoading } = useJobByIdQuery({ id: id! }, { skip: !id });
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const isMaster = role === USER_ROLE.MASTER;

  if (isLoading) return <CardsSkeleton count={2} />;
  if (!job) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Back */}
      <Link
        to={paths.jobs.list}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {t('common.back', 'Back')}
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Briefcase className="h-5 w-5" />
          </div>
          <span
            className={[
              'rounded-full px-3 py-1 text-xs font-medium',
              job.status === 'OPEN'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-500/10',
            ].join(' ')}
          >
            {job.status === 'OPEN' ? t('jobs.open', 'Open') : job.status === 'FOUND' ? t('jobs.found', 'Found') : t('jobs.closed', 'Closed')}
          </span>
        </div>

        <h1 className="mb-2 text-xl font-bold text-foreground">{job.title}</h1>
        <p className="mb-5 whitespace-pre-line text-sm text-muted-foreground">{job.description}</p>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {job.type === 'FIXED_PRICE' ? t('jobs.fixedPrice', 'Fixed Price') : t('jobs.hourly', 'Hourly')}
          </span>
          {job.type === 'FIXED_PRICE' && job.budget != null && (
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <DollarSign className="h-4 w-4 text-primary" />
              {job.budget} MDL
            </span>
          )}
          {job.type === 'HOURLY' && job.hourlyRate != null && (
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <DollarSign className="h-4 w-4 text-primary" />
              {job.hourlyRate} MDL/h
            </span>
          )}
          <span className="flex items-center gap-1.5 font-medium text-primary">
            <Zap className="h-4 w-4" />
            {t('jobs.minJoints', 'Min')} {job.minJoints} joints
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            {job._count.applications}{' '}
            {job._count.applications === 1
              ? t('jobs.application', 'application')
              : t('jobs.applications', 'applications')}
          </span>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          {t('jobs.posted', 'Posted')} {formatDateTimeString(job.createdAt)}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        {job.status !== 'OPEN' ? (
          <p className="text-center text-sm text-muted-foreground">
            {t('jobs.notAccepting', 'This job is no longer accepting applications')}
          </p>
        ) : isMaster ? (
          <Button asChild className="w-full gap-2" size="lg">
            <Link to={`/jobs?apply=${job.id}`}>
              <Zap className="h-4 w-4" />
              {t('jobs.applyNow', 'Apply Now')}
            </Link>
          </Button>
        ) : isAuthed ? (
          /* CLIENT or other role */
          <p className="text-center text-sm text-muted-foreground">
            {t('jobs.mastersOnly', 'Only masters can apply to jobs')}
          </p>
        ) : (
          /* Not authenticated */
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              {t('jobs.registerToApply', 'Register as a master to apply for this job')}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to={paths.register}>
                  <UserPlus className="h-4 w-4" />
                  {t('jobs.registerAsMaster', 'Register as Master')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to={paths.login}>
                  <LogIn className="h-4 w-4" />
                  {t('nav.login', 'Log In')}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
