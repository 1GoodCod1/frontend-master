import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Eye, ArrowLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useJobWithdrawApplicationMutation, useJobConfirmCloseMutation, useJobRejectCloseMutation, useJobUpdateApplicationMutation, useJobLeaderboardQuery } from '@/features/jobs/jobsApi';
import { useGetOrCreateJobConversationMutation } from '@/features/chat/chatApi';
import { cn } from '@/lib/utils';
import { formatDateTimeString } from '@/utils/date';
import { mediaUrl } from '@/utils/media';
import type { JobApplicationDto, MilestoneDto } from '@/types';
import toast from 'react-hot-toast';
import { APP_STATUS_CFG } from '@/constants/jobs';

import { ProposalInsights } from './ProposalDetail/ProposalInsights';
import { ProposalTermsView } from './ProposalDetail/ProposalTermsView';
import { ProposalSidebar } from './ProposalDetail/ProposalSidebar';
import { ProposalJobDetails } from './ProposalDetail/ProposalJobDetails';
import { ProposalEditForm } from './ProposalDetail/ProposalEditForm';

interface ProposalDetailProps {
  application: JobApplicationDto;
  onBack: () => void;
  onWithdrawn: () => void;
  onUpdated: (updated: JobApplicationDto) => void;
}

export function ProposalDetail({ application, onBack, onWithdrawn, onUpdated }: ProposalDetailProps) {
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
    category?: { name: string } | null;
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

          <ProposalInsights application={application} />

          {job && <ProposalJobDetails job={job} />}

          <ProposalTermsView application={application} />

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
            <ProposalEditForm
              application={application}
              editDeadline={editDeadline}
              setEditDeadline={setEditDeadline}
              editMilestones={editMilestones}
              updateMilestone={updateMilestone}
              addMilestone={addMilestone}
              removeMilestone={removeMilestone}
              boostJoints={boostJoints}
              setBoostJoints={setBoostJoints}
              leaderboard={leaderboard}
              handleSave={handleSave}
              setEditing={setEditing}
              isSaving={isSaving}
            />
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
        <ProposalSidebar
          application={application}
          job={job}
          canEdit={canEdit}
          canWithdraw={canWithdraw}
          isWithdrawing={isWithdrawing}
          isOpeningChat={isOpeningChat}
          isConfirming={isConfirming}
          isRejecting={isRejecting}
          setEditing={setEditing}
          handleWithdraw={handleWithdraw}
          handleOpenChat={handleOpenChat}
          handleConfirmClose={handleConfirmClose}
          handleRejectClose={handleRejectClose}
        />
      </div>
    </div>
  );
}
