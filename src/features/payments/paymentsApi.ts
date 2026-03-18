import { api } from '@/services/api';
import type { CreatePaymentDto, PaymentDto } from '@/types';
import { isRecord } from '@/utils/guards';
import { unwrapObject } from '@/utils/data';

type CheckoutRedirectResponse = {
  url: string;
  pendingUpgrade?: boolean;
};

function toCheckoutRedirectResponse(raw: unknown): CheckoutRedirectResponse {
  const unwrapped = unwrapObject<unknown>(raw);
  const root = isRecord(unwrapped) ? unwrapped : null;
  if (!root) return { url: '' };

  const url =
    (typeof root.checkoutUrl === 'string' && root.checkoutUrl) ||
    (typeof root.url === 'string' && root.url) ||
    '';
  const pendingUpgrade =
    typeof root.pendingUpgrade === 'boolean' ? root.pendingUpgrade : undefined;

  return { url, pendingUpgrade };
}

export const paymentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    paymentsCreateCheckout: build.mutation<CheckoutRedirectResponse, CreatePaymentDto>({
      query: (body) => ({ url: '/payments/create-checkout', method: 'POST', data: body }),
      invalidatesTags: ['Payments'],
      transformResponse: (raw: unknown) => toCheckoutRedirectResponse(raw),
    }),
    paymentsCreateMiaCheckout: build.mutation<
      { qrUrl: string; qrId: string; orderId: string; paymentId: string },
      CreatePaymentDto
    >({
      query: (body) => ({ url: '/payments/create-mia-checkout', method: 'POST', data: body }),
      invalidatesTags: ['Payments'],
    }),
    paymentsSimulateMiaSandbox: build.mutation<{ ok: boolean; orderId: string }, { paymentId: string }>({
      query: (body) => ({ url: '/payments/mia-sandbox-simulate', method: 'POST', data: body }),
      invalidatesTags: ['Payments', 'Master'],
    }),
    paymentsForMaster: build.query<PaymentDto[], { masterId: string }>({
      query: ({ masterId }) => ({ url: `/payments/master/${masterId}`, method: 'GET' }),
      providesTags: (_r,_e,a)=>[{type:'Payments', id:a.masterId}],
      transformResponse: (raw: unknown) => {
        const unwrapped = unwrapObject<unknown>(raw);
        if (Array.isArray(unwrapped)) return unwrapped as PaymentDto[];
        if (isRecord(unwrapped) && Array.isArray(unwrapped.items)) return unwrapped.items as PaymentDto[];
        if (isRecord(unwrapped) && Array.isArray(unwrapped.data)) return unwrapped.data as PaymentDto[];
        return [];
      },
    }),
    paymentsStats: build.query<unknown, { masterId: string }>({
      query: ({ masterId }) => ({ url: `/payments/stats/${masterId}`, method: 'GET' }),
    }),
    paymentsMy: build.query<PaymentDto[], void>({
      query: () => ({ url: '/payments/my-payments', method: 'GET' }),
      providesTags: ['Payments'],
      transformResponse: (raw: unknown) => {
        const unwrapped = unwrapObject<unknown>(raw);
        if (Array.isArray(unwrapped)) return unwrapped as PaymentDto[];
        if (isRecord(unwrapped) && Array.isArray(unwrapped.items)) return unwrapped.items as PaymentDto[];
        if (isRecord(unwrapped) && Array.isArray(unwrapped.data)) return unwrapped.data as PaymentDto[];
        return [];
      },
    }),
    paymentsConfirmPendingUpgrade: build.mutation<CheckoutRedirectResponse, void>({
      query: () => ({ url: '/payments/confirm-pending-upgrade', method: 'POST' }),
      invalidatesTags: ['Payments', 'Master'],
      transformResponse: (raw: unknown) => toCheckoutRedirectResponse(raw),
    }),
    paymentsCancelPendingUpgrade: build.mutation<unknown, void>({
      query: () => ({ url: '/payments/cancel-pending-upgrade', method: 'POST' }),
      invalidatesTags: ['Payments', 'Master'],
    }),
    paymentsCancelTariffAtPeriodEnd: build.mutation<
      { message?: string; tariffExpiresAt?: string },
      void
    >({
      query: () => ({ url: '/payments/cancel-tariff-at-period-end', method: 'POST' }),
      invalidatesTags: ['Payments', 'Master'],
      transformResponse: (raw: unknown) =>
        unwrapObject<{ message?: string; tariffExpiresAt?: string }>(raw),
    }),
  }),
});

export const {
  usePaymentsCreateCheckoutMutation,
  usePaymentsCreateMiaCheckoutMutation,
  usePaymentsSimulateMiaSandboxMutation,
  usePaymentsForMasterQuery,
  usePaymentsStatsQuery,
  usePaymentsMyQuery,
  usePaymentsConfirmPendingUpgradeMutation,
  usePaymentsCancelPendingUpgradeMutation,
  usePaymentsCancelTariffAtPeriodEndMutation,
} = paymentsApi;
