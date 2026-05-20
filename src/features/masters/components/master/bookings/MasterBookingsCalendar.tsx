import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, CalendarDays, User, Phone, FileText, Clock } from 'lucide-react';
import { addDays, format, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTimeOnly, formatDateShort } from '@/utils/date';
import { getBookingStatusChipColor } from '@/utils/statusColors';
import { cn } from '@/lib/utils';

export interface BookingItem {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  clientName?: string | null;
  clientPhone?: string;
  notes?: string | null;
  leadId?: string | null;
  createdAt?: string | null;
  lead?: { id: string } | null;
}

interface MasterBookingsCalendarProps {
  bookings: BookingItem[];
  weekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  locale: string;
  onStatusChange?: (bookingId: string, status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => void;
  isUpdating?: boolean;
}

function bookingBadgeClass(status: string): string {
  const color = getBookingStatusChipColor(status);
  switch (color) {
    case 'warning':
      return 'border-[#E97525]/70 bg-[#FFF8EB] text-[#c45f1a] dark:text-[#f08540]';
    case 'info':
      return 'bg-blue-600 text-white';
    case 'success':
      return 'bg-green-600 text-white';
    case 'error':
      return 'bg-destructive/15 text-destructive border border-destructive/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function MasterBookingsCalendar({
  bookings,
  weekStart,
  onPrevWeek,
  onNextWeek,
  locale,
  onStatusChange,
  isUpdating,
}: MasterBookingsCalendarProps) {
  const { t } = useTranslation();
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, BookingItem[]>();
    for (const d of days) {
      const key = format(d, 'yyyy-MM-dd');
      map.set(
        key,
        bookings.filter((b) => isSameDay(new Date(b.startTime), d)),
      );
    }
    return map;
  }, [bookings, days]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onPrevWeek} aria-label={t('common.prev')}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-medium min-w-[180px] text-center">
            {format(weekStart, 'd MMM')} — {format(addDays(weekStart, 6), 'd MMM yyyy')}
          </span>
          <Button variant="outline" size="icon" onClick={onNextWeek} aria-label={t('common.next')}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayBookings = bookingsByDay.get(key) ?? [];
          const isToday = isSameDay(day, new Date());
          const dayLabel = day.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' });

          return (
            <section key={key} className="space-y-2">
              <div
                className={cn(
                  'flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold',
                  isToday
                    ? 'bg-[#FFF8EB] text-[#c45f1a] dark:text-amber-200 border border-[#E97525]/30'
                    : 'bg-muted/50 text-foreground border border-transparent',
                )}
              >
                <CalendarDays className="size-4 shrink-0 text-[#E97525] dark:text-[#E97525]" />
                <span className="capitalize">{dayLabel}</span>
                {isToday && (
                  <span className="text-xs font-medium text-[#E97525] dark:text-[#f08540] ml-1">
                    ({t('bookings.today', 'today')})
                  </span>
                )}
              </div>

              {dayBookings.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3 px-3">
                  {t('bookings.noBookingsThisDay', 'No bookings')}
                </p>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {dayBookings.map((booking) => {
                    const start = new Date(booking.startTime);
                    const end = new Date(booking.endTime);
                    const leadId = booking.lead?.id ?? booking.leadId;
                    const leadShortId = leadId ? String(leadId) : null;
                    const bookedAt = booking.createdAt ? new Date(booking.createdAt) : null;
                    return (
                      <li
                        key={booking.id}
                        className={cn(
                          'rounded-xl border border-border dark:border-white/10 overflow-hidden',
                          'bg-card hover:bg-muted/30 transition-colors shadow-sm',
                        )}
                      >
                        <div className="p-3 space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                              <Clock className="size-3.5 shrink-0 text-[#E97525] dark:text-[#E97525]" />
                              {formatTimeOnly(start, locale)} — {formatTimeOnly(end, locale)}
                            </div>
                            <Badge
                              variant="outline"
                              className={cn('text-[10px] px-2 py-0 shrink-0', bookingBadgeClass(booking.status))}
                            >
                              {t(`bookings.status.${booking.status}`)}
                            </Badge>
                          </div>

                          {leadShortId && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <FileText className="size-3.5 shrink-0 text-[#E97525]/80 dark:text-[#E97525]/80" />
                              <span>
                                {t('bookings.fromLead')} <span className="font-mono font-medium text-foreground/90">#{leadShortId}</span>
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 text-xs">
                            <User className="size-3.5 shrink-0 text-muted-foreground" />
                            <span className="font-medium truncate">{booking.clientName || t('bookings.client')}</span>
                          </div>
                          {booking.clientPhone && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="size-3.5 shrink-0" />
                              <span className="truncate">{booking.clientPhone}</span>
                            </div>
                          )}

                          {bookedAt && (
                            <div className="text-[11px] text-muted-foreground border-t border-border/50 pt-2">
                              {t('bookings.bookedOn')}: {formatDateShort(bookedAt, locale)}
                            </div>
                          )}

                          {onStatusChange && booking.status === 'PENDING' && (
                            <div className="flex gap-1.5 pt-1">
                              <Button
                                size="sm"
                                variant="default"
                                className="h-7 text-[11px] flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => onStatusChange(booking.id, 'CONFIRMED')}
                                disabled={isUpdating}
                              >
                                {t('bookings.confirm')}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-[11px]"
                                onClick={() => onStatusChange(booking.id, 'CANCELLED')}
                                disabled={isUpdating}
                              >
                                {t('bookings.cancel')}
                              </Button>
                            </div>
                          )}
                          {onStatusChange && booking.status === 'CONFIRMED' && (
                            <div className="flex gap-1.5 pt-1">
                              <Button
                                size="sm"
                                variant="default"
                                className="h-7 text-[11px] flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => onStatusChange(booking.id, 'COMPLETED')}
                                disabled={isUpdating}
                              >
                                {t('bookings.markCompleted')}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-[11px]"
                                onClick={() => onStatusChange(booking.id, 'CANCELLED')}
                                disabled={isUpdating}
                              >
                                {t('bookings.cancel')}
                              </Button>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
