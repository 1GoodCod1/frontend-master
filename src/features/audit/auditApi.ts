import { api } from '@/services/api';

export const auditApi = api.injectEndpoints({
  endpoints: (build) => ({
    auditLogs: build.query<
      unknown,
      | {
          userId?: string;
          action?: string;
          startDate?: string;
          endDate?: string;
          limit?: number;
          page?: number;
        }
      | void
    >({
      query: (params) => ({ url: '/audit/logs', method: 'GET', params: params ?? {} }),
      providesTags: ['Audit'],
    }),

    auditStream: build.query<unknown, { limit?: number } | void>({
      query: (params) => ({ url: '/audit/stream', method: 'GET', params: params ?? {} }),
    }),

    auditStats: build.query<unknown, { timeframe?: 'day' | 'week' | 'month' } | void>({
      query: (params) => ({ url: '/audit/stats', method: 'GET', params: params ?? {} }),
    }),
  }),
});

export const { useAuditLogsQuery, useAuditStreamQuery, useAuditStatsQuery } = auditApi;
