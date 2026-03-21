import { api } from '@/services/api';
import type {
  BookingAvailableSlotsResponse,
  BookingDto,
  BookingRebookInfoResponse,
  BookingStatus,
  BookingsCalendarResponse,
} from '@/types';
import { unwrapObject, extractItems } from '@/utils/data';

export const bookingsApi = api.injectEndpoints({
  endpoints: (build) => ({
    bookingsCreate: build.mutation<
      BookingDto,
      { masterId: string; startTime: string; endTime: string; notes?: string; clientPhone?: string; clientName?: string; leadId?: string }
    >({
      query: (body) => ({ url: '/bookings', method: 'POST', data: body }),
      invalidatesTags: ['Bookings', 'Leads'],
    }),

    bookingsForMaster: build.query<BookingDto[], { masterId: string; status?: string }>({
      query: ({ masterId, status }) => ({
        url: `/bookings/master/${masterId}`,
        method: 'GET',
        params: status ? { status } : {},
      }),
      transformResponse: (raw: unknown) => extractItems<BookingDto>(raw),
      providesTags: ['Bookings'],
    }),

    bookingsCalendar: build.query<
      BookingsCalendarResponse,
      { masterId: string; status?: string; startDate?: string; endDate?: string }
    >({
      query: ({ masterId, status, startDate, endDate }) => ({
        url: `/bookings/master/${masterId}/calendar`,
        method: 'GET',
        params: { ...(status ? { status } : {}), ...(startDate ? { startDate } : {}), ...(endDate ? { endDate } : {}) },
      }),
      transformResponse: (raw: unknown) => unwrapObject<BookingsCalendarResponse>(raw),
      providesTags: ['Bookings', 'Leads'],
    }),

    bookingsMyBookings: build.query<BookingDto[], void>({
      query: () => ({ url: '/bookings/my-bookings', method: 'GET' }),
      transformResponse: (raw: unknown) => extractItems<BookingDto>(raw),
      providesTags: ['Bookings'],
    }),

    bookingsAvailableSlots: build.query<BookingAvailableSlotsResponse, { masterId: string; date: string }>({
      query: ({ masterId, date }) => ({
        url: `/bookings/master/${masterId}/available-slots`,
        method: 'GET',
        params: { date }
      }),
      transformResponse: (raw: unknown) => unwrapObject<BookingAvailableSlotsResponse>(raw),
    }),

    bookingsUpdateStatus: build.mutation<BookingDto, { id: string; status: BookingStatus }>({
      query: ({ id, status }) => ({ url: `/bookings/${id}/status`, method: 'PATCH', data: { status } }),
      invalidatesTags: ['Bookings'],
    }),

    bookingsClientConfirm: build.mutation<BookingDto, { id: string }>({
      query: ({ id }) => ({ url: `/bookings/${id}/confirm`, method: 'PATCH' }),
      invalidatesTags: ['Bookings', 'Leads'],
    }),

    bookingsClientReject: build.mutation<BookingDto, { id: string }>({
      query: ({ id }) => ({ url: `/bookings/${id}/reject`, method: 'PATCH' }),
      invalidatesTags: ['Bookings', 'Leads'],
    }),

    bookingsRebookInfo: build.query<BookingRebookInfoResponse, { bookingId: string }>({
      query: ({ bookingId }) => ({
        url: `/bookings/${bookingId}/rebook-info`,
        method: 'GET',
      }),
      transformResponse: (raw: unknown) => unwrapObject<BookingRebookInfoResponse>(raw),
    }),
  }),
});

export const {
  useBookingsCreateMutation,
  useBookingsForMasterQuery,
  useBookingsCalendarQuery,
  useBookingsMyBookingsQuery,
  useBookingsAvailableSlotsQuery,
  useBookingsUpdateStatusMutation,
  useBookingsClientConfirmMutation,
  useBookingsClientRejectMutation,
  useBookingsRebookInfoQuery,
} = bookingsApi;
