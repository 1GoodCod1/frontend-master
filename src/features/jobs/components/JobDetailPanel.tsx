import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bookmark, BookmarkCheck, ChevronLeft, Clock, DollarSign, Loader2, MapPin, Users, Zap, CheckCircle2, UserPlus, LogIn, Briefcase } from 'lucide-react';
import { useJobByIdQuery } from '@/features/jobs/jobsApi';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { Button } from '@/components/ui/button';
import { mediaUrl } from '@/utils/media';
import { cn } from '@/lib/utils';
import { paths } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';
import { timeAgo } from '@/utils/jobs';

interface JobDetailPanelProps {
  jobId: string;
  onClose: () => void;
  savedIds: Set<string>;
  onSave: (id: string) => void;
  appliedIds: Set<string>;
}

export function JobDetailPanel({ jobId, onClose, savedIds, onSave, appliedIds }: JobDetailPanelProps) {
  const navigate = useNavigate();
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const isMaster = role === USER_ROLE.MASTER;
  const { t } = useTranslation();
  const { data: job, isLoading } = useJobByIdQuery({ id: jobId });
  const alreadyApplied = appliedIds.has(jobId);
  const isSaved = savedIds.has(jobId);

  if (isLoading || !job) return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/30" />
    </div>
  );

  const isOpen = job.status === 'OPEN';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3.5">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">{t('jobs.back')}</span>
        </button>
        <div className="flex items-center gap-2">
          <span className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-semibold',
            isOpen
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-muted text-muted-foreground',
          )}>
            {isOpen ? t('jobs.open') : job.status === 'FOUND' ? t('jobs.filled') : t('jobs.closed')}
          </span>
          <button
            onClick={() => onSave(jobId)}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors',
              isSaved
                ? 'bg-primary/10 text-primary'
                : 'bg-muted/60 hover:bg-muted text-muted-foreground',
            )}
          >
            {isSaved
              ? <><BookmarkCheck className="h-3.5 w-3.5" />{t('jobs.saved')}</>
              : <><Bookmark className="h-3.5 w-3.5" />{t('jobs.save')}</>}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-7 py-6 space-y-6">

          {/* Title + meta */}
          <div>
            <h1 className="mb-2.5 text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 leading-tight">{job.title}</h1>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{t('jobs.postedAgo', { time: timeAgo(job.createdAt) })}</span>
              {job.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.city.name}</span>}
              {!job.cityId && <span className="flex items-center gap-1">🌍 {t('jobs.worldwide')}</span>}
            </div>
          </div>
          
          {job.category && (
            <div className="flex items-center gap-2 rounded-xl bg-primary/5 dark:bg-primary/10 px-4 py-2 text-primary">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm font-semibold">{job.category.name}</span>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { label: t('jobs.typeLabel'), value: job.type === 'FIXED_PRICE' ? t('jobs.fixedPrice') : t('jobs.hourly'), icon: <Clock className="h-4 w-4" /> },
              {
                label: t('jobs.budget'), icon: <DollarSign className="h-4 w-4" />,
                value: job.budget != null ? `${job.budget} MDL` : job.hourlyRate != null ? `${job.hourlyRate}/h` : '—',
              },
              { label: t('jobs.minJointsLabel'), value: `${job.minJoints}`, icon: <Zap className="h-4 w-4" />, accent: true },
              { label: t('jobs.proposalsLabel'), value: `${job._count?.applications || 0}`, icon: <Users className="h-4 w-4" /> },
            ].map((s) => (
              <div
                key={s.label}
                className={cn(
                  'rounded-2xl px-4 py-3 text-center border transition duration-300 hover:-translate-y-0.5',
                  s.accent
                    ? 'bg-primary/10 border-primary/20'
                    : 'bg-[#F9FAFB] dark:bg-[hsl(43,16%,12%)] border-gray-200/80 dark:border-white/[0.08]',
                )}
              >
                <p className={cn('mb-1 text-[11px] font-medium uppercase tracking-wide', s.accent ? 'text-primary/70' : 'text-slate-500 dark:text-slate-400')}>
                  {s.label}
                </p>
                <p className={cn('flex items-center justify-center gap-1 text-sm font-bold', s.accent ? 'text-primary' : 'text-slate-800 dark:text-slate-100')}>
                  {s.icon}{s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Photos */}
          {job.photos?.length > 0 && (
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('jobs.photos')}</p>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {job.photos.map((p) => (
                  <img key={p.id} src={mediaUrl(p.file.path)} alt=""
                    className="h-28 w-28 shrink-0 rounded-2xl object-cover" />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('jobs.description')}</p>
            <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{job.description}</p>
          </div>

          {/* Apply section */}
          {!isOpen ? (
            <div className="rounded-2xl bg-[#F9FAFB] dark:bg-[hsl(43,16%,12%)] border border-gray-200/80 dark:border-white/[0.08] px-5 py-4 text-sm text-slate-500 dark:text-slate-400 text-center">
              {t('jobs.notAccepting')}
            </div>
          ) : isMaster ? (
            alreadyApplied ? (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 px-5 py-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{t('jobs.alreadyApplied')}</p>
                  <p className="text-xs text-emerald-700/60 dark:text-emerald-400/60">{t('jobs.proposalSubmitted')}</p>
                </div>
              </div>
            ) : null
          ) : !isAuthed ? (
            <div className="rounded-2xl bg-[#F9FAFB] dark:bg-[hsl(43,16%,12%)] border border-gray-200/80 dark:border-white/[0.08] p-6 text-center">
              <Briefcase className="mx-auto mb-3 h-9 w-9 text-slate-400 dark:text-slate-500" />
              <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{t('jobs.registerToApply')}</p>
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">{t('jobs.registerFreeAccount')}</p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" className="gap-1.5" onClick={() => navigate(paths.register)}>
                  <UserPlus className="h-3.5 w-3.5" />{t('jobs.register')}
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(paths.login)}>
                  <LogIn className="h-3.5 w-3.5" />{t('jobs.logIn')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#F9FAFB] dark:bg-[hsl(43,16%,12%)] border border-gray-200/80 dark:border-white/[0.08] px-5 py-4 text-sm text-slate-500 dark:text-slate-400 text-center">
              {t('jobs.mastersOnly')}
            </div>
          )}
        </div>
      </div>

      {/* Sticky apply footer */}
      {isOpen && isMaster && !alreadyApplied && (
        <div className="shrink-0 px-6 py-4">
          <Button className="w-full gap-2 h-11 font-semibold" onClick={() => navigate(`/dashboard/jobs/${jobId}/apply`)}>
            <Zap className="h-4 w-4" />{t('jobs.applyNow')}
          </Button>
        </div>
      )}
    </div>
  );
}
