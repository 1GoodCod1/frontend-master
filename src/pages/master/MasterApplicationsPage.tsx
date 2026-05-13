import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Zap, CheckCircle2, Clock, Eye, XCircle, AlertTriangle,
  History, ChevronRight, ArrowLeft, DollarSign, MapPin,
  Edit2, Trash2, User, MessageCircle, ArchiveX, Save, X, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { ErrorState } from '@/components/common/States';
import { useMasterMyApplicationsQuery, useJobWithdrawApplicationMutation, useJobConfirmCloseMutation, useJobRejectCloseMutation, useJobUpdateApplicationMutation, useJobLeaderboardQuery } from '@/features/jobs/jobsApi';
import { useGetOrCreateJobConversationMutation } from '@/features/chat/chatApi';
import { useJointsBalanceQuery, useJointsTransactionsQuery } from '@/features/joints/jointsApi';
import { cn } from '@/lib/utils';
import { formatDateTimeString } from '@/utils/date';
import { mediaUrl } from '@/utils/media';
import type { JobApplicationDto, MilestoneDto } from '@/types';
import toast from 'react-hot-toast';

const APP_STATUS_CFG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  PENDING:  { label: 'Pending',      cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',   icon: Clock },
  SELECTED: { label: 'Selected',     cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', icon: CheckCircle2 },
  REJECTED: { label: 'Not selected', cls: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400',           icon: XCircle },
};

const TX_LABEL: Record<string, string> = {
  SUBSCRIPTION_CREDIT: 'Subscription credit',
  PURCHASE: 'Purchase',
  APPLICATION_SPEND: 'Spent on application',
  REFUND: 'Refund',
};

/* ── Proposal detail panel ──────────────────────────────────── */
function ProposalDetail({
  application,
  onBack,
  onWithdrawn,
  onUpdated,
}: {
  application: JobApplicationDto;
  onBack: () => void;
  onWithdrawn: () => void;
  onUpdated: (updated: JobApplicationDto) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [withdraw, { isLoading: isWithdrawing }] = useJobWithdrawApplicationMutation();
  const [confirmClose, { isLoading: isConfirming }] = useJobConfirmCloseMutation();
  const [rejectClose, { isLoading: isRejecting }] = useJobRejectCloseMutation();
  const [updateApp, { isLoading: isSaving }] = useJobUpdateApplicationMutation();
  const [getOrCreateJobConversation, { isLoading: isOpeningChat }] = useGetOrCreateJobConversationMutation();
  const [editing, setEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(application.description);
  const [editDeadline, setEditDeadline] = useState(String(application.deadline ?? ''));
  const [editMilestones, setEditMilestones] = useState<MilestoneDto[]>(
    (application.milestones as MilestoneDto[] | null) ?? [],
  );
  const [boostJoints, setBoostJoints] = useState(String(application.jointsSpent));

  const { data: leaderboard } = useJobLeaderboardQuery(
    { id: application.jobId! },
    { skip: !editing || !application.jobId },
  );

  const updateMilestone = (i: number, patch: Partial<MilestoneDto>) =>
    setEditMilestones((prev) => prev.map((m, idx) => idx === i ? { ...m, ...patch } : m));
  const addMilestone = () =>
    setEditMilestones((prev) => [...prev, { title: '', price: 0, dueDate: '' }]);
  const removeMilestone = (i: number) =>
    setEditMilestones((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    const newJoints = Number(boostJoints);
    try {
      const updated = await updateApp({
        applicationId: application.id,
        body: {
          description: editDesc,
          deadline: application.paymentType === 'FULL' && editDeadline ? Number(editDeadline) : undefined,
          milestones: application.paymentType === 'PARTIAL' ? editMilestones : undefined,
          jointsSpent: newJoints > application.jointsSpent ? newJoints : undefined,
        },
      }).unwrap();
      toast.success(t('jobs.proposalUpdated', 'Proposal updated!'));
      onUpdated(updated);
      setEditing(false);
    } catch {
      toast.error(t('common.error', 'Failed to save'));
    }
  };

  const handleOpenChat = async () => {
    if (!application.jobId) return;
    try {
      const conv = await getOrCreateJobConversation({ jobId: application.jobId }).unwrap();
      navigate(`/dashboard/chat/${conv.id}`);
    } catch {
      toast.error(t('common.error', 'Could not open chat'));
    }
  };

  const job = application.job as {
    id: string; title: string; status: string; type: string;
    budget?: number | null; hourlyRate?: number | null;
    city?: { name: string } | null;
    client?: { firstName?: string | null; lastName?: string | null } | null;
    minJoints?: number;
  } | undefined;

  const canWithdraw = application.status === 'PENDING' && !application.viewedAt;
  const canEdit = application.status === 'PENDING' && !application.viewedAt;
  const cfg = APP_STATUS_CFG[application.status] ?? APP_STATUS_CFG.PENDING;
  const StatusIcon = cfg.icon;

  const handleConfirmClose = async () => {
    if (!application.jobId) return;
    try {
      await confirmClose({ jobId: application.jobId }).unwrap();
      toast.success(t('jobs.jobClosed', 'Job closed successfully'));
      onBack();
    } catch {
      toast.error(t('common.error', 'Error'));
    }
  };

  const handleRejectClose = async () => {
    if (!application.jobId) return;
    try {
      await rejectClose({ jobId: application.jobId }).unwrap();
      toast.success(t('jobs.closeRejected', 'Close request rejected — job is active again'));
    } catch {
      toast.error(t('common.error', 'Error'));
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm(t('jobs.withdrawConfirm', 'Withdraw this application? Your joints will be refunded.'))) return;
    try {
      await withdraw({ applicationId: application.id }).unwrap();
      toast.success(t('jobs.withdrawn', 'Application withdrawn. Joints refunded!'));
      onWithdrawn();
    } catch {
      toast.error(t('common.error', 'Failed to withdraw'));
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
      {/* Back */}
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('jobs.myApplications', 'My Applications')}
      </button>

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        {/* Left column */}
        <div className="space-y-4">

          {/* Status banner */}
          <div className={cn('flex items-center gap-3 rounded-2xl border px-4 py-3', cfg.cls)}>
            <StatusIcon className="h-4 w-4 shrink-0" />
            <span className="text-sm font-semibold">{cfg.label}</span>
            {application.viewedAt && (
              <span className="ml-auto flex items-center gap-1 text-xs opacity-70">
                <Eye className="h-3 w-3" />
                {t('jobs.clientViewed', 'Viewed by client')} · {formatDateTimeString(application.viewedAt)}
              </span>
            )}
          </div>

          {/* Insights */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">
              {t('jobs.proposalInsights', 'Proposal insights')}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white dark:bg-zinc-800 px-4 py-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-primary">{application.jointsSpent}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t('jobs.jointsSpent', 'Joints spent')}</p>
              </div>
              <div className="rounded-xl bg-white dark:bg-zinc-800 px-4 py-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-foreground">#{application.rank}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t('jobs.rank', 'Rank')}</p>
              </div>
              <div className="rounded-xl bg-white dark:bg-zinc-800 px-4 py-3 text-center shadow-sm">
                <p className="text-lg font-bold text-foreground">
                  {application.viewedAt
                    ? <Eye className="h-5 w-5 text-blue-500 mx-auto" />
                    : <span className="text-muted-foreground">—</span>}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {application.viewedAt ? t('jobs.viewed', 'Viewed') : t('jobs.notViewed', 'Not viewed')}
                </p>
              </div>
            </div>
          </div>

          {/* Job details */}
          {job && (
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('jobs.jobDetails', 'Job details')}
              </p>
              <p className="mb-3 text-base font-bold text-foreground">
                {job.title}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="flex items-center gap-1 rounded-full bg-white dark:bg-zinc-800 px-3 py-1.5 text-muted-foreground shadow-sm">
                  <Clock className="h-3.5 w-3.5" />
                  {job.type === 'FIXED_PRICE' ? t('jobs.fixedPrice', 'Fixed Price') : t('jobs.hourly', 'Hourly')}
                </span>
                {job.budget != null && (
                  <span className="flex items-center gap-1 rounded-full bg-white dark:bg-zinc-800 px-3 py-1.5 font-semibold text-foreground shadow-sm">
                    <DollarSign className="h-3.5 w-3.5 text-primary" />{job.budget} MDL
                  </span>
                )}
                {job.hourlyRate != null && (
                  <span className="flex items-center gap-1 rounded-full bg-white dark:bg-zinc-800 px-3 py-1.5 font-semibold text-foreground shadow-sm">
                    <DollarSign className="h-3.5 w-3.5 text-primary" />{job.hourlyRate} MDL/h
                  </span>
                )}
                {job.city && (
                  <span className="flex items-center gap-1 rounded-full bg-white dark:bg-zinc-800 px-3 py-1.5 text-muted-foreground shadow-sm">
                    <MapPin className="h-3.5 w-3.5" />{job.city.name}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Your proposed terms */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('jobs.yourTerms', 'Your proposed terms')}
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white dark:bg-zinc-800 px-4 py-3 shadow-sm">
                <span className="text-sm text-muted-foreground">{t('jobs.paymentApproach', 'Payment approach')}</span>
                <span className="text-sm font-semibold text-foreground">
                  {application.paymentType === 'FULL' ? t('jobs.fullPayment', 'Full Payment') : t('jobs.partialPayment', 'Milestones')}
                </span>
              </div>
              {application.paymentType === 'FULL' && application.deadline && (
                <div className="flex items-center justify-between rounded-xl bg-white dark:bg-zinc-800 px-4 py-3 shadow-sm">
                  <span className="text-sm text-muted-foreground">{t('jobs.deadlineDays', 'Completion time')}</span>
                  <span className="text-sm font-semibold text-foreground">
                    {application.deadline} {t('jobs.days', 'days')}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between rounded-xl bg-white dark:bg-zinc-800 px-4 py-3 shadow-sm">
                <span className="text-sm text-muted-foreground">{t('jobs.jointsSpent', 'Joints bid')}</span>
                <span className="flex items-center gap-1 text-sm font-bold text-primary">
                  <Zap className="h-3.5 w-3.5" />{application.jointsSpent}
                </span>
              </div>
            </div>

            {/* Milestones */}
            {application.paymentType === 'PARTIAL' && application.milestones && application.milestones.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">{t('jobs.milestones', 'Milestones')}</p>
                <div className="space-y-2">
                  {application.milestones.map((m, i) => (
                    <div key={i} className="rounded-xl bg-white dark:bg-zinc-800 px-4 py-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{i + 1}. {m.title}</p>
                          {m.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{m.description}</p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-foreground">{m.price} MDL</p>
                          <p className="text-xs text-muted-foreground">{new Date(m.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end rounded-xl bg-primary/5 px-4 py-2">
                    <span className="text-xs text-muted-foreground mr-2">{t('jobs.milestonesTotal', 'Total')}:</span>
                    <span className="text-sm font-bold text-primary">
                      {application.milestones.reduce((s, m) => s + m.price, 0)} MDL
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cover letter */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('jobs.coverLetter', 'Cover letter')}
            </p>
            {editing ? (
              <Textarea
                rows={6}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="resize-none bg-white dark:bg-zinc-800"
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                {application.description}
              </p>
            )}
          </div>

          {/* Edit milestones / deadline */}
          {editing && (
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {application.paymentType === 'FULL'
                  ? t('jobs.deadlineDays', 'Completion time (days)')
                  : t('jobs.milestones', 'Milestones')}
              </p>

              {application.paymentType === 'FULL' && (
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-32 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}

              {application.paymentType === 'PARTIAL' && (
                <>
                  {editMilestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2">
                      <span className="shrink-0 w-4 text-center text-[11px] font-semibold text-muted-foreground">{i + 1}</span>
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => updateMilestone(i, { title: e.target.value })}
                        placeholder={t('jobs.milestoneTitle', 'Task title')}
                        className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
                      />
                      <input
                        type="number"
                        min={1}
                        value={m.price || ''}
                        onChange={(e) => updateMilestone(i, { price: Number(e.target.value) })}
                        placeholder="MDL"
                        className="w-20 shrink-0 bg-transparent text-sm text-right focus:outline-none"
                      />
                      <input
                        type="date"
                        value={m.dueDate}
                        onChange={(e) => updateMilestone(i, { dueDate: e.target.value })}
                        className="w-32 shrink-0 bg-transparent text-sm focus:outline-none"
                      />
                      {editMilestones.length > 1 && (
                        <button type="button" onClick={() => removeMilestone(i)} className="shrink-0 text-red-400 hover:text-red-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 py-2.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t('jobs.addMilestone', 'Add milestone')}
                  </button>
                </>
              )}

              {/* Boost section */}
              <div className="rounded-xl border border-amber-300/40 bg-amber-500/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <p className="text-sm font-semibold text-foreground">{t('jobs.boostProposal', 'Boost proposal')}</p>
                </div>

                {/* Leaderboard */}
                {leaderboard && leaderboard.leaderboard.length > 0 && (
                  <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-zinc-100 dark:bg-zinc-800">
                          <th className="px-3 py-2 text-left font-semibold text-muted-foreground">#</th>
                          <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{t('jobs.applicant', 'Applicant')}</th>
                          <th className="px-3 py-2 text-right font-semibold text-muted-foreground">{t('jobs.joints', 'Joints')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.leaderboard.map((entry, i) => {
                          const isMe = entry.jointsSpent === application.jointsSpent && entry.rank === application.rank;
                          return (
                            <tr
                              key={i}
                              className={cn(
                                'border-t border-zinc-200 dark:border-zinc-700',
                                isMe ? 'bg-amber-50 dark:bg-amber-500/10 font-semibold' : 'bg-white dark:bg-zinc-900',
                              )}
                            >
                              <td className="px-3 py-2 text-muted-foreground">#{entry.rank}</td>
                              <td className="px-3 py-2 text-foreground">
                                {isMe ? `${t('jobs.you', 'You')} ★` : t('jobs.anonymous', 'Anonymous master')}
                              </td>
                              <td className="px-3 py-2 text-right">
                                <span className="flex items-center justify-end gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                                  <Zap className="h-3 w-3" />
                                  {entry.jointsSpent}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Boost input */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBoostJoints((v) => String(Math.max(application.jointsSpent, Number(v) - 1)))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-lg font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                  >−</button>
                  <input
                    type="number"
                    min={application.jointsSpent}
                    value={boostJoints}
                    onChange={(e) => setBoostJoints(e.target.value)}
                    className="w-20 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setBoostJoints((v) => String(Number(v) + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-lg font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                  >+</button>
                  <span className="text-xs text-muted-foreground">
                    {Number(boostJoints) > application.jointsSpent
                      ? <span className="text-amber-600 dark:text-amber-400">+{Number(boostJoints) - application.jointsSpent} {t('joints.joints', 'joints')}</span>
                      : t('jobs.currentBid', 'current bid')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button size="sm" className="gap-1.5" onClick={() => void handleSave()} disabled={isSaving}>
                  <Save className="h-3.5 w-3.5" />
                  {t('common.save', 'Save')}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
              </div>
            </div>
          )}

          {/* Photos */}
          {application.photos?.length > 0 && (
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('jobs.attachedPhotos', 'Photos')}
              </p>
              <div className="flex flex-wrap gap-2">
                {application.photos.map((p) => (
                  <img key={p.id} src={mediaUrl(p.file.path)} alt="" className="h-20 w-20 rounded-xl object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-3">
          {/* Actions */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-4 space-y-2">
            {canEdit && (
              <Button
                className="w-full gap-2"
                onClick={() => setEditing(true)}
              >
                <Edit2 className="h-4 w-4" />
                {t('jobs.editProposal', 'Edit proposal')}
              </Button>
            )}
            {canWithdraw && (
              <Button
                variant="outline"
                className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                onClick={() => void handleWithdraw()}
                disabled={isWithdrawing}
              >
                <Trash2 className="h-4 w-4" />
                {t('jobs.withdraw', 'Withdraw')}
              </Button>
            )}
            {!canEdit && !canWithdraw && application.status === 'PENDING' && (
              <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                {t('jobs.cannotEditViewed', 'Cannot edit — client already viewed your proposal')}
              </div>
            )}
            {application.status === 'SELECTED' && job?.status !== 'CLOSED' && (
              <Button
                className="w-full gap-2"
                onClick={() => void handleOpenChat()}
                disabled={isOpeningChat}
              >
                <MessageCircle className="h-4 w-4" />
                {t('jobs.openChat', 'Open chat with client')}
              </Button>
            )}
            {application.status === 'SELECTED' && job?.status === 'CLOSED' && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  {t('jobs.jobCompletedClosed', 'Job completed & closed')}
                </p>
              </div>
            )}
            {application.status === 'SELECTED' && job?.status === 'PENDING_CLOSE' && (
              <div className="rounded-xl border border-amber-400/40 bg-amber-500/8 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <ArchiveX className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                      {t('jobs.clientWantsToClose', 'Client wants to close this job')}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t('jobs.closeRequestDesc', 'Confirm if work is done, or reject to keep the job active.')}
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => void handleConfirmClose()}
                  disabled={isConfirming || isRejecting}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t('jobs.confirmClose', 'Confirm & close')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                  onClick={() => void handleRejectClose()}
                  disabled={isConfirming || isRejecting}
                >
                  <XCircle className="h-4 w-4" />
                  {t('jobs.rejectClose', 'Reject — keep active')}
                </Button>
              </div>
            )}
          </div>

          {/* About client */}
          {job && (
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('jobs.aboutClient', 'About the client')}
              </p>
              <div className="space-y-2 text-sm">
                {job.client && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-foreground">
                      {[job.client.firstName, job.client.lastName].filter(Boolean).join(' ') || '—'}
                    </span>
                  </div>
                )}
                {job.city && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.city.name}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {t('jobs.postedOn', 'Submitted')} {formatDateTimeString(application.createdAt)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function MasterApplicationsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<'applications' | 'history'>('applications');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const setSelected = (app: JobApplicationDto | null) => setSelectedId(app?.id ?? null);

  const { data, isLoading, isError, error, refetch } = useMasterMyApplicationsQuery(
    undefined, { pollingInterval: 30_000 }
  );
  const { data: balanceData } = useJointsBalanceQuery(undefined, { pollingInterval: 30_000 });
  const { data: txData, isLoading: txLoading } = useJointsTransactionsQuery();

  const selectApplication = (app: JobApplicationDto | null) => {
    setSelected(app);
    if (app) {
      setSearchParams({ id: app.id }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  if (isLoading) return <CardsSkeleton count={4} />;
  if (isError) return <ErrorState error={error as Error} onRetry={refetch} />;

  const items = data?.items ?? [];
  const transactions = txData?.items ?? [];

  // Always read from live data so job status updates are reflected immediately
  const urlId = searchParams.get('id');
  const activeId = selectedId ?? urlId;
  const resolvedSelected = activeId ? (items.find((a) => a.id === activeId) ?? null) : null;

  if (resolvedSelected) {
    return (
      <ProposalDetail
        application={resolvedSelected}
        onBack={() => selectApplication(null)}
        onWithdrawn={() => selectApplication(null)}
        onUpdated={(updated) => { setSelectedId(updated.id); setSearchParams({ id: updated.id }, { replace: true }); }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('jobs.jobsAndJoints', 'Jobs & Joints')}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('jobs.jobsAndJointsSubtitle', 'Your proposals and joints history')}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl bg-primary/8 px-4 py-2.5 text-sm font-bold text-primary">
          <Zap className="h-4 w-4" />
          {balanceData?.balance ?? 0}
          <span className="text-xs font-normal text-primary/70">joints</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-muted p-1">
        {(['applications', 'history'] as const).map((t_) => (
          <button
            key={t_}
            onClick={() => setTab(t_)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors',
              tab === t_
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t_ === 'applications' ? (
              <>
                {t('jobs.myApplications', 'My Applications')}
                {items.length > 0 && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                    {items.length}
                  </span>
                )}
              </>
            ) : (
              <>
                <History className="h-3.5 w-3.5" />
                {t('joints.history', 'Joints History')}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Applications */}
      {tab === 'applications' && (
        items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <Zap className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="mb-2 text-base font-semibold text-foreground">
              {t('jobs.noApplicationsYet', 'No proposals yet')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('jobs.browseAndApply', 'Apply to jobs from the public job board to see your proposals here')}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Group header */}
            <p className="mb-3 text-sm font-semibold text-foreground">
              {t('jobs.submittedProposals', 'Submitted proposals')}
              <span className="ml-2 text-sm font-normal text-muted-foreground">({items.length})</span>
            </p>
            {items.map((app) => {
              const job = app.job as { id: string; title: string; status: string } | undefined;
              const cfg = APP_STATUS_CFG[app.status] ?? APP_STATUS_CFG.PENDING;
              const StatusIcon = cfg.icon;
              const jobInactive = job?.status === 'CLOSED' || job?.status === 'FOUND';

              return (
                <button
                  key={app.id}
                  onClick={() => selectApplication(app)}
                  className="group w-full rounded-xl px-4 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {job?.title ?? '—'}
                        </p>
                        {jobInactive && app.status === 'PENDING' && (
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDateTimeString(app.createdAt)}</span>
                        {app.viewedAt && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {t('jobs.viewed', 'Viewed')}
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <Zap className="h-3 w-3" />{app.jointsSpent}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={cn('flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', cfg.cls)}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )
      )}

      {/* History */}
      {tab === 'history' && (
        txLoading ? (
          <CardsSkeleton count={5} />
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-14 text-center">
            <History className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t('joints.noHistory', 'No transactions yet')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  tx.amount > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15' : 'bg-red-50 text-red-500 dark:bg-red-500/15',
                )}>
                  <Zap className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{TX_LABEL[tx.type] ?? tx.type}</p>
                  {tx.description && (
                    <p className="truncate text-xs text-muted-foreground">{tx.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={cn('text-sm font-bold', tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400')}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTimeString(tx.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
