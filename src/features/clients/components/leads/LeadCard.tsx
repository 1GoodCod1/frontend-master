import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Mail, Clock, AtSign, CalendarDays, Hourglass, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateShort, formatTimeOnly, getLocaleFromLanguage } from '@/utils/date';
import type { LeadCardProps } from '@/types/leads';
import { RequestStatusBadge } from '@/features/requests/components/RequestStatusBadge';
import LeaveReviewButton from './LeaveReviewButton';
import { RequestStatusProgress } from '@/features/requests/components/RequestStatusProgress';
import { mediaUrl } from '@/utils/media';
import { ImageLightboxModal } from '@/components/common/ImageLightboxModal';
import { useLeadsUpdateStatusMutation } from '@/features/leads/leadsApi';
import { cn } from '@/lib/utils';
import {
  clientBadgeCls,
  clientCardCls,
  clientIconWrapCls,
  clientInsetPanelCls,
  clientLinkCls,
  clientPrimaryBtnCls,
  clientTextBody,
  clientTextMuted,
  clientTextTitle,
} from '@/lib/clientCabinetStyles';

const ClientRequestCard = React.memo(function ClientRequestCard({
  lead,
  onOpenReviewModal,
  reviewsSubmittedMasterIds,
  pendingBooking,
}: LeadCardProps) {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const [updateStatus, { isLoading: isConfirming }] = useLeadsUpdateStatusMutation();

  const createdAt = lead.createdAt ? new Date(lead.createdAt) : null;
  const status = String((lead.status ?? 'NEW')).toUpperCase();
  const masterSlugOrId =
    lead.master?.slug ||
    (lead.master as { encodedId?: string })?.encodedId ||
    (lead.master?.id ? String(lead.master.id) : '') ||
    (lead.masterId ? String(lead.masterId) : '');

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const imageUrls = React.useMemo(() => {
    if (!lead.files) return [];
    return lead.files
      .map((fileItem) => {
        const file = (fileItem as { file?: { path?: string | null } }).file || fileItem;
        return file.path ? mediaUrl(file.path) : null;
      })
      .filter(Boolean) as string[];
  }, [lead.files]);

  return (
    <div className={cn(clientCardCls, 'flex min-w-0 w-full flex-col overflow-hidden')}>
      <div className="relative flex min-w-0 flex-col gap-6 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className={clientIconWrapCls}>
                <Mail className="size-4" />
              </span>
              <span className={cn('text-base font-semibold', clientTextTitle)}>
                {lead.master?.user?.firstName} {lead.master?.user?.lastName}
              </span>
              <RequestStatusBadge status={status} />
            </div>

            <p className={cn('mt-1 min-w-0 max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere]', clientTextBody)}>
              {lead.message ?? '—'}
            </p>
          </div>
        </div>

        {imageUrls.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className={cn('text-[11px] font-semibold uppercase tracking-wider', clientTextMuted)}>
              {t('leads.attachedPhotos', 'Отправленные фото')}
            </p>
            <div className="flex flex-wrap gap-3">
              {imageUrls.map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setLightboxIndex(idx);
                    setLightboxOpen(true);
                  }}
                  className="relative block size-20 shrink-0 overflow-hidden rounded-xl border border-[#e8e8e8] bg-muted transition hover:scale-105 dark:border-[#2d2d2d]"
                  aria-label={`View photo ${idx + 1}`}
                >
                  <img src={src} alt="Attachment" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={clientInsetPanelCls}>
          <RequestStatusProgress status={status} compact />
        </div>

        {pendingBooking && (
          <div className={cn(clientInsetPanelCls, 'border-[#E97525]/30 bg-[#FFF8EB]/60 dark:bg-[#E97525]/8')}>
            <div className="mb-2 flex items-center gap-2">
              <CalendarDays className="size-5 text-[#E97525]" />
              <span className={cn('font-semibold', clientTextTitle)}>
                {t('bookings.proposedTime', 'Proposed appointment')}
              </span>
            </div>
            <p className={cn('mb-3', clientTextBody)}>
              {formatDateShort(new Date(pendingBooking.startTime), locale)}{' '}
              {formatTimeOnly(new Date(pendingBooking.startTime), locale)}
              {' — '}
              {formatTimeOnly(new Date(pendingBooking.endTime), locale)}
              {pendingBooking.notes && (
                <span className={cn('ml-2', clientTextMuted)}>· {pendingBooking.notes}</span>
              )}
            </p>
            <Badge variant="outline" className={clientBadgeCls}>
              <Hourglass className="mr-1 size-3" />
              {t('bookings.status.PENDING')}
            </Badge>
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className={cn('flex items-center gap-2 font-medium', clientTextMuted)}>
            <Clock className="size-4 shrink-0" />
            {createdAt ? (
              <>
                {formatDateShort(createdAt, locale)} {formatTimeOnly(createdAt, locale)}
              </>
            ) : (
              '—'
            )}
          </div>

          {lead.master?.user?.email && (
            <div className="flex flex-wrap items-center gap-4">
              <span className="hidden text-sm text-[#E9ECEF] sm:inline dark:text-white/10">|</span>
              <a
                href={`mailto:${lead.master.user.email}`}
                className={cn('group flex items-center gap-1.5 text-[13px] font-semibold no-underline', clientLinkCls)}
              >
                <AtSign className="size-4 opacity-70" />
                {lead.master.user.email}
              </a>
            </div>
          )}
        </div>

        {status === 'PENDING_CLOSE' && (
          <div className={clientInsetPanelCls}>
            <p className={cn('mb-3 text-[13px] font-semibold', clientTextTitle)}>
              {t('leads.closeConfirmationMessage')}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                size="sm"
                disabled={isConfirming}
                onClick={async () => {
                  try {
                    await updateStatus({ id: lead.id, body: { status: 'CLOSED' } }).unwrap();
                    toast.success(t('leads.closeConfirmed'));
                  } catch {
                    toast.error(t('leads.updateStatusFailed'));
                  }
                }}
                className="gap-1.5 rounded-[12px] bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <CheckCircle className="size-3.5" />
                {t('leads.confirmClose')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isConfirming}
                onClick={async () => {
                  try {
                    await updateStatus({ id: lead.id, body: { status: 'IN_PROGRESS' } }).unwrap();
                    toast.success(t('leads.closeRejected'));
                  } catch {
                    toast.error(t('leads.updateStatusFailed'));
                  }
                }}
                className="gap-1.5 rounded-[12px] border-rose-400/60 text-rose-700 hover:bg-rose-50 dark:text-rose-400"
              >
                <XCircle className="size-3.5" />
                {t('leads.rejectClose')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {lead.master && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e8e8e8] bg-[hsl(var(--secondary)/0.35)] p-4 dark:border-[#2d2d2d] dark:bg-white/[0.03] sm:px-6">
          <LeaveReviewButton
            lead={lead}
            onOpenModal={onOpenReviewModal}
            reviewsSubmittedMasterIds={reviewsSubmittedMasterIds}
          />
          <Button size="default" asChild className={cn(clientPrimaryBtnCls, 'ml-auto')}>
            <RouterLink
              to={`/masters/${masterSlugOrId}${status === 'CLOSED' ? '?review=1' : ''}`}
            >
              {t('clientDashboard.viewMaster')}
            </RouterLink>
          </Button>
        </div>
      )}

      {imageUrls.length > 0 && (
        <ImageLightboxModal
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          images={imageUrls}
          initialIndex={lightboxIndex}
        />
      )}
    </div>
  );
});

export default ClientRequestCard;
