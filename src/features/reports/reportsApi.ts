import { api } from '@/services/api';

export const reportsApi = api.injectEndpoints({
  endpoints: (build) => ({
    reportsCreate: build.mutation<
      unknown,
      {
        masterId: string;
        leadId?: string;
        reason: string;
        description: string;
        evidence?: string[];
      }
    >({
      query: (body) => ({ url: '/reports', method: 'POST', data: body }),
      invalidatesTags: ['Reports'],
    }),

    reportsMy: build.query<unknown, void>({
      query: () => ({ url: '/reports/my-reports', method: 'GET' }),
      providesTags: ['Reports'],
    }),

    reportsAgainstMeCount: build.query<{ count: number }, void>({
      query: () => ({ url: '/reports/reports-against-me', method: 'GET' }),
      providesTags: ['Reports'],
    }),

    reportsList: build.query<unknown, { status?: string } | void>({
      query: (params) => ({ url: '/reports', method: 'GET', params: params ?? {} }),
      providesTags: ['Reports'],
    }),

    reportsUpdateStatus: build.mutation<
      unknown,
      { id: string; status: string; action?: string; notes?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/reports/${id}/status`, method: 'PATCH', data: body }),
      invalidatesTags: ['Reports'],
    }),
  }),
});

export const {
  useReportsCreateMutation,
  useReportsMyQuery,
  useReportsListQuery,
  useReportsUpdateStatusMutation,
  useReportsAgainstMeCountQuery,
} = reportsApi;
