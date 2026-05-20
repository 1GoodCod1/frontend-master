import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Hourglass, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/common/States';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { ClientFilterPill } from '@/components/client/ClientFilterPill';
import { ClientEmptyState } from '@/components/client/ClientEmptyState';
import { Button } from '@/components/ui/button';
import { useClientBookings } from '@/hooks/client/bookings';
import { BookAgainButton } from '@/features/bookings/components/BookAgainButton';
import { cn } from '@/lib/utils';
import {
  clientBadgeCls,
  clientCardCls,
  clientIconWrapCls,
  clientInsetPanelCls,
  clientLinkCls,
  clientPageClassName,
  clientTextBody,
  clientTextMuted,
  clientTextTitle,
} from '@/lib/clientCabinetStyles';
import type { BookingDto, BookingStatus } from '@/types';
import { BOOKING_STATUS_OPTIONS } from '@/types/bookings';

function displayMasterName(master?: BookingDto['master']) {
  if (!master) return '—';
  const full = `${master.user?.firstName || ''} ${master.user?.lastName || ''}`.trim();
  return full || '—';
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function ClientBookingsPage() {
  const { t } = useTranslation();
  const { bookingsList, isLoading, isError, error, refetch } = useClientBookings();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    const list = statusFilter === 'ALL'
      ? bookingsList
      : bookingsList.filter((b) => b.status === statusFilter);
    return [...list].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );
  }, [bookingsList, statusFilter]);

  if (isLoading) return <CardsSkeleton count={4} />;
  if (isError) return <ErrorState error={error as Error} onRetry={refetch} />;

  return (
    <div className={clientPageClassName}>
      <PageHeader
        title={t('clientDashboard.myBookings')}
        subtitle={t('clientDashboard.bookingsSubtitle')}
      />

      <div className="flex flex-wrap gap-2">
        <ClientFilterPill active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')}>
          {t('common.all', 'All')}
        </ClientFilterPill>
        {BOOKING_STATUS_OPTIONS.map((s) => (
          <ClientFilterPill
            key={s}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
          >
            {t(`bookings.status.${s}`, s)}
          </ClientFilterPill>
        ))}
      </div>

      {filtered.length === 0 ? (
        <ClientEmptyState
          icon={Calendar}
          title={t('clientDashboard.noBookings')}
          description={t('clientDashboard.noBookingsSubtitle')}
          action={
            <Button asChild className="rounded-[14px] bg-[#E97525] px-5 text-[13px] font-semibold text-white hover:bg-[#d86920] shadow-none">
              <Link to="/masters">
                <Search className="mr-2 size-4" />
                {t('clientDashboard.browseMasters')}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((booking) => {
            const start = formatDateTime(booking.startTime);
            const end = formatDateTime(booking.endTime);
            const masterName = displayMasterName(booking.master);
            const masterSlug = booking.master?.slug;
            const status = (booking.status || 'PENDING').toUpperCase();
            const isPending = status === 'PENDING';

            return (
              <div key={booking.id} className={clientCardCls}>
                <div className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className={clientIconWrapCls}>
                            <User className="size-4" />
                          </span>
                          {masterSlug ? (
                            <Link to={`/masters/${masterSlug}`} className={cn('font-semibold', clientTextTitle, clientLinkCls)}>
                              {masterName}
                            </Link>
                          ) : (
                            <span className={cn('font-semibold', clientTextTitle)}>{masterName}</span>
                          )}
                        </div>
                        <span className={clientBadgeCls}>
                          {t(`bookings.status.${status}`, status)}
                        </span>
                      </div>

                      {booking.serviceName && (
                        <p className={cn('font-medium', clientTextTitle)}>{booking.serviceName}</p>
                      )}

                      <div className={cn('flex flex-wrap items-center gap-4', clientTextMuted)}>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="size-4 text-[#E97525]/70" />
                          {start.date}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="size-4 text-[#E97525]/70" />
                          {start.time} — {end.time}
                        </span>
                      </div>

                      {booking.notes && (
                        <div className={cn(clientInsetPanelCls, 'text-sm italic', clientTextBody)}>
                          {booking.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2 sm:flex-col sm:items-end">
                      {isPending && (
                        <span className={cn(clientBadgeCls, 'gap-1.5 normal-case tracking-normal text-[#E97525]')}>
                          <Hourglass className="size-3.5" />
                          {t('bookings.status.PENDING')}
                        </span>
                      )}
                      {(status === 'COMPLETED' || status === 'CONFIRMED') && (
                        <BookAgainButton
                          booking={{
                            id: booking.id,
                            masterId: booking.masterId,
                            masterSlug: masterSlug ?? undefined,
                            masterName,
                            serviceName: booking.serviceName ?? undefined,
                          }}
                          size="sm"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
