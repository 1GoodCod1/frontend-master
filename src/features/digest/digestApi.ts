import { api } from '@/services/api';
import { unwrapEnvelope } from '@/utils/data';

export interface DigestStatusResponse {
  subscribed: boolean;
}

export const digestApi = api.injectEndpoints({
  endpoints: (build) => ({
    digestStatus: build.query<DigestStatusResponse, void>({
      query: () => ({ url: '/digest/status', method: 'GET' }),
      transformResponse: (raw: unknown): DigestStatusResponse => {
        const u = unwrapEnvelope(raw);
        if (u && typeof u === 'object' && 'subscribed' in u) {
          return { subscribed: Boolean((u as { subscribed: unknown }).subscribed) };
        }
        return { subscribed: false };
      },
      providesTags: ['Digest'],
    }),

    digestSubscribe: build.mutation<{ success: boolean }, void>({
      query: () => ({ url: '/digest/subscribe', method: 'POST' }),
      invalidatesTags: ['Digest'],
    }),

    digestUnsubscribe: build.mutation<{ success: boolean }, void>({
      query: () => ({ url: '/digest/subscribe', method: 'DELETE' }),
      invalidatesTags: ['Digest'],
    }),
  }),
});

export const {
  useDigestStatusQuery,
  useDigestSubscribeMutation,
  useDigestUnsubscribeMutation,
} = digestApi;
