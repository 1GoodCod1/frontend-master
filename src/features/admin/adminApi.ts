import { api } from '@/services/api';

export type PagedQuery = { limit?: number; page?: number; cursor?: string };

export const adminApi = api.injectEndpoints({
  endpoints: (build) => ({
    adminDashboard: build.query<unknown, void>({
      query: () => ({ url: '/admin/dashboard', method: 'GET' }),
      providesTags: ['Admin'],
    }),
    adminUsers: build.query<
      unknown,
      (PagedQuery & { role?: string; verified?: boolean; banned?: boolean; q?: string }) | void
    >({
      query: (params) => ({ url: '/admin/users', method: 'GET', params: params ?? {} }),
      providesTags: ['Users'],
    }),
    adminUpdateUser: build.mutation<unknown, { id: string }>({
      query: ({ id }) => ({ url: `/admin/users/${id}`, method: 'PUT' }),
      invalidatesTags: ['Users'],
    }),
    adminMasters: build.query<
      unknown,
      (PagedQuery & { verified?: boolean; featured?: boolean; tariff?: string; q?: string }) | void
    >({
      query: (params) => ({ url: '/admin/masters', method: 'GET', params: params ?? {} }),
      providesTags: ['Masters'],
    }),
    adminUpdateMaster: build.mutation<unknown, { id: string }>({
      query: ({ id }) => ({ url: `/admin/masters/${id}`, method: 'PUT' }),
      invalidatesTags: ['Masters', 'Master'],
    }),
    adminLeads: build.query<
      unknown,
      (PagedQuery & { status?: string; dateFrom?: string; dateTo?: string }) | void
    >({
      query: (params) => ({ url: '/admin/leads', method: 'GET', params: params ?? {} }),
      providesTags: ['Leads'],
    }),
    adminReviews: build.query<unknown, (PagedQuery & { status?: string }) | void>({
      query: (params) => ({ url: '/admin/reviews', method: 'GET', params: params ?? {} }),
      providesTags: ['Reviews'],
    }),
    adminModerateReview: build.mutation<unknown, { id: string }>({
      query: ({ id }) => ({ url: `/admin/reviews/${id}/moderate`, method: 'PUT' }),
      invalidatesTags: ['Reviews'],
    }),
    adminPayments: build.query<unknown, (PagedQuery & { status?: string }) | void>({
      query: (params) => ({ url: '/admin/payments', method: 'GET', params: params ?? {} }),
      providesTags: ['Payments'],
    }),
    adminAnalytics: build.query<unknown, { timeframe?: 'day' | 'week' | 'month' } | void>({
      query: (params) => ({ url: '/admin/analytics', method: 'GET', params: params ?? {} }),
      providesTags: ['Analytics'],
    }),
    adminCreateBackup: build.mutation<unknown, void>({
      query: () => ({ url: '/admin/backup', method: 'POST' }),
      invalidatesTags: ['Admin'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(adminApi.util.invalidateTags(['Admin']));
        } catch {
          // ignore invalidation errors
        }
      },
    }),
    adminListBackups: build.query<unknown, void>({
      query: () => ({ url: '/admin/backups', method: 'GET' }),
      providesTags: ['Admin'],
    }),
    adminSystemInfo: build.query<unknown, void>({
      query: () => ({ url: '/admin/system/info', method: 'GET' }),
    }),
    adminInvalidateTariffsCache: build.mutation<{ invalidated: number }, void>({
      query: () => ({ url: '/admin/cache/tariffs/invalidate', method: 'POST' }),
      invalidatesTags: ['Tariffs'],
    }),
  }),
});

export const {
  useAdminDashboardQuery,
  useAdminUsersQuery,
  useAdminUpdateUserMutation,
  useAdminMastersQuery,
  useAdminUpdateMasterMutation,
  useAdminLeadsQuery,
  useAdminReviewsQuery,
  useAdminModerateReviewMutation,
  useAdminPaymentsQuery,
  useAdminAnalyticsQuery,
  useAdminCreateBackupMutation,
  useAdminListBackupsQuery,
  useAdminSystemInfoQuery,
  useAdminInvalidateTariffsCacheMutation,
} = adminApi;
