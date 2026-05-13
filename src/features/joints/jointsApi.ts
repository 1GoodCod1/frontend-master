import { api } from '@/services/api';
import { unwrapObject } from '@/utils/data';
import type {
  JointsBalanceDto,
  JointsTransactionsResponse,
} from '@/types';

export const jointsApi = api.injectEndpoints({
  endpoints: (build) => ({
    jointsBalance: build.query<JointsBalanceDto, void>({
      query: () => ({ url: '/joints/balance', method: 'GET' }),
      providesTags: ['Joints'],
      keepUnusedDataFor: 60,
      transformResponse: (raw: unknown) =>
        (unwrapObject<JointsBalanceDto>(raw) ?? { balance: 0 }),
    }),

    jointsTransactions: build.query<
      JointsTransactionsResponse,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/joints/transactions',
        method: 'GET',
        params: params ?? {},
      }),
      providesTags: ['Joints'],
      transformResponse: (raw: unknown) => {
        const obj = unwrapObject<JointsTransactionsResponse>(raw);
        return obj ?? { items: [], total: 0, page: 1, limit: 20 };
      },
    }),

    jointsPurchase: build.mutation<{ message: string }, { amount: number }>({
      query: (body) => ({ url: '/joints/purchase', method: 'POST', data: body }),
      invalidatesTags: ['Joints'],
      transformResponse: (raw: unknown) =>
        (unwrapObject<{ message: string }>(raw) ?? { message: 'Done' }),
    }),
  }),
});

export const {
  useJointsBalanceQuery,
  useJointsTransactionsQuery,
  useJointsPurchaseMutation,
} = jointsApi;
