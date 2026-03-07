import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBookingsCalendarQuery, useBookingsUpdateStatusMutation } from '@/features/bookings/bookingsApi';
import { useMastersMyProfileQuery } from '@/features/masters/mastersApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/common/States';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { BOOKING_STATUS_OPTIONS, type BookingStatus } from '@/types/bookings';
import { getLocaleFromLanguage } from '@/utils/date';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { addDays, startOfWeek } from 'date-fns';
import { MasterBookingsCalendar } from '@/features/masters/components/master/bookings/MasterBookingsCalendar';
import type { BookingItem } from '@/features/masters/components/master/bookings/MasterBookingsCalendar';
import { MasterLeadsWithoutBookingColumn } from '@/features/masters/components/master/bookings/MasterLeadsWithoutBookingColumn';
import type { LeadWithoutBooking } from '@/features/masters/components/master/bookings/MasterLeadsWithoutBookingColumn';
import { ScheduleSettingsCard } from '@/features/masters/components/master/bookings/ScheduleSettingsCard';

export default function BookingsPage() {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  const myProfile = useMastersMyProfileQuery();
  const masterId =
    (myProfile.data as { data?: { id?: string }; id?: string })?.data?.id ??
    (myProfile.data as { id?: string })?.id ??
    null;

  const calendarQuery = useBookingsCalendarQuery(
    { masterId: masterId ?? '', status: statusFilter || undefined },
    { skip: !masterId },
  );

  const [updateStatus, updateState] = useBookingsUpdateStatusMutation();

  const raw = calendarQuery.data as
    | { data?: { bookings?: BookingItem[]; leadsWithoutBooking?: LeadWithoutBooking[] }; bookings?: BookingItem[]; leadsWithoutBooking?: LeadWithoutBooking[] }
    | undefined;
  const calendarData = raw?.data ?? raw;
  const bookings: BookingItem[] = calendarData?.bookings ?? [];
  const leadsWithoutBooking: LeadWithoutBooking[] = calendarData?.leadsWithoutBooking ?? [];

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await updateStatus({ id: bookingId, status: newStatus }).unwrap();
      calendarQuery.refetch();
    } catch (error: unknown) {
      const msg =
        error &&
        typeof error === 'object' &&
        'data' in error &&
        (error as { data?: { message?: string } }).data?.message;
      toast.error((msg as string) || (error instanceof Error ? error.message : t('bookings.updateFailed')));
    }
  };

  const handlePrevWeek = () => setWeekStart((d) => addDays(d, -7));
  const handleNextWeek = () => setWeekStart((d) => addDays(d, 7));

  if (myProfile.isLoading) return <CardsSkeleton count={5} />;
  if (myProfile.isError) return <ErrorState error={myProfile.error as Error} onRetry={myProfile.refetch} />;
  if (!masterId)
    return <ErrorState error={new Error('Master profile not found')} onRetry={() => { }} />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <PageHeader title={t('bookings.myBookings')} subtitle={t('bookings.manageBookings')} />
      <p className="mb-4 text-sm text-muted-foreground">{t('bookings.flowHint')}</p>

      <div className="mb-6">
        <ScheduleSettingsCard />
      </div>

      <Card className="mb-6 border-border dark:border-white/[0.08] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <Label htmlFor="booking-status-filter">{t('bookings.filterByStatus')}</Label>
            <Select
              value={statusFilter || 'all'}
              onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}
            >
              <SelectTrigger id="booking-status-filter" className="min-w-[200px]">
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {BOOKING_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`bookings.status.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {calendarQuery.isLoading ? (
        <CardsSkeleton count={7} />
      ) : calendarQuery.isError ? (
        <ErrorState error={calendarQuery.error as Error} onRetry={calendarQuery.refetch} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <MasterBookingsCalendar
              bookings={bookings}
              weekStart={weekStart}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              locale={locale}
              onStatusChange={handleStatusChange}
              isUpdating={updateState.isLoading}
            />
          </div>
          <div className="lg:col-span-1">
            <Card className="border-border dark:border-white/[0.08] p-4 sticky top-24">
              <MasterLeadsWithoutBookingColumn
                leads={leadsWithoutBooking}
                masterId={masterId}
                onBookingCreated={() => calendarQuery.refetch()}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
