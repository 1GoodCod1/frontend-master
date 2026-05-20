import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Briefcase, Clock, DollarSign, Users } from 'lucide-react';
import { JointsBadge } from '@/components/joints';
import { useJobByIdQuery } from '@/features/jobs/jobsApi';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { paths } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';
import { formatDateTimeString } from '@/utils/date';
import { displayJobTitle } from '@/utils/jobs';
import { JobApplyCta } from '@/features/jobs/components/JobApplyCta';
import { cn } from '@/lib/utils';
import {
  cabinetCardStaticCls,
  cabinetIconWrapCls,
  cabinetPageMediumClassName,
  cabinetTextBody,
  cabinetTextMuted,
  cabinetTextTitle,
} from '@/lib/cabinetStyles';

const metaItemCls = 'inline-flex items-center gap-1.5 text-[13px] text-[#495057] dark:text-white/70';

export default function PublicJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: job, isLoading } = useJobByIdQuery({ id: id! }, { skip: !id });
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const isMaster = role === USER_ROLE.MASTER;

  if (isLoading) return <CardsSkeleton count={2} />;
  if (!job) return null;

  const statusLabel =
    job.status === 'OPEN'
      ? t('jobs.open', 'Open')
      : job.status === 'FOUND'
        ? t('jobs.found', 'Found')
        : t('jobs.closed', 'Closed');

  const statusCls =
    job.status === 'OPEN'
      ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-400'
      : 'bg-[#F1F3F5] text-[#6C757D] dark:bg-white/[0.06] dark:text-white/55';

  return (
    <div className={cn(cabinetPageMediumClassName, 'px-4 py-8 sm:px-6 sm:py-10')}>
      <Link
        to={paths.jobs.list}
        className={cn(
          'mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6C757D] transition-colors hover:text-[#212529] dark:text-white/50 dark:hover:text-white',
        )}
      >
        <ArrowLeft className="size-3.5" strokeWidth={2} />
        {t('common.back', 'Back')}
      </Link>

      <article className={cn('p-5 sm:p-6', cabinetCardStaticCls)}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className={cabinetIconWrapCls}>
            <Briefcase className="size-5" strokeWidth={2} />
          </div>
          <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', statusCls)}>
            {statusLabel}
          </span>
        </div>

        <h1 className={cn('mb-2 text-lg font-bold tracking-tight sm:text-xl', cabinetTextTitle)}>
          {displayJobTitle(job.title)}
        </h1>
        <p className={cn('mb-5 whitespace-pre-line', cabinetTextBody)}>{job.description}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <span className={metaItemCls}>
            <Clock className="size-4 shrink-0 text-[#E97525]" strokeWidth={2} />
            {job.type === 'FIXED_PRICE' ? t('jobs.fixedPrice', 'Fixed Price') : t('jobs.hourly', 'Hourly')}
          </span>
          {job.type === 'FIXED_PRICE' && job.budget != null ? (
            <span className={cn(metaItemCls, 'font-semibold text-[#212529] dark:text-white')}>
              <DollarSign className="size-4 shrink-0 text-[#E97525]" strokeWidth={2} />
              {job.budget} MDL
            </span>
          ) : null}
          {job.type === 'HOURLY' && job.hourlyRate != null ? (
            <span className={cn(metaItemCls, 'font-semibold text-[#212529] dark:text-white')}>
              <DollarSign className="size-4 shrink-0 text-[#E97525]" strokeWidth={2} />
              {job.hourlyRate} MDL/h
            </span>
          ) : null}
          <JointsBadge value={job.minJoints} size="md" prefix={t('jobs.minJointsLabel', 'Min')} />
          <span className={metaItemCls}>
            <Users className="size-4 shrink-0 text-[#868E96] dark:text-white/40" strokeWidth={2} />
            {job._count.applications}{' '}
            {job._count.applications === 1
              ? t('jobs.application', 'application')
              : t('jobs.applications', 'applications')}
          </span>
        </div>

        <p className={cn('mt-4', cabinetTextMuted)}>
          {t('jobs.posted', 'Posted')} {formatDateTimeString(job.createdAt)}
        </p>
      </article>

      <JobApplyCta
        className="mt-5"
        jobId={job.id}
        minJoints={job.minJoints}
        isOpen={job.status === 'OPEN'}
        isAuthed={isAuthed}
        isMaster={isMaster}
        alreadyApplied={false}
      />
    </div>
  );
}
