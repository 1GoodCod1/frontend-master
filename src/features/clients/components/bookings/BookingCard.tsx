import { useTranslation } from 'react-i18next';
import { Calendar, User, Clock, StickyNote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useIsDark } from '@/hooks/useIsDark';
import { formatDateShort, formatTimeOnly, getLocaleFromLanguage } from '@/utils/date';
import { getBookingStatusColor, getBookingStatusBgColor } from '@/utils/statusColors';
import { BookAgainButton } from '@/features/bookings/components/BookAgainButton';
import { cn } from '@/lib/utils';
import type { BookingDto } from '@/types';

interface BookingCardProps {
  booking: BookingDto;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const { t, i18n } = useTranslation();
  const isDark = useIsDark();
  const locale = getLocaleFromLanguage(i18n.language);

  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  const statusColor = getBookingStatusColor(booking.status, isDark);
  const statusBgColor = getBookingStatusBgColor(booking.status, isDark);
  const durationMinutes =
    endTime.getTime() - startTime.getTime() > 0
      ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
      : 0;

  return (
    <Card className="border-border/50 dark:border-white/[0.06] bg-card dark:bg-white/[0.03] transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-amber-500/30 dark:hover:border-amber-500/20">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Calendar className="size-5 shrink-0 text-amber-600 dark:text-amber-500" />
              <span className="text-lg font-semibold">
                {formatDateShort(startTime, locale)} {formatTimeOnly(startTime, locale)} —{' '}
                {formatTimeOnly(endTime, locale)}
              </span>
              <span
                className={cn('rounded-md border px-2 py-0.5 text-xs font-semibold')}
                style={{
                  backgroundColor: statusBgColor,
                  color: statusColor,
                  borderColor: statusColor,
                }}
              >
                {t(`bookings.status.${booking.status}`)}
              </span>
            </div>
          </div>

          <Separator className="bg-border" />

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-4 shrink-0" />
              <strong className="text-foreground">{t('clientDashboard.master')}:</strong>{' '}
              {[booking.master?.user?.firstName, booking.master?.user?.lastName].filter(Boolean).join(' ') || '—'}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4 shrink-0" />
              {durationMinutes > 0 ? `${durationMinutes} ${t('bookings.minutes')}` : '—'}
            </div>
          </div>

          {booking.notes && (
            <>
              <Separator className="bg-border" />
              <div className="flex items-start gap-2">
                <StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="flex-1 text-sm text-muted-foreground">
                  <strong className="text-foreground">{t('bookings.notes')}:</strong>{' '}
                  {booking.notes}
                </p>
              </div>
            </>
          )}

          {(booking.status === 'COMPLETED' || booking.status === 'CANCELLED') && (
            <>
              <Separator className="bg-border" />
              <div className="flex justify-end">
                <BookAgainButton
                  booking={{
                    id: booking.id,
                    masterId: booking.masterId || booking.master?.id || '',
                    masterSlug: booking.master?.slug ?? undefined,
                    masterName: [booking.master?.user?.firstName, booking.master?.user?.lastName].filter(Boolean).join(' '),
                    serviceName: booking.serviceName ?? undefined,
                  }}
                  size="sm"
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
