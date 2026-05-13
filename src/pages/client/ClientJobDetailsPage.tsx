import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  Eye,
  Star,
  Zap,
  AlertCircle,
  X,
  MessageCircle,
  XCircle,
  MapPin,
  ChevronRight,
  Award,
  ArchiveX,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { ErrorState } from '@/components/common/States';
import {
  useJobWithApplicationsQuery,
  useJobViewApplicationMutation,
  useJobSelectMasterMutation,
  useJobRejectApplicationMutation,
  useJobRequestCloseMutation,
  useJobCloseDirectMutation,
} from '@/features/jobs/jobsApi';
import { useGetOrCreateJobConversationMutation } from '@/features/chat/chatApi';
import { cn } from '@/lib/utils';
import { formatDateTimeString } from '@/utils/date';
import { mediaUrl } from '@/utils/media';
import type { JobApplicationDto } from '@/types';
import toast from 'react-hot-toast';

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  PENDING_INACTIVE: { label: 'Not relevant', cls: 'bg-muted text-muted-foreground' },
  SELECTED: { label: 'Selected', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  REJECTED: { label: 'Rejected', cls: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400' },
};

/* ── Avatar helper ──────────────────────────────────────────── */
function MasterAvatar({ master, size = 'md' }: {
  master: JobApplicationDto['master'];
  size?: 'sm' | 'md' | 'lg';
}) {
  const dim = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-16 w-16' : 'h-11 w-11';
  const text = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';
  return (
    <div className={cn('shrink-0 overflow-hidden rounded-full bg-muted', dim)}>
      {master?.user.avatarFile?.path ? (
        <img
          src={mediaUrl(master.user.avatarFile.path)}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <div className={cn('flex h-full w-full items-center justify-center font-bold text-muted-foreground', text)}>
          {master?.user.firstName?.[0] ?? '?'}
        </div>
      )}
    </div>
  );
}

/* ── Slide-over panel ───────────────────────────────────────── */
function ApplicationPanel({
  application,
  jobStatus,
  onClose,
  onView,
  onSelect,
  onReject,
  onOpenChat,
  isSelectLoading,
  isRejectLoading,
}: {
  application: JobApplicationDto;
  jobStatus: string;
  onClose: () => void;
  onView: (id: string) => void;
  onSelect: (id: string) => void;
  onReject: (id: string) => void;
  onOpenChat: () => void;
  isSelectLoading: boolean;
  isRejectLoading: boolean;
}) {
  const { t } = useTranslation();
  const master = application.master;
  const status = STATUS_CFG[application.status] ?? STATUS_CFG.PENDING;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white dark:bg-zinc-950 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', status.cls)}>
              {status.label}
            </span>
            {application.viewedAt && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" /> {t('jobs.viewed', 'Viewed')}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* Master hero section */}
          <div className="border-b border-black/5 dark:border-white/5 px-5 py-5">
            <div className="flex items-start gap-4">
              <MasterAvatar master={master} size="lg" />
              <div className="flex-1 min-w-0">
                {master ? (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-foreground leading-tight">
                        {master.user.firstName} {master.user.lastName}
                      </p>
                      <Link
                        to={`/masters/${master.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                        title="View profile"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    {master.category && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{master.category.name}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2.5">
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-foreground">{master.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-xs">({master.totalReviews})</span>
                      </span>
                      {master.city && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {master.city.name}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('jobs.masterUnavailable', 'Master info unavailable')}</p>
                )}
              </div>
            </div>

            {/* Stat pills */}
            <div className="mt-4 flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-primary/8 px-3 py-2.5 border border-primary/25">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-primary/70">{t('jobs.jointsSpent', 'Joints spent')}</p>
                  <p className="text-sm font-bold text-primary">{application.jointsSpent}</p>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] px-3 py-2.5 border border-black/5 dark:border-white/5">
                <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{t('jobs.payment', 'Payment')}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {application.paymentType === 'FULL' ? t('jobs.fullPayment', 'Full') : t('jobs.partialPayment', 'Milestones')}
                  </p>
                </div>
              </div>
              {application.rank && (
                <div className="flex items-center gap-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] px-3 py-2.5 border border-black/5 dark:border-white/5">
                  <Award className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{t('jobs.rank', 'Rank')}</p>
                    <p className="text-sm font-bold text-foreground">#{application.rank}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cover letter */}
          <div className="px-5 py-5 space-y-5">
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('jobs.coverLetter', 'Cover letter')}
              </p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                {application.description}
              </p>
            </div>

            {/* Photos */}
            {application.photos.length > 0 && (
              <div>
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t('jobs.attachedPhotos', 'Attached photos')}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {application.photos.map((photo) => (
                    <div key={photo.id} className="aspect-square overflow-hidden rounded-xl bg-muted">
                      <img src={mediaUrl(photo.file.path)} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {t('jobs.submitted', 'Submitted')} {formatDateTimeString(application.createdAt)}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        {jobStatus === 'OPEN' && application.status === 'PENDING' && (
          <div className="border-t border-black/5 dark:border-white/5 bg-white dark:bg-zinc-950 px-4 py-4 space-y-2.5">
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={() => onSelect(application.id)}
              disabled={isSelectLoading}
            >
              <CheckCircle2 className="h-4 w-4" />
              {t('jobs.selectMaster', 'Select this master')}
            </Button>
            <div className="flex gap-2">
              {application.viewedAt ? (
                <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t('jobs.viewed', 'Viewed')}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => onView(application.id)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {t('jobs.markViewed', 'Mark viewed')}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                onClick={() => onReject(application.id)}
                disabled={isRejectLoading}
              >
                <XCircle className="h-3.5 w-3.5" />
                {t('jobs.reject', 'Reject')}
              </Button>
            </div>
          </div>
        )}

        {application.status === 'SELECTED' && (
          <div className="border-t border-black/5 dark:border-white/5 bg-white dark:bg-zinc-950 px-4 py-4">
            <Button className="w-full gap-2" variant="outline" onClick={() => onOpenChat()}>
              <MessageCircle className="h-4 w-4" />
              {t('jobs.continueInChat', 'Continue in chat')}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Application list row ───────────────────────────────────── */
function ApplicationRow({
  application,
  jobStatus,
  onClick,
}: {
  application: JobApplicationDto;
  jobStatus: string;
  onClick: () => void;
}) {
  const master = application.master;
  const isInactive = jobStatus === 'FOUND' && application.status === 'PENDING';
  const statusKey = isInactive ? 'PENDING_INACTIVE' : application.status;
  const status = STATUS_CFG[statusKey] ?? STATUS_CFG.PENDING;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full rounded-xl border border-black/5 dark:border-white/5 bg-card p-4 text-left transition-all hover:border-amber-500/30 hover:shadow-sm',
        isInactive && 'opacity-55',
      )}
    >
      <div className="flex items-center gap-3">
        <MasterAvatar master={master} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {master ? `${master.user.firstName ?? ''} ${master.user.lastName ?? ''}`.trim() : '—'}
            </p>
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', status.cls)}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {master && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{master.rating.toFixed(1)}</span>
              </span>
            )}
            <span className="flex items-center gap-1 font-medium text-primary">
              <Zap className="h-3 w-3" />
              {application.jointsSpent} joints
            </span>
            {application.rank && (
              <span className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                #{application.rank}
              </span>
            )}
            {application.viewedAt && (
              <span className="flex items-center gap-1 opacity-60">
                <Eye className="h-3 w-3" /> viewed
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>

      {application.description && (
        <p className="mt-2.5 line-clamp-2 pl-14 text-xs text-muted-foreground leading-relaxed">
          {application.description}
        </p>
      )}
    </button>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function ClientJobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useJobWithApplicationsQuery(
    { id: id! },
    { skip: !id, pollingInterval: 30_000 },
  );

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [viewApplication] = useJobViewApplicationMutation();
  const [selectMaster, { isLoading: isSelectLoading }] = useJobSelectMasterMutation();
  const [rejectApplication, { isLoading: isRejectLoading }] = useJobRejectApplicationMutation();
  const [getOrCreateJobConversation] = useGetOrCreateJobConversationMutation();
  const [requestClose, { isLoading: isRequestCloseLoading }] = useJobRequestCloseMutation();
  const [closeDirect, { isLoading: isDirectCloseLoading }] = useJobCloseDirectMutation();
  const isCloseLoading = isRequestCloseLoading || isDirectCloseLoading;

  const handleRequestClose = async () => {
    if (!id) return;
    const confirmed = window.confirm(t('jobs.closeConfirm', 'Request to close this job? The master will need to confirm.'));
    if (!confirmed) return;
    try {
      await requestClose({ jobId: id }).unwrap();
      toast.success(t('jobs.closeRequested', 'Close request sent to master'));
    } catch {
      toast.error(t('common.error', 'Error sending close request'));
    }
  };

  const handleDirectClose = async () => {
    if (!id) return;
    const confirmed = window.confirm(t('jobs.directCloseConfirm', 'Close this job? It will no longer be visible to masters.'));
    if (!confirmed) return;
    try {
      await closeDirect({ jobId: id }).unwrap();
      toast.success(t('jobs.closedSuccess', 'Job closed'));
    } catch {
      toast.error(t('common.error', 'Error closing job'));
    }
  };

  const openJobChat = async (jobId: string) => {
    try {
      const conv = await getOrCreateJobConversation({ jobId }).unwrap();
      navigate(`/client-dashboard/chat/${conv.id}`);
    } catch {
      toast.error(t('common.error', 'Could not open chat'));
    }
  };

  const handleView = async (applicationId: string) => {
    try { await viewApplication({ applicationId }).unwrap(); } catch { /* silent */ }
  };

  const handleSelect = async (applicationId: string) => {
    if (!id) return;
    const confirmed = window.confirm(t('jobs.selectConfirm', 'Select this master for your job?'));
    if (!confirmed) return;
    try {
      await selectMaster({ jobId: id, applicationId }).unwrap();
      toast.success(t('jobs.masterSelected', 'Master selected! Job marked as Found.'));
      setSelectedAppId(null);
      if (id) void openJobChat(id);
    } catch {
      toast.error(t('common.error', 'Error selecting master'));
    }
  };

  const handleReject = async (applicationId: string) => {
    const confirmed = window.confirm(t('jobs.rejectConfirm', 'Reject this application?'));
    if (!confirmed) return;
    try {
      await rejectApplication({ applicationId }).unwrap();
      toast.success(t('jobs.applicationRejected', 'Application rejected'));
      setSelectedAppId(null);
    } catch {
      toast.error(t('common.error', 'Error'));
    }
  };

  if (isLoading) return <CardsSkeleton count={4} />;
  if (isError) return <ErrorState error={error as Error} onRetry={refetch} />;
  if (!data) return null;

  const { job, applications } = data;
  const selectedApp = selectedAppId ? (applications.find((a) => a.id === selectedAppId) ?? null) : null;

  const jobStatusCls =
    job.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
    : job.status === 'FOUND' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
    : job.status === 'PENDING_CLOSE' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
    : 'bg-muted text-muted-foreground';

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">

      {/* Job header */}
      <div className="mb-6 rounded-2xl border border-black/5 dark:border-white/5 bg-card p-6 shadow-sm">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground leading-snug">{job.title}</h1>
          <div className="flex shrink-0 items-center gap-2">
            <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', jobStatusCls)}>
              {job.status === 'OPEN' ? t('jobs.open', 'Open')
                : job.status === 'FOUND' ? t('jobs.found', 'Found')
                : job.status === 'PENDING_CLOSE' ? t('jobs.pendingCloseStatus', 'Pending close')
                : t('jobs.closed', 'Closed')}
            </span>
            {job.status === 'OPEN' && (
              <button
                onClick={() => void handleDirectClose()}
                disabled={isCloseLoading}
                className="flex items-center gap-1.5 rounded-full border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.03] px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-red-400/40 hover:bg-red-500/5 hover:text-red-500 disabled:opacity-50"
              >
                <ArchiveX className="h-3 w-3" />
                {t('jobs.closeJob', 'Close job')}
              </button>
            )}
            {job.status === 'FOUND' && (
              <button
                onClick={() => void handleRequestClose()}
                disabled={isCloseLoading}
                className="flex items-center gap-1.5 rounded-full border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.03] px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-red-400/40 hover:bg-red-500/5 hover:text-red-500 disabled:opacity-50"
              >
                <ArchiveX className="h-3 w-3" />
                {t('jobs.requestClose', 'Close job')}
              </button>
            )}
            {job.status === 'PENDING_CLOSE' && (
              <span className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                <ArchiveX className="h-3 w-3" />
                {t('jobs.pendingClose', 'Awaiting master confirmation')}
              </span>
            )}
          </div>
        </div>

        <p className="mb-5 text-xs text-muted-foreground">{formatDateTimeString(job.createdAt)}</p>

        <p className="mb-5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {job.type === 'FIXED_PRICE' ? t('jobs.fixedPrice', 'Fixed Price') : t('jobs.hourly', 'Hourly')}
          </span>
          {job.budget != null && (
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground">
              <DollarSign className="h-3.5 w-3.5 text-primary" />{job.budget} MDL
            </span>
          )}
          {job.hourlyRate != null && (
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground">
              <DollarSign className="h-3.5 w-3.5 text-primary" />{job.hourlyRate} MDL/h
            </span>
          )}
          {job.city && (
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />{job.city.name}
            </span>
          )}
          <span className="flex items-center gap-1.5 rounded-full bg-primary/8 border border-primary/15 px-3 py-1.5 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" /> Min {job.minJoints} joints
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />{applications.length} {t('jobs.applications', 'applications')}
          </span>
        </div>

        {job.photos.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {job.photos.map((photo) => (
              <img
                key={photo.id}
                src={mediaUrl(photo.file.path)}
                alt=""
                className="h-24 w-24 shrink-0 rounded-xl object-cover"
              />
            ))}
          </div>
        )}
      </div>

      {/* Master found banner */}
      {job.status === 'FOUND' && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {t('jobs.masterFoundBanner', 'Master selected — job is no longer open')}
            </p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60">
              {t('jobs.otherApplicationsInactive', 'Other applications are no longer active')}
            </p>
          </div>
        </div>
      )}

      {/* Applications section header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          {t('jobs.applications', 'Applications')}
          <span className="ml-2 text-sm font-normal text-muted-foreground">({applications.length})</span>
        </h2>
        {applications.length > 0 && (
          <p className="text-xs text-muted-foreground">{t('jobs.sortedByJoints', 'Sorted by joints ↓')}</p>
        )}
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 py-16 text-center">
          <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">
            {t('jobs.noApplicationsYet', 'No applications yet')}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            {t('jobs.mastersWillApply', 'Masters will apply soon!')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map((app) => (
            <ApplicationRow
              key={app.id}
              application={app}
              jobStatus={job.status}
              onClick={() => setSelectedAppId(app.id)}
            />
          ))}
        </div>
      )}

      {selectedApp && (
        <ApplicationPanel
          application={selectedApp}
          jobStatus={job.status}
          onClose={() => setSelectedAppId(null)}
          onView={(aid) => void handleView(aid)}
          onSelect={(aid) => void handleSelect(aid)}
          onReject={(aid) => void handleReject(aid)}
          onOpenChat={() => id && void openJobChat(id)}
          isSelectLoading={isSelectLoading}
          isRejectLoading={isRejectLoading}
        />
      )}
    </div>
  );
}
