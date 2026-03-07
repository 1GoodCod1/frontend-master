import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/common/States';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { useClientBookings } from '@/hooks/client/bookings/useClientBookings';
import BookingsEmptyState from '@/features/clients/components/bookings/BookingsEmptyState';
import BookingCard from '@/features/clients/components/bookings/BookingCard';

export default function ClientBookingsPage() {
  const { t } = useTranslation();
  const { bookingsList, isLoading, isError, error, refetch } = useClientBookings();

  if (isLoading) return <CardsSkeleton count={5} />;
  if (isError) return <ErrorState error={error as Error} onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-6xl py-6 md:py-8">
      <PageHeader
        title={t('clientDashboard.myBookings')}
        subtitle={t('clientDashboard.bookingsSubtitle')}
      />

      {bookingsList.length === 0 ? (
        <BookingsEmptyState />
      ) : (
        <div className="flex flex-col gap-6">
          {bookingsList.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
