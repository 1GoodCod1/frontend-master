import { api } from '@/services/api';

export const analyticsApi = api.injectEndpoints({
  endpoints: (build) => ({
    analyticsMaster: build.query<unknown, { masterId: string; days?: number }>({
      query: ({ masterId, days }) => ({ url: `/analytics/master/${masterId}`, method: 'GET', params: days ? { days } : {} }),
      providesTags: ['Analytics'],
    }),
    analyticsBusiness: build.query<unknown, { days?: number } | void>({
      query: (params) => ({ url: '/analytics/business', method: 'GET', params: params ?? {} }),
      providesTags: ['Analytics'],
    }),
    analyticsSystem: build.query<unknown, void>({
      query: () => ({ url: '/analytics/system', method: 'GET' }),
      providesTags: ['Analytics'],
    }),
    analyticsMy: build.query<unknown, { days?: number } | void>({
      query: (params) => ({ url: '/analytics/my-analytics', method: 'GET', params: params ?? {} }),
      providesTags: ['Analytics'],
    }),
  }),
});

export const { useAnalyticsMasterQuery, useAnalyticsBusinessQuery, useAnalyticsSystemQuery, useAnalyticsMyQuery } = analyticsApi;
