import { api } from '@/services/api';
import { unwrapAuditStatsPayload, unwrapEnvelope } from '@/utils/data';

export type AuditCleanupRequest = {
  dryRun?: boolean;
  olderThan?: string;
  confirmDeleteWithoutDate?: boolean;
  mode: 'non_consent' | 'groups' | 'actions';
  groups?: string[];
  actions?: string[];
};

export type AuditCleanupResult = {
  deleted: number;
  wouldDelete: number;
  dryRun: boolean;
};

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
      transformResponse: (raw: unknown) => unwrapAuditStatsPayload(raw) ?? raw,
    }),

    auditCleanup: build.mutation<AuditCleanupResult, AuditCleanupRequest>({
      query: (body) => ({ url: '/audit/cleanup', method: 'POST', data: body }),
      transformResponse: (raw: unknown) => {
        const u = unwrapEnvelope(raw);
        if (u && typeof u === 'object' && 'deleted' in u && 'wouldDelete' in u) {
          return u as AuditCleanupResult;
        }
        return raw as AuditCleanupResult;
      },
      invalidatesTags: ['Audit'],
    }),
  }),
});

export const {
  useAuditLogsQuery,
  useAuditStreamQuery,
  useAuditStatsQuery,
  useAuditCleanupMutation,
} = auditApi;
