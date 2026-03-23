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
        >
          {t('common.all', 'All')}
        </Button>
        {BOOKING_STATUS_OPTIONS.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {t(`bookings.status.${s}`, s)}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-border bg-card text-center">
          <CardContent className="p-8">
            <Calendar className="mx-auto mb-4 size-16 text-muted-foreground opacity-50" />
            <h3 className="mb-2 text-lg font-semibold text-muted-foreground">
              {t('clientDashboard.noBookings')}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {t('clientDashboard.noBookingsSubtitle')}
            </p>
            <Button asChild>
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
              <Card key={booking.id} className="border-border bg-card transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: Info */}
                    <div className="flex-1 space-y-3">
                      {/* Master + Status */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-muted-foreground" />
                          {masterSlug ? (
                            <Link
                              to={`/masters/${masterSlug}`}
                              className="font-semibold text-primary hover:underline"
                            >
                              {masterName}
                            </Link>
                          ) : (
                            <span className="font-semibold">{masterName}</span>
                          )}
                        </div>
                        <Badge className={cn('text-xs font-medium', statusColors[status] || statusColors.PENDING)}>
                          {t(`bookings.status.${status}`, status)}
                        </Badge>
                      </div>

                      {/* Service */}
                      {booking.serviceName && (
                        <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
                      )}

                      {/* Date & Time */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-4" />
                          {start.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-4" />
                          {start.time} — {end.time}
                        </span>
                      </div>

                      {/* Notes */}
                      {booking.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          {booking.notes}
                        </p>
                      )}
                    </div>

                    {/* Right: Actions / Status hint */}
                    <div className="flex shrink-0 gap-2 sm:flex-col sm:items-end">
                      {isPending && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700">
                          <Hourglass className="mr-1 size-3" />
                          {t('bookings.status.PENDING')}
                        </Badge>
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
