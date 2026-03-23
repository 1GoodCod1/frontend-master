import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ChevronRight, Hourglass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBookingsMyBookingsQuery } from '@/features/bookings/bookingsApi';
import type { BookingDto } from '@/types';

function displayMasterName(master?: BookingDto['master']) {
  if (!master) return '—';
  const full = `${master.user?.firstName || ''} ${master.user?.lastName || ''}`.trim();
  return full || '—';
}

/**
 * Banner for client dashboard showing PENDING bookings awaiting master confirmation.
 * Renders nothing if there are no pending bookings.
 */
export function PendingBookingsBanner() {
  const { t } = useTranslation();
  const { data: bookings } = useBookingsMyBookingsQuery();

  const pending = useMemo(
    () => (bookings ?? []).filter((b) => b.status === 'PENDING'),
    [bookings],
  );

  if (pending.length === 0) return null;

  return (
    <Card className="border-2 border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hourglass className="size-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-amber-800 dark:text-amber-300">
              {t('bookings.proposedTime', 'Ожидают подтверждения мастера')}
            </h3>
            <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
              {pending.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-amber-700 dark:text-amber-400">
            <Link to="/client-dashboard/bookings">
              {t('common.viewAll', 'Все')}
              <ChevronRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {pending.slice(0, 3).map((booking) => {
            const start = new Date(booking.startTime);
            const end = new Date(booking.endTime);
            const masterName = displayMasterName(booking.master);
            const masterSlug = booking.master?.slug;

            return (
              <div
                key={booking.id}
                className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground shrink-0" />
                    {masterSlug ? (
                      <Link to={`/masters/${masterSlug}`} className="font-semibold text-primary hover:underline truncate">
                        {masterName}
                      </Link>
                    ) : (
                      <span className="font-semibold truncate">{masterName}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {start.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' — '}
                      {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {booking.serviceName && (
                    <p className="text-xs text-muted-foreground">{booking.serviceName}</p>
                  )}
                </div>
                <Badge variant="outline" className="shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700">
                  <Hourglass className="mr-1 size-3" />
                  {t('bookings.status.PENDING')}
                </Badge>
              </div>
            );
          })}
        </div>

        {pending.length > 3 && (
          <p className="text-xs text-amber-700/70 dark:text-amber-400/70 text-center">
            +{pending.length - 3} {t('common.more', 'ещё')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
