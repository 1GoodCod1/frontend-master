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
  X,
  MessageCircle,
  XCircle,
  MapPin,
  ChevronRight,
  Award,
  ArchiveX,
  ExternalLink,
  ArrowLeft,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JointsBadge } from '@/components/joints';
import { ClientEmptyState } from '@/components/client/ClientEmptyState';
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
import {
  clientBadgeCls,
  clientCardCls,
  clientCardStaticCls,
  clientInsetPanelCls,
  clientLinkCls,
  clientOutlineBtnCls,
  clientPageClassName,
  clientPrimaryBtnCls,
  clientSectionTitleCls,
  clientTextBody,
  clientTextMuted,
  clientTextTitle,
} from '@/lib/clientCabinetStyles';
import { formatDateTimeString } from '@/utils/date';
import { mediaUrl } from '@/utils/media';
import type { JobApplicationDto } from '@/types';
import toast from 'react-hot-toast';

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'Pending', cls: 'bg-[#FFF8EB] text-[#E97525] dark:bg-[#E97525]/12' },
  PENDING_INACTIVE: { label: 'Not relevant', cls: 'bg-[#F1F3F5] text-[#6C757D] dark:bg-white/[0.06] dark:text-white/55' },
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

      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col rounded-l-[18px] border-l border-[#e8e8e8] bg-white shadow-2xl dark:border-[#2d2d2d] dark:bg-zinc-950">

        <div className="flex items-center justify-between border-b border-[#e8e8e8] px-5 py-3.5 dark:border-[#2d2d2d]">
          <div className="flex items-center gap-2">
            <span className={cn(clientBadgeCls, 'normal-case tracking-normal', status.cls)}>
              {status.label}
            </span>
            {application.viewedAt && (
              <span className={cn('flex items-center gap-1', clientTextMuted)}>
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
          <div className="border-b border-[#e8e8e8] px-5 py-5 dark:border-[#2d2d2d]">
            <div className="flex items-start gap-4">
              <MasterAvatar master={master} size="lg" />
              <div className="flex-1 min-w-0">
                {master ? (
                  <>
                    <div className="flex items-center gap-2">
                      <p className={cn('text-base font-semibold leading-tight', clientTextTitle)}>
                        {master.user.firstName} {master.user.lastName}
                      </p>
                      <Link
                        to={`/masters/${master.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn('shrink-0 transition-colors', clientLinkCls)}
                        title="View profile"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    {master.category && (
                      <p className={cn('mt-0.5', clientTextMuted)}>{master.category.name}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2.5">
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-[#E97525] text-[#E97525]" />
                        <span className={cn('font-semibold', clientTextTitle)}>{master.rating.toFixed(1)}</span>
                        <span className={clientTextMuted}>({master.totalReviews})</span>
                      </span>
                      {master.city && (
                        <span className={cn('flex items-center gap-1', clientTextMuted)}>
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
              <div className={cn(clientInsetPanelCls, 'flex flex-1 flex-col items-center justify-center gap-1.5 border-[#E8C878]/40 bg-[#FFFBEB]/50 dark:bg-[#E97525]/8 py-3')}>
                <p className={cn('text-[10px] font-medium uppercase tracking-wide', clientTextMuted)}>{t('jobs.jointsSpent', 'Joints spent')}</p>
                <JointsBadge value={application.jointsSpent} size="sm" />
              </div>
              <div className={cn(clientInsetPanelCls, 'flex flex-1 items-center gap-2')}>
                <DollarSign className="h-4 w-4 shrink-0 text-[#6C757D]" />
                <div>
                  <p className={cn('text-[10px] font-medium uppercase tracking-wide', clientTextMuted)}>{t('jobs.payment', 'Payment')}</p>
                  <p className={cn('text-sm font-semibold', clientTextTitle)}>
                    {application.paymentType === 'FULL' ? t('jobs.fullPayment', 'Full') : t('jobs.partialPayment', 'Milestones')}
                  </p>
                </div>
              </div>
              {application.rank && (
                <div className={cn(clientInsetPanelCls, 'flex items-center gap-2')}>
                  <Award className="h-4 w-4 shrink-0 text-[#6C757D]" />
                  <div>
                    <p className={cn('text-[10px] font-medium uppercase tracking-wide', clientTextMuted)}>{t('jobs.rank', 'Rank')}</p>
                    <p className={cn('text-sm font-bold', clientTextTitle)}>#{application.rank}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cover letter */}
          <div className="px-5 py-5 space-y-5">
            <div>
              <p className={cn('mb-2.5 text-[11px] font-semibold uppercase tracking-wider', clientTextMuted)}>
                {t('jobs.coverLetter', 'Cover letter')}
              </p>
              <p className={cn('whitespace-pre-line break-words leading-relaxed', clientTextBody)}>
                {application.description}
              </p>
            </div>

            {/* Photos */}
            {application.photos.length > 0 && (
              <div>
                <p className={cn('mb-2.5 text-[11px] font-semibold uppercase tracking-wider', clientTextMuted)}>
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

            <p className={clientTextMuted}>
              {t('jobs.submitted', 'Submitted')} {formatDateTimeString(application.createdAt)}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        {jobStatus === 'OPEN' && application.status === 'PENDING' && (
          <div className="space-y-2.5 border-t border-[#e8e8e8] bg-white px-4 py-4 dark:border-[#2d2d2d] dark:bg-zinc-950">
            <Button
              className={cn(clientPrimaryBtnCls, 'h-11 w-full')}
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
                  className={cn(clientOutlineBtnCls, 'h-9 flex-1 gap-1.5')}
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
          <div className="border-t border-[#e8e8e8] bg-white px-4 py-4 dark:border-[#2d2d2d] dark:bg-zinc-950">
            <Button className={cn(clientOutlineBtnCls, 'w-full gap-2')} variant="outline" onClick={() => onOpenChat()}>
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
        clientCardCls,
        'group w-full p-4 text-left hover:translate-y-0',
        isInactive && 'opacity-55',
      )}
    >
      <div className="flex items-center gap-3">
        <MasterAvatar master={master} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className={cn('truncate text-sm font-semibold', clientTextTitle)}>
              {master ? `${master.user.firstName ?? ''} ${master.user.lastName ?? ''}`.trim() : '—'}
            </p>
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide', status.cls)}>
              {status.label}
            </span>
          </div>
          <div className={cn('flex items-center gap-3', clientTextMuted)}>
            {master && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-[#E97525] text-[#E97525]" />
                <span className={cn('font-medium', clientTextTitle)}>{master.rating.toFixed(1)}</span>
              </span>
            )}
            <JointsBadge value={application.jointsSpent} size="xs" />
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

        <ChevronRight className="h-4 w-4 shrink-0 text-[#6C757D] transition-transform group-hover:translate-x-0.5" />
      </div>

      {application.description && (
        <p className={cn('mt-2.5 line-clamp-2 break-words pl-14 leading-relaxed', clientTextMuted)}>
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
    : job.status === 'FOUND' ? 'bg-[#FFF8EB] text-[#E97525] dark:bg-[#E97525]/12'
    : job.status === 'PENDING_CLOSE' ? 'bg-[#FFF8EB] text-[#c45f1a] dark:bg-[#E97525]/12'
    : 'bg-[#F1F3F5] text-[#6C757D] dark:bg-white/[0.06] dark:text-white/55';

  return (
    <div className={clientPageClassName}>
      <Link
        to="/client-dashboard/jobs"
        className={cn('mb-2 inline-flex items-center gap-1.5 text-[13px] font-medium', clientLinkCls)}
      >
        <ArrowLeft className="h-4 w-4" />
        {t('jobs.myJobs', 'My Job Postings')}
      </Link>

      <div className={cn(clientCardStaticCls, 'p-6')}>
        <div className="mb-1 flex items-start justify-between gap-3">
          <h1 className={cn('min-w-0 break-words text-xl font-bold leading-snug', clientTextTitle)}>{job.title}</h1>
          <div className="flex shrink-0 items-center gap-2">
            <span className={cn(clientBadgeCls, 'normal-case tracking-normal px-3 py-1', jobStatusCls)}>
              {job.status === 'OPEN' ? t('jobs.open', 'Open')
                : job.status === 'FOUND' ? t('jobs.found', 'Found')
                : job.status === 'PENDING_CLOSE' ? t('jobs.pendingCloseStatus', 'Pending close')
                : t('jobs.closed', 'Closed')}
            </span>
            {job.status === 'OPEN' && (
              <button
                onClick={() => void handleDirectClose()}
                disabled={isCloseLoading}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border border-[#E9ECEF] px-3 py-1 text-[12px] font-medium transition',
                  'text-[#6C757D] hover:border-red-400/40 hover:bg-red-500/5 hover:text-red-500 disabled:opacity-50',
                  'dark:border-white/12',
                )}
              >
                <ArchiveX className="h-3 w-3" />
                {t('jobs.closeJob', 'Close job')}
              </button>
            )}
            {job.status === 'FOUND' && (
              <button
                onClick={() => void handleRequestClose()}
                disabled={isCloseLoading}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border border-[#E9ECEF] px-3 py-1 text-[12px] font-medium transition',
                  'text-[#6C757D] hover:border-red-400/40 hover:bg-red-500/5 hover:text-red-500 disabled:opacity-50',
                  'dark:border-white/12',
                )}
              >
                <ArchiveX className="h-3 w-3" />
                {t('jobs.requestClose', 'Close job')}
              </button>
            )}
            {job.status === 'PENDING_CLOSE' && (
              <span className={cn(clientBadgeCls, 'normal-case tracking-normal gap-1.5 px-3 py-1 text-[#E97525]')}>
                <ArchiveX className="h-3 w-3" />
                {t('jobs.pendingClose', 'Awaiting master confirmation')}
              </span>
            )}
          </div>
        </div>

        <p className={cn('mb-5', clientTextMuted)}>{formatDateTimeString(job.createdAt)}</p>

        <p className={cn('mb-5 whitespace-pre-wrap break-words leading-relaxed', clientTextBody)}>
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2">
          <span className={cn(clientBadgeCls, 'gap-1.5 normal-case tracking-normal px-3 py-1.5')}>
            <Clock className="h-3.5 w-3.5" />
            {job.type === 'FIXED_PRICE' ? t('jobs.fixedPrice', 'Fixed Price') : t('jobs.hourly', 'Hourly')}
          </span>
          {job.budget != null && (
            <span className={cn(clientBadgeCls, 'gap-1.5 normal-case tracking-normal px-3 py-1.5 font-semibold text-[#212529] dark:text-white')}>
              <DollarSign className="h-3.5 w-3.5 text-[#E97525]" />{job.budget} MDL
            </span>
          )}
          {job.hourlyRate != null && (
            <span className={cn(clientBadgeCls, 'gap-1.5 normal-case tracking-normal px-3 py-1.5 font-semibold text-[#212529] dark:text-white')}>
              <DollarSign className="h-3.5 w-3.5 text-[#E97525]" />{job.hourlyRate} MDL/h
            </span>
          )}
          {job.city && (
            <span className={cn(clientBadgeCls, 'gap-1.5 normal-case tracking-normal px-3 py-1.5')}>
              <MapPin className="h-3.5 w-3.5" />{job.city.name}
            </span>
          )}
          <JointsBadge value={job.minJoints} size="sm" prefix="Min" className="normal-case tracking-normal" />
          <span className={cn(clientBadgeCls, 'gap-1.5 normal-case tracking-normal px-3 py-1.5')}>
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
        <div className={cn(clientInsetPanelCls, 'mb-4 flex items-center gap-3 border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-500/25 dark:bg-emerald-500/10')}>
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

      <div className="mb-3 flex items-center justify-between">
        <h2 className={clientSectionTitleCls}>
          {t('jobs.applications', 'Applications')}
          <span className={cn('ml-2 text-sm font-normal', clientTextMuted)}>({applications.length})</span>
        </h2>
        {applications.length > 0 && (
          <p className={clientTextMuted}>{t('jobs.sortedByJoints', 'Sorted by joints ↓')}</p>
        )}
      </div>

      {applications.length === 0 ? (
        <ClientEmptyState
          icon={Briefcase}
          title={t('jobs.noApplicationsYet', 'No applications yet')}
          description={t('jobs.mastersWillApply', 'Masters will apply soon!')}
        />
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
