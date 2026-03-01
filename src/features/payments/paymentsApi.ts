import { api } from '@/services/api';
import type { ApiEnvelope, CreatePaymentDto, PaymentDto } from '@/types';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function unwrapEnvelope<T>(raw: ApiEnvelope<T> | unknown): T {
  if (isObject(raw) && 'data' in raw) {
    const d = (raw as Record<string, unknown>).data;
    if (d !== undefined) return d as T;
  }
  return raw as T;
}

type CheckoutRedirectResponse = {
  url: string;
  pendingUpgrade?: boolean;
};

function toCheckoutRedirectResponse(raw: unknown): CheckoutRedirectResponse {
  const unwrapped = unwrapEnvelope<unknown>(raw);
  const root = isObject(unwrapped) ? unwrapped : null;
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
        const unwrapped = unwrapEnvelope<unknown>(raw);
        if (Array.isArray(unwrapped)) return unwrapped as PaymentDto[];
        if (isObject(unwrapped) && Array.isArray(unwrapped.items)) return unwrapped.items as PaymentDto[];
        if (isObject(unwrapped) && Array.isArray(unwrapped.data)) return unwrapped.data as PaymentDto[];
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
        const unwrapped = unwrapEnvelope<unknown>(raw);
        if (Array.isArray(unwrapped)) return unwrapped as PaymentDto[];
        if (isObject(unwrapped) && Array.isArray(unwrapped.items)) return unwrapped.items as PaymentDto[];
        if (isObject(unwrapped) && Array.isArray(unwrapped.data)) return unwrapped.data as PaymentDto[];
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
        unwrapEnvelope<{ message?: string; tariffExpiresAt?: string }>(raw),
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
