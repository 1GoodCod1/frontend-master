import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Hourglass, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/common/States';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClientBookings } from '@/hooks/client/bookings';
import { BookAgainButton } from '@/features/bookings/components/BookAgainButton';
import { cn } from '@/lib/utils';
import type { BookingDto, BookingStatus } from '@/types';
import { BOOKING_STATUS_OPTIONS } from '@/types/bookings';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

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
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <PageHeader
        title={t('clientDashboard.myBookings')}
        subtitle={t('clientDashboard.bookingsSubtitle')}
      />

      {/* Status filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={statusFilter === 'ALL' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('ALL')}
          className={cn(
            "rounded-xl transition-all font-medium",
            statusFilter === 'ALL' 
              ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20" 
              : "border-black/5 dark:border-white/5 hover:border-amber-500/30 hover:text-amber-600 hover:bg-amber-500/5 shadow-sm"
          )}
        >
          {t('common.all', 'All')}
        </Button>
        {BOOKING_STATUS_OPTIONS.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-xl transition-all font-medium",
              statusFilter === s 
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20" 
                : "border-black/5 dark:border-white/5 hover:border-amber-500/30 hover:text-amber-600 hover:bg-amber-500/5 shadow-sm"
            )}
          >
            {t(`bookings.status.${s}`, s)}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="group relative overflow-hidden rounded-[2rem] border border-black/5 bg-card shadow-sm transition-all duration-300 hover:border-amber-500/30 hover:shadow-md dark:border-white/5 dark:bg-card/40 dark:hover:border-amber-500/30 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-transparent to-amber-500/0 opacity-0 transition-opacity duration-300 group-hover:from-amber-500/5 group-hover:to-transparent group-hover:opacity-100 pointer-events-none z-0" />
          <CardContent className="relative z-10 p-12 flex flex-col items-center">
            <div className="mb-6 flex size-20 items-center justify-center rounded-[1.5rem] bg-amber-50 dark:bg-amber-500/10 group-hover:scale-110 transition-transform duration-500">
              <Calendar className="size-10 text-amber-500 opacity-80" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">
              {t('clientDashboard.noBookings')}
            </h3>
            <p className="mb-8 text-sm text-muted-foreground/80">
              {t('clientDashboard.noBookingsSubtitle')}
            </p>
            <Button asChild className="rounded-xl px-6 bg-amber-600 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-700 hover:-translate-y-0.5 transition-all text-sm font-semibold h-11">
              <Link to="/masters">
                <Search className="mr-2 size-4" />
                {t('clientDashboard.browseMasters')}
              </Link>
            </Button>
          </CardContent>
        </Card>
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
              <Card key={booking.id} className="group overflow-hidden rounded-[1.5rem] border border-black/5 dark:border-white/5 bg-card shadow-sm transition-all duration-300 hover:border-amber-500/30 hover:shadow-md dark:bg-card/40 dark:hover:border-amber-500/30">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: Info */}
                    <div className="flex-1 space-y-3">
                      {/* Master + Status */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                            <User className="size-4" />
                          </div>
                          {masterSlug ? (
                            <Link
                              to={`/masters/${masterSlug}`}
                              className="font-semibold text-foreground hover:text-amber-600 transition-colors"
                            >
                              {masterName}
                            </Link>
                          ) : (
                            <span className="font-semibold text-foreground">{masterName}</span>
                          )}
                        </div>
                        <Badge className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-lg border-transparent', statusColors[status] || statusColors.PENDING)}>
                          {t(`bookings.status.${status}`, status)}
                        </Badge>
                      </div>

                      {/* Service */}
                      {booking.serviceName && (
                        <p className="font-medium text-foreground">{booking.serviceName}</p>
                      )}

                      {/* Date & Time */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="size-4 text-amber-600/70" />
                          {start.date}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="size-4 text-amber-600/70" />
                          {start.time} — {end.time}
                        </span>
                      </div>

                      {/* Notes */}
                      {booking.notes && (
                        <div className="mt-2 rounded-xl bg-black/5 dark:bg-white/5 p-3 text-sm text-muted-foreground italic border border-black/5 dark:border-white/5">
                          {booking.notes}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions / Status hint */}
                    <div className="flex shrink-0 gap-2 sm:flex-col sm:items-end">
                      {isPending && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg">
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
