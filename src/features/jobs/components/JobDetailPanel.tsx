import { useTranslation } from 'react-i18next';
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  Users,
} from 'lucide-react';
import { JointsBadge } from '@/components/joints';
import { useJobByIdQuery } from '@/features/jobs/jobsApi';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { mediaUrl } from '@/utils/media';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';
import { USER_ROLE } from '@/constants/roles';
import { displayJobTitle, timeAgo } from '@/utils/jobs';
import { getTranslatedCategoryName, getTranslatedCityName } from '@/utils/translateCityCategory';
import { JobApplyCta } from './JobApplyCta';

interface JobDetailPanelProps {
  jobId: string;
  onClose: () => void;
  savedIds: Set<string>;
  onSave: (id: string) => void;
  appliedIds: Set<string>;
}

export function JobDetailPanel({ jobId, onClose, savedIds, onSave, appliedIds }: JobDetailPanelProps) {
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const isMaster = role === USER_ROLE.MASTER;
  const { t, i18n } = useTranslation();
  const { data: job, isLoading } = useJobByIdQuery({ id: jobId });
  const alreadyApplied = appliedIds.has(jobId);
  const isSaved = savedIds.has(jobId);

  if (isLoading || !job) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 bg-[hsl(var(--card))]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/30" />
      </div>
    );
  }

  const isOpen = job.status === 'OPEN';
  const title = displayJobTitle(job.title);
  const categoryLabel = job.category
    ? getTranslatedCategoryName(
        t,
        {
          slug: job.category.slug,
          name: job.category.name,
          translations: job.category.translations as
            | Record<string, { name?: string }>
            | null
            | undefined,
        },
        i18n.language,
      )
    : null;
  const cityLabel = job.city
    ? getTranslatedCityName(t, job.city, i18n.language)
    : null;

  const stats = [
    {
      label: t('jobs.typeLabel'),
      value: job.type === 'FIXED_PRICE' ? t('jobs.fixedPrice') : t('jobs.hourly'),
      icon: Clock,
    },
    {
      label: t('jobs.budget'),
      value:
        job.budget != null
          ? `${job.budget.toLocaleString('ro-MD')} MDL`
          : job.hourlyRate != null
            ? `${job.hourlyRate}/h`
            : '—',
      icon: DollarSign,
    },
    {
      label: t('jobs.minJointsLabel'),
      value: String(job.minJoints),
      joints: true as const,
    },
    {
      label: t('jobs.proposalsLabel'),
      value: String(job._count?.applications ?? 0),
      icon: Users,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--card))]">
      <div
        className={cn(
          'shrink-0 flex items-center justify-between gap-3 px-5 py-3.5',
          'border-b border-[#E9ECEF] dark:border-white/[0.08]',
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-[#6C757D] dark:text-white/55 hover:text-[#212529] dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{t('jobs.back')}</span>
        </button>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
              isOpen
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-[#F1F3F5] text-[#6C757D] dark:bg-white/[0.06] dark:text-white/50',
            )}
          >
            {isOpen ? t('jobs.open') : job.status === 'FOUND' ? t('jobs.filled') : t('jobs.closed')}
          </span>
          <button
            type="button"
            onClick={() => onSave(jobId)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200',
              isSaved
                ? 'bg-[#E97525]/10 text-[#E97525]'
                : 'bg-[#F1F3F5] text-[#6C757D] hover:bg-[#E9ECEF] dark:bg-white/[0.06] dark:text-white/55 dark:hover:bg-white/[0.1]',
            )}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="h-3.5 w-3.5" />
                {t('jobs.saved')}
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5" />
                {t('jobs.save')}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 sm:px-6 py-6 space-y-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#212529] dark:text-white leading-snug">
              {title}
            </h1>
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6C757D] dark:text-white/50">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {t('jobs.postedAgo', { time: timeAgo(job.createdAt) })}
              </span>
              {cityLabel ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {cityLabel}
                </span>
              ) : (
                <span>{t('jobs.worldwide')}</span>
              )}
            </div>
          </div>

          {categoryLabel ? (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                'bg-[#F1F3F5] text-[#495057] dark:bg-white/[0.06] dark:text-white/65',
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E97525]" aria-hidden />
              {categoryLabel}
            </span>
          ) : null}

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {stats.map((s) => {
              const Icon = 'icon' in s ? s.icon : undefined;
              const isJoints = 'joints' in s && s.joints;
              return (
                <div
                  key={s.label}
                  className={cn(
                    'rounded-xl px-3 py-3 text-center',
                    surfaceCardCls,
                    isJoints && 'border-[#E8C878]/40 dark:border-[#E97525]/25',
                  )}
                >
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#868E96] dark:text-white/45">
                    {s.label}
                  </p>
                  {isJoints ? (
                    <div className="flex justify-center">
                      <JointsBadge value={Number(s.value)} size="sm" />
                    </div>
                  ) : (
                    <p className="flex items-center justify-center gap-1 text-sm font-bold tabular-nums text-[#212529] dark:text-white">
                      {Icon ? <Icon className="h-3.5 w-3.5 opacity-70" /> : null}
                      {s.value}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {job.photos && job.photos.length > 0 ? (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#868E96] dark:text-white/45">
                {t('jobs.photos')}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {job.photos.map((p) => (
                  <img
                    key={p.id}
                    src={mediaUrl(p.file.path)}
                    alt=""
                    className="h-24 w-24 shrink-0 rounded-xl object-cover border border-[#E9ECEF] dark:border-white/[0.08]"
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className={cn('rounded-2xl p-4', surfaceCardCls)}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#868E96] dark:text-white/45">
              {t('jobs.description')}
            </p>
            <p className="whitespace-pre-wrap text-sm text-[#495057] dark:text-white/70 leading-relaxed">
              {job.description}
            </p>
          </div>

          <JobApplyCta
            jobId={jobId}
            minJoints={job.minJoints}
            isOpen={isOpen}
            isAuthed={isAuthed}
            isMaster={isMaster}
            alreadyApplied={alreadyApplied}
          />
        </div>
      </div>
    </div>
  );
}
