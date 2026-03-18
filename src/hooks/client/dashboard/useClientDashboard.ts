import { useBookingsMyBookingsQuery } from '@/features/bookings/bookingsApi';
import { useFavoritesCountQuery } from '@/features/favorites/favoritesApi';
import { useLeadsMyListQuery } from '@/features/leads/leadsApi';
import { useReviewsMyQuery } from '@/features/reviews/reviewsApi';
import { extractItems } from '@/utils/data';
import type { ClientBooking, ClientLead, ClientReview } from '.';

export function useClientDashboard() {
  const bookings = useBookingsMyBookingsQuery();
  const favoritesCount = useFavoritesCountQuery();
  const leads = useLeadsMyListQuery();
  const reviews = useReviewsMyQuery();

  const bookingsList = (bookings.data ?? []) as ClientBooking[];
  const favoritesCountValue = favoritesCount.data?.count ?? 0;
  const leadsList = extractItems(leads.data) as ClientLead[];
  const reviewsList = (reviews.data ?? []) as ClientReview[];

  return {
    bookingsList,
    leadsList,
    reviewsList,
    bookingsCount: bookingsList.length,
    favoritesCount: favoritesCountValue,
    leadsCount: leadsList.length,
    reviewsCount: reviewsList.length,
    isLoading: bookings.isLoading || favoritesCount.isLoading || leads.isLoading || reviews.isLoading,
    isError: bookings.isError || favoritesCount.isError || leads.isError || reviews.isError,
  };
}
