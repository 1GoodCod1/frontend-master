import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, MessageCircle, CheckCircle2, ArchiveX, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateTimeString } from '@/utils/date';
import { MapPin, Clock, User } from 'lucide-react';
import type { JobApplicationDto } from '@/types';

interface ProposalSidebarProps {
  application: JobApplicationDto;
  job: {
    id: string; title: string; status: string; type: string;
    budget?: number | null; hourlyRate?: number | null;
    city?: { name: string } | null;
    client?: { firstName?: string | null; lastName?: string | null } | null;
    minJoints?: number;
  } | undefined;
  canEdit: boolean;
  canWithdraw: boolean;
  isWithdrawing: boolean;
  isOpeningChat: boolean;
  isConfirming: boolean;
  isRejecting: boolean;
  setEditing: (editing: boolean) => void;
  handleWithdraw: () => void;
  handleOpenChat: () => void;
  handleConfirmClose: () => void;
  handleRejectClose: () => void;
}

export function ProposalSidebar({
  application,
  job,
  canEdit,
  canWithdraw,
  isWithdrawing,
  isOpeningChat,
  isConfirming,
  isRejecting,
  setEditing,
  handleWithdraw,
  handleOpenChat,
  handleConfirmClose,
  handleRejectClose,
}: ProposalSidebarProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* Actions */}
      <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-4 space-y-2">
        {canEdit && (
          <Button className="w-full gap-2" onClick={() => setEditing(true)}>
            <Edit2 className="h-4 w-4" />
            {t('jobs.editProposal', 'Edit proposal')}
          </Button>
        )}
        {canWithdraw && (
          <Button
            variant="outline"
            className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
            onClick={handleWithdraw}
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
            onClick={handleOpenChat}
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
              onClick={handleConfirmClose}
              disabled={isConfirming || isRejecting}
            >
              <CheckCircle2 className="h-4 w-4" />
              {t('jobs.confirmClose', 'Confirm & close')}
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
              onClick={handleRejectClose}
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
  );
}
