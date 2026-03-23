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
    /** Aggregates for filters only — no page/limit; stable when switching table pages */
    adminUsersStats: build.query<
      unknown,
      { role?: string; verified?: boolean; banned?: boolean } | void
    >({
      query: (params) => ({ url: '/admin/users/stats', method: 'GET', params: params ?? {} }),
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
    adminMastersStats: build.query<
      unknown,
      { verified?: boolean; featured?: boolean; tariff?: string } | void
    >({
      query: (params) => ({ url: '/admin/masters/stats', method: 'GET', params: params ?? {} }),
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
    adminLeadsStats: build.query<
      unknown,
      { dateFrom?: string; dateTo?: string } | void
    >({
      query: (params) => ({ url: '/admin/leads/stats', method: 'GET', params: params ?? {} }),
      providesTags: ['Leads'],
    }),
    adminLeadsExport: build.query<
      unknown,
      { status?: string; dateFrom?: string; dateTo?: string } | void
    >({
      query: (params) => ({ url: '/admin/leads/export', method: 'GET', params: params ?? {} }),
    }),
    adminReviews: build.query<unknown, (PagedQuery & { status?: string }) | void>({
      query: (params) => ({ url: '/admin/reviews', method: 'GET', params: params ?? {} }),
      providesTags: ['Reviews'],
    }),
    adminReviewsStats: build.query<unknown, void>({
      query: () => ({ url: '/admin/reviews/stats', method: 'GET' }),
      providesTags: ['Reviews'],
    }),
    adminReviewsExport: build.query<unknown, { status?: string } | void>({
      query: (params) => ({ url: '/admin/reviews/export', method: 'GET', params: params ?? {} }),
    }),
    adminModerateReview: build.mutation<unknown, { id: string }>({
      query: ({ id }) => ({ url: `/admin/reviews/${id}/moderate`, method: 'PUT' }),
      invalidatesTags: ['Reviews'],
    }),
    adminPayments: build.query<unknown, (PagedQuery & { status?: string }) | void>({
      query: (params) => ({ url: '/admin/payments', method: 'GET', params: params ?? {} }),
      providesTags: ['Payments'],
    }),
    adminPaymentsStats: build.query<unknown, void>({
      query: () => ({ url: '/admin/payments/stats', method: 'GET' }),
      providesTags: ['Payments'],
    }),
    adminPaymentsExport: build.query<unknown, { status?: string } | void>({
      query: (params) => ({ url: '/admin/payments/export', method: 'GET', params: params ?? {} }),
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
    adminReferralsEnabled: build.query<{ enabled: boolean }, void>({
      query: () => ({ url: '/admin/settings/referrals', method: 'GET' }),
      transformResponse: (raw: unknown) => {
        const r = raw && typeof raw === 'object' && 'data' in raw
          ? (raw as { data?: unknown }).data
          : raw;
        return r && typeof r === 'object' && 'enabled' in r
          ? { enabled: !!(r as { enabled: boolean }).enabled }
          : { enabled: true };
      },
      providesTags: ['Admin'],
    }),
    adminSetReferralsEnabled: build.mutation<{ enabled: boolean }, boolean>({
      query: (enabled) => ({
        url: '/admin/settings/referrals',
        method: 'PUT',
        data: { enabled },
      }),
      invalidatesTags: ['Admin'],
    }),
    adminInvalidateTariffsCache: build.mutation<{ invalidated: number }, void>({
      query: () => ({ url: '/admin/cache/tariffs/invalidate', method: 'POST' }),
      invalidatesTags: ['Tariffs'],
    }),
    adminDigestStats: build.query<{ subscriberCount: number }, void>({
      query: () => ({ url: '/admin/digest/stats', method: 'GET' }),
      transformResponse: (raw: unknown) => {
        const r = raw && typeof raw === 'object' && 'data' in raw
          ? (raw as { data?: unknown }).data
          : raw;
        return r && typeof r === 'object' && 'subscriberCount' in r
          ? { subscriberCount: Number((r as { subscriberCount: unknown }).subscriberCount) }
          : { subscriberCount: 0 };
      },
      providesTags: ['Admin'],
    }),
    adminSendDigestNow: build.mutation<{ sent: number }, void>({
      query: () => ({ url: '/admin/digest/send-now', method: 'POST' }),
      invalidatesTags: ['Admin'],
    }),
    adminDigestSubscribers: build.query<{
      items: Array<{ id: string; userId: string; subscribedAt: string; user: { id: string; email: string | null; firstName: string | null; lastName: string | null; role: string; preferredLanguage: string | null } }>;
      meta: { total: number; page: number; limit: number; totalPages: number };
    }, { page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/admin/digest/subscribers', method: 'GET', params: params ?? {} }),
      transformResponse: (raw: unknown) => {
        const r = raw && typeof raw === 'object' && 'data' in raw
          ? (raw as { data?: unknown }).data
          : raw;
        if (!r || typeof r !== 'object' || !('items' in r)) {
          return { items: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
        }
        const d = r as { items: unknown[]; meta?: { total?: number; page?: number; limit?: number; totalPages?: number } };
        return {
          items: (Array.isArray(d.items) ? d.items : []) as Array<{ id: string; userId: string; subscribedAt: string; user: { id: string; email: string | null; firstName: string | null; lastName: string | null; role: string; preferredLanguage: string | null } }>,
          meta: {
            total: d.meta?.total ?? 0,
            page: d.meta?.page ?? 1,
            limit: d.meta?.limit ?? 20,
            totalPages: d.meta?.totalPages ?? 0,
          },
        };
      },
      providesTags: ['Admin'],
    }),
    adminUnsubscribeDigest: build.mutation<{ success: boolean }, string>({
      query: (userId) => ({ url: `/admin/digest/subscribers/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['Admin'],
    }),
    adminBroadcastTemplates: build.query<string[], void>({
      query: () => ({ url: '/admin/email/templates', method: 'GET' }),
      transformResponse: (raw: unknown) => {
        const r = raw && typeof raw === 'object' && 'data' in raw
          ? (raw as { data?: unknown }).data
          : raw;
        const d = r && typeof r === 'object' && 'templates' in r
          ? (r as { templates: unknown }).templates
          : [];
        return Array.isArray(d) ? d.map(String) : [];
      },
      providesTags: ['Admin'],
    }),
    adminDigestAnnouncement: build.query<string, void>({
      query: () => ({ url: '/admin/digest/announcement', method: 'GET' }),
      transformResponse: (raw: unknown) => {
        const r = raw && typeof raw === 'object' && 'data' in raw
          ? (raw as { data?: unknown }).data
          : raw;
        return typeof r === 'string' ? r : '';
      },
      providesTags: ['Admin'],
    }),
    adminSetDigestAnnouncement: build.mutation<string, string>({
      query: (value) => ({
        url: '/admin/digest/announcement',
        method: 'PUT',
        data: { value },
      }),
      invalidatesTags: ['Admin'],
    }),
    adminTemplateIds: build.query<string[], void>({
      query: () => ({ url: '/admin/email/template-ids', method: 'GET' }),
      transformResponse: (raw: unknown) => {
        const r = raw && typeof raw === 'object' && 'data' in raw
          ? (raw as { data?: unknown }).data
          : raw;
        return Array.isArray(r) ? r.map(String) : [];
      },
      providesTags: ['Admin'],
    }),
    adminTemplateDefault: build.query<
      { subject: string; bodyHtml: string },
      { templateId: string; lang: string }
    >({
      query: ({ templateId, lang }) => ({
        url: `/admin/email/template-default/${encodeURIComponent(templateId)}/${encodeURIComponent(lang)}`,
        method: 'GET',
      }),
      transformResponse: (raw: unknown) => {
        const r = raw && typeof raw === 'object' && 'data' in raw
          ? (raw as { data?: unknown }).data
          : raw;
        const d = r && typeof r === 'object' && 'subject' in r && 'bodyHtml' in r
          ? (r as { subject: string; bodyHtml: string })
          : { subject: '', bodyHtml: '' };
        return { subject: String(d.subject ?? ''), bodyHtml: String(d.bodyHtml ?? '') };
      },
      providesTags: ['Admin'],
    }),
    adminTemplateOverrides: build.query<
      Array<{ templateId: string; lang: string; subject: string | null; bodyHtml: string | null }>,
      void
    >({
      query: () => ({ url: '/admin/email/template-overrides', method: 'GET' }),
      transformResponse: (raw: unknown) => {
        const r = raw && typeof raw === 'object' && 'data' in raw
          ? (raw as { data?: unknown }).data
          : raw;
        return Array.isArray(r) ? r : [];
      },
      providesTags: ['Admin'],
    }),
    adminSetTemplateOverride: build.mutation<
      { success: boolean },
      { templateId: string; lang: string; subject?: string; bodyHtml?: string }
    >({
      query: ({ templateId, lang, ...body }) => ({
        url: `/admin/email/template-overrides/${encodeURIComponent(templateId)}/${encodeURIComponent(lang)}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Admin'],
    }),
    adminSendBroadcast: build.mutation<
      { total: number; sent: number; failed: number },
      { segment: string; templateName: string; sinceDate?: string }
    >({
      query: (body) => ({ url: '/admin/email/broadcast', method: 'POST', data: body }),
      invalidatesTags: ['Admin'],
    }),
  }),
});

export const {
  useAdminDashboardQuery,
  useAdminUsersQuery,
  useAdminUsersStatsQuery,
  useAdminUpdateUserMutation,
  useAdminMastersQuery,
  useAdminMastersStatsQuery,
  useAdminUpdateMasterMutation,
  useAdminLeadsQuery,
  useAdminLeadsStatsQuery,
  useLazyAdminLeadsExportQuery,
  useAdminReviewsQuery,
  useAdminReviewsStatsQuery,
  useLazyAdminReviewsExportQuery,
  useAdminModerateReviewMutation,
  useAdminPaymentsQuery,
  useAdminPaymentsStatsQuery,
  useLazyAdminPaymentsExportQuery,
  useAdminAnalyticsQuery,
  useAdminCreateBackupMutation,
  useAdminListBackupsQuery,
  useAdminSystemInfoQuery,
  useAdminReferralsEnabledQuery,
  useAdminSetReferralsEnabledMutation,
  useAdminInvalidateTariffsCacheMutation,
  useAdminDigestStatsQuery,
  useAdminSendDigestNowMutation,
  useAdminDigestSubscribersQuery,
  useAdminUnsubscribeDigestMutation,
  useAdminBroadcastTemplatesQuery,
  useAdminSendBroadcastMutation,
  useAdminDigestAnnouncementQuery,
  useAdminSetDigestAnnouncementMutation,
  useAdminTemplateIdsQuery,
  useAdminTemplateDefaultQuery,
  useAdminTemplateOverridesQuery,
  useAdminSetTemplateOverrideMutation,
} = adminApi;
