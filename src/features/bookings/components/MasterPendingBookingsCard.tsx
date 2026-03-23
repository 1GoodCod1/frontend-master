import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMastersMyProfileQuery } from '@/features/masters/mastersApi';
import {
  useBookingsCalendarQuery,
  useBookingsUpdateStatusMutation,
} from '@/features/bookings/bookingsApi';
import type { BookingStatus } from '@/types';

interface BookingItem {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  clientName?: string | null;
  clientPhone?: string;
  serviceName?: string | null;
}

/**
 * Card for master dashboard showing PENDING bookings that need action (confirm/cancel).
 * Renders nothing if there are no pending bookings.
 */
export function MasterPendingBookingsCard() {
  const { t } = useTranslation();

  const myProfile = useMastersMyProfileQuery();
  const masterId =
    (myProfile.data as { data?: { id?: string }; id?: string })?.data?.id ??
    (myProfile.data as { id?: string })?.id ??
    null;

  const calendarQuery = useBookingsCalendarQuery(
    { masterId: masterId ?? '' },
    { skip: !masterId },
  );

  const [updateStatus, { isLoading: isUpdating }] = useBookingsUpdateStatusMutation();

  const raw = calendarQuery.data as
    | { data?: { bookings?: BookingItem[] }; bookings?: BookingItem[] }
    | undefined;
  const allBookings: BookingItem[] = (raw?.data ?? raw)?.bookings ?? [];

  const pending = useMemo(
    () => allBookings.filter((b) => b.status === 'PENDING'),
    [allBookings],
  );

  const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
    try {
      await updateStatus({ id: bookingId, status }).unwrap();
      toast.success(t('bookings.statusUpdated'));
      calendarQuery.refetch();
    } catch {
      toast.error(t('bookings.updateFailed'));
    }
  };

  if (!masterId || pending.length === 0) return null;

  return (
    <Card className="shadow-lg border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />

      <CardHeader className="pb-3 relative z-10">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="size-5 text-amber-500" />
            {t('bookings.proposedTime', 'Ожидают подтверждения')}
            <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs ml-1">
              {pending.length}
            </Badge>
          </span>
          <Button variant="ghost" size="sm" asChild className="text-amber-600 dark:text-amber-400">
            <Link to="/dashboard/bookings">
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-0 relative z-10">
        {pending.slice(0, 4).map((booking) => {
          const start = new Date(booking.startTime);
          const end = new Date(booking.endTime);

          return (
            <div
              key={booking.id}
              className="rounded-xl border border-amber-500/20 bg-background p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    <User className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{booking.clientName || t('bookings.client')}</span>
                  </div>
                  {booking.clientPhone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="size-3 shrink-0" />
                      <span>{booking.clientPhone}</span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                    <Calendar className="size-3" />
                    {start.toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' — '}
                    {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  className="h-7 text-xs flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                  disabled={isUpdating}
                >
                  <CheckCircle className="mr-1 size-3.5" />
                  {t('bookings.confirm')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs"
                  onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                  disabled={isUpdating}
                >
                  <XCircle className="mr-1 size-3.5" />
                  {t('bookings.cancel')}
                </Button>
              </div>
            </div>
          );
        })}

        {pending.length > 4 && (
          <Button variant="ghost" size="sm" asChild className="w-full text-amber-600 dark:text-amber-400">
            <Link to="/dashboard/bookings">
              +{pending.length - 4} {t('common.more', 'ещё')} →
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
