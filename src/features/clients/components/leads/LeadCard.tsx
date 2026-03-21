import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Mail, Clock, Phone, AtSign, CalendarDays, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDateShort, formatTimeOnly, getLocaleFromLanguage } from '@/utils/date';
import type { LeadCardProps } from '@/types/leads';
import { RequestStatusBadge } from '@/features/requests/components/RequestStatusBadge';
import LeaveReviewButton from './LeaveReviewButton';
import { RequestStatusProgress } from '@/features/requests/components/RequestStatusProgress';
import {
  useBookingsClientConfirmMutation,
  useBookingsClientRejectMutation,
} from '@/features/bookings/bookingsApi';

const ClientRequestCard = React.memo(function ClientRequestCard({
  lead,
  onOpenReviewModal,
  reviewsSubmittedMasterIds,
  pendingBooking,
}: LeadCardProps) {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);

  const [confirmBooking, { isLoading: isConfirming }] = useBookingsClientConfirmMutation();
  const [rejectBooking, { isLoading: isRejecting }] = useBookingsClientRejectMutation();

  const createdAt = lead.createdAt ? new Date(lead.createdAt) : null;
  const status = String((lead.status ?? 'NEW')).toUpperCase();
  const masterSlugOrId =
    lead.master?.slug ||
    (lead.master as { encodedId?: string })?.encodedId ||
    (lead.master?.id ? String(lead.master.id) : '') ||
    (lead.masterId ? String(lead.masterId) : '');

  const handleConfirm = async () => {
    if (!pendingBooking) return;
    try {
      await confirmBooking({ id: pendingBooking.id }).unwrap();
      toast.success(t('bookings.confirmSuccess', 'Booking confirmed!'));
    } catch {
      toast.error(t('bookings.confirmFailed', 'Failed to confirm booking'));
    }
  };

  const handleReject = async () => {
    if (!pendingBooking) return;
    try {
      await rejectBooking({ id: pendingBooking.id }).unwrap();
      toast.success(t('bookings.rejectSuccess', 'Booking declined'));
    } catch {
      toast.error(t('bookings.rejectFailed', 'Failed to decline booking'));
    }
  };

  return (
    <Card className="overflow-hidden border-border dark:border-white/[0.08] bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-amber-500/50">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row flex-wrap items-start justify-between gap-2">
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Mail className="size-5 shrink-0 text-primary" />
                <span className="text-lg font-semibold">
                  {lead.master?.user?.firstName} {lead.master?.user?.lastName}
                </span>
                <RequestStatusBadge status={status} />
              </div>
              <p className="mb-4 leading-relaxed text-foreground">{lead.message ?? '—'}</p>
            </div>
          </div>

          {/* Status Progress Tracker */}
          <RequestStatusProgress status={status} compact />

          {/* Pending Booking Proposal */}
          {pendingBooking && (
            <>
              <Separator className="bg-border" />
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
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleConfirm}
                    disabled={isConfirming || isRejecting}
                  >
                    <Check className="size-4" />
                    {isConfirming
                      ? t('common.loading')
                      : t('bookings.confirm', 'Confirm')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                    onClick={handleReject}
                    disabled={isConfirming || isRejecting}
                  >
                    <X className="size-4" />
                    {isRejecting
                      ? t('common.loading')
                      : t('bookings.reject', 'Decline')}
                  </Button>
                </div>
              </div>
            </>
          )}

          <Separator className="bg-border" />

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4 shrink-0" />
              {createdAt ? (
                <>
                  {formatDateShort(createdAt, locale)} {formatTimeOnly(createdAt, locale)}
                </>
              ) : (
                '—'
              )}
            </div>
          </div>

          {(lead.master?.user?.phone || lead.master?.user?.email) && (
            <>
              <Separator className="bg-border" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('clientDashboard.masterContact')}
              </p>
              <div className="flex flex-wrap gap-4">
                {lead.master?.user?.phone && (
                  <a
                    href={`tel:${lead.master.user.phone}`}
                    className="flex items-center gap-2 font-medium text-foreground no-underline hover:underline"
                  >
                    <Phone className="size-4 text-primary" />
                    {lead.master.user.phone}
                  </a>
                )}
                {lead.master?.user?.email && (
                  <a
                    href={`mailto:${lead.master.user.email}`}
                    className="flex items-center gap-2 font-medium text-foreground no-underline hover:underline"
                  >
                    <AtSign className="size-4 text-primary" />
                    {lead.master.user.email}
                  </a>
                )}
              </div>
            </>
          )}

          {lead.master && (
            <div className="flex flex-wrap gap-2">
              <LeaveReviewButton
                lead={lead}
                onOpenModal={onOpenReviewModal}
                reviewsSubmittedMasterIds={reviewsSubmittedMasterIds}
              />
              <Button size="sm" asChild className="border-0 bg-amber-600 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-xl dark:bg-amber-700 dark:hover:bg-amber-600">
                <RouterLink
                  to={`/masters/${masterSlugOrId}${status === 'CLOSED' ? '?review=1' : ''}`}
                >
                  {t('clientDashboard.viewMaster')}
                </RouterLink>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
export default ClientRequestCard;
