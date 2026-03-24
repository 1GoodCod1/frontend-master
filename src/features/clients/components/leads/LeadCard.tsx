import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Mail, Clock, Phone, AtSign, CalendarDays, Hourglass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateShort, formatTimeOnly, getLocaleFromLanguage } from '@/utils/date';
import type { LeadCardProps } from '@/types/leads';
import { RequestStatusBadge } from '@/features/requests/components/RequestStatusBadge';
import LeaveReviewButton from './LeaveReviewButton';
import { RequestStatusProgress } from '@/features/requests/components/RequestStatusProgress';
import { mediaUrl } from '@/utils/media';
import { ImageLightboxModal } from '@/components/common/ImageLightboxModal';

const ClientRequestCard = React.memo(function ClientRequestCard({
  lead,
  onOpenReviewModal,
  reviewsSubmittedMasterIds,
  pendingBooking,
}: LeadCardProps) {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);

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
    <Card className="group flex flex-col min-w-0 w-full overflow-hidden rounded-2xl border border-black/5 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-md dark:border-white/5 dark:bg-card/40 dark:hover:border-amber-500/30">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-transparent to-amber-500/0 opacity-0 transition-opacity duration-300 group-hover:from-amber-500/5 group-hover:to-transparent group-hover:opacity-100 pointer-events-none" />
      
      <CardContent className="relative flex min-w-0 flex-col gap-6 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                <Mail className="size-5" />
              </div>
              <span className="text-lg font-bold text-foreground transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-500">
                {lead.master?.user?.firstName} {lead.master?.user?.lastName}
              </span>
              <RequestStatusBadge status={status} />
            </div>
            
            <p className="mt-1 min-w-0 max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-base leading-relaxed text-muted-foreground">
              {lead.message ?? '—'}
            </p>
          </div>
        </div>

        {imageUrls.length > 0 && (
          <div className="flex flex-col gap-2">
             <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
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
                   className="relative block size-20 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-muted transition-transform hover:scale-105 hover:shadow-md dark:border-white/10"
                   aria-label={`View photo ${idx + 1}`}
                 >
                   <img src={src} alt="Attachment" className="h-full w-full object-cover" loading="lazy" />
                 </button>
               ))}
             </div>
          </div>
        )}

        {/* Status Progress Tracker */}
        <div className="rounded-xl border border-black/5 bg-black/[0.02] p-5 dark:border-white/5 dark:bg-white/[0.02]">
          <RequestStatusProgress status={status} compact />
        </div>

        {/* Pending Booking Proposal */}
        {pendingBooking && (
          <div className="rounded-xl border-2 border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="size-5 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-amber-800 dark:text-amber-300">
                {t('bookings.proposedTime', 'Proposed appointment')}
              </span>
            </div>
            <p className="text-sm text-foreground mb-3">
              {formatDateShort(new Date(pendingBooking.startTime), locale)}{' '}
              {formatTimeOnly(new Date(pendingBooking.startTime), locale)}
              {' — '}
              {formatTimeOnly(new Date(pendingBooking.endTime), locale)}
              {pendingBooking.notes && (
                <span className="text-muted-foreground ml-2">· {pendingBooking.notes}</span>
              )}
            </p>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700">
              <Hourglass className="mr-1 size-3" />
              {t('bookings.status.PENDING')}
            </Badge>
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground/80 font-medium">
            <Clock className="size-4 shrink-0" />
            {createdAt ? (
              <>
                {formatDateShort(createdAt, locale)} {formatTimeOnly(createdAt, locale)}
              </>
            ) : (
              '—'
            )}
          </div>

          {(lead.master?.user?.phone || lead.master?.user?.email) && (
            <div className="flex flex-wrap items-center gap-4">
              <span className="hidden text-sm text-border sm:inline">|</span>
              {lead.master?.user?.phone && (
                <a
                  href={`tel:${lead.master.user.phone}`}
                  className="group flex items-center gap-1.5 text-sm font-semibold text-foreground no-underline transition-colors hover:text-amber-600 dark:hover:text-amber-500"
                >
                  <Phone className="size-4 text-amber-500/70 transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-500" />
                  {lead.master.user.phone}
                </a>
              )}
              {lead.master?.user?.email && (
                <a
                  href={`mailto:${lead.master.user.email}`}
                  className="group flex items-center gap-1.5 text-sm font-semibold text-foreground no-underline transition-colors hover:text-amber-600 dark:hover:text-amber-500"
                >
                  <AtSign className="size-4 text-amber-500/70 transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-500" />
                  {lead.master.user.email}
                </a>
              )}
            </div>
          )}
        </div>

      </CardContent>

      {lead.master && (
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.02] sm:px-6">
          <LeaveReviewButton
            lead={lead}
            onOpenModal={onOpenReviewModal}
            reviewsSubmittedMasterIds={reviewsSubmittedMasterIds}
          />
          <Button size="default" asChild className="rounded-xl border-0 bg-amber-600 font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-xl dark:bg-amber-600 dark:hover:bg-amber-700 ml-auto">
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
    </Card>
  );
});

export default ClientRequestCard;
