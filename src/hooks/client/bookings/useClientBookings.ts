import { useBookingsMyBookingsQuery } from '@/features/bookings/bookingsApi';

export function useClientBookings() {
  const bookings = useBookingsMyBookingsQuery();

  const bookingsList = bookings.data ?? [];

  return {
    bookingsList,
    isLoading: bookings.isLoading,
    isError: bookings.isError,
    error: bookings.error,
    refetch: bookings.refetch,
  };
}
