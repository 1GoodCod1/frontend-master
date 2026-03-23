import { useBookingsMyBookingsQuery } from '@/features/bookings/bookingsApi';
import { useFavoritesCountQuery } from '@/features/favorites/favoritesApi';
import { useLeadsMyListQuery } from '@/features/leads/leadsApi';
import { useReviewsMyQuery } from '@/features/reviews/reviewsApi';
import { extractItems } from '@/utils/data';
import type { ClientBooking, ClientLead, ClientReview } from '.';

/**
 * Данные мастера/сервера не попадают в RTK мутацию клиента — обновляем запросы:
 * при возврате на вкладку, при повторном заходе на дашборд, после reconnect.
 * Дополнительно `services/socket.ts` инвалидирует Leads/Reviews/Bookings по WS-событиям.
 */
const DASHBOARD_REFETCH = {
  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  /** Пока WS/уведомление не дошли — подстраховка (вкладка активна). */
  pollingInterval: 12_000,
  skipPollingIfUnfocused: true,
} as const;

export function useClientDashboard() {
  const bookings = useBookingsMyBookingsQuery(undefined, DASHBOARD_REFETCH);
  const favoritesCount = useFavoritesCountQuery();
  const leads = useLeadsMyListQuery(undefined, DASHBOARD_REFETCH);
  const reviews = useReviewsMyQuery(undefined, DASHBOARD_REFETCH);

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
